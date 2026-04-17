const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { authenticate } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

// Import TigerGraph MCP connection getter for schema fetching
let getMCPConnection;
try {
  getMCPConnection = require('./tigergraph').getMCPConnection;
} catch (error) {
  console.warn('⚠️ TigerGraph MCP integration not available:', error.message);
  getMCPConnection = () => null;
}

// Initialize Gemini (will use API key from env)
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Log API key status (without exposing the key)
if (genAI) {
  console.log('✅ GSQL AI: Gemini API initialized');
} else {
  console.warn('⚠️ GSQL AI: GEMINI_API_KEY not found in environment variables');
}

// =============================================================================
// RAG: GSQL Knowledge Base Loading and Retrieval
// =============================================================================
let gsqlKnowledgeBaseChunks = null;

function loadGSQLKnowledgeBase() {
  try {
    const kbPath = path.join(__dirname, '../data/gsql-knowledge-base.md');
    
    if (!fs.existsSync(kbPath)) {
      console.warn('⚠️  GSQL Knowledge base file not found at:', kbPath);
      return [];
    }
    
    const content = fs.readFileSync(kbPath, 'utf-8');
    const chunks = [];
    
    // Split by section headers (## GSQL_)
    // First element will be intro text before first section, skip it
    const sections = content.split(/^##\s+GSQL_/gm);
    
    // Find all section headers with their positions for proper extraction
    const sectionMatches = [...content.matchAll(/^##\s+(GSQL_[^\n]+)/gm)];
    
    sectionMatches.forEach((match, index) => {
      const title = match[1].trim();
      const startPos = match.index + match[0].length;
      const endPos = index < sectionMatches.length - 1 
        ? sectionMatches[index + 1].index 
        : content.length;
      
      let sectionContent = content.substring(startPos, endPos).trim();
      
      // Skip very short chunks
      if (sectionContent.length < 50) return;
      
      // Extract subsection titles (### ) and include them in content for better matching
      const subsectionMatches = sectionContent.match(/^###\s+([^\n]+)/gm);
      if (subsectionMatches) {
        const subsectionTitles = subsectionMatches.map(m => m.replace(/^###\s+/, '').trim()).join(' ');
        sectionContent = subsectionTitles + ' ' + sectionContent;
      }
      
      chunks.push({
        id: index,
        title: title,
        content: sectionContent,
        keywords: extractGSQLKeywords(sectionContent)
      });
    });
    
    console.log(`✅ Loaded ${chunks.length} GSQL knowledge base chunks`);
    return chunks;
  } catch (error) {
    console.error('Error loading GSQL knowledge base:', error);
    return [];
  }
}

function extractGSQLKeywords(text) {
  // Extract GSQL-specific keywords
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  // Count frequency
  const freq = {};
  words.forEach(word => freq[word] = (freq[word] || 0) + 1);
  
  // Return top keywords
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

function retrieveRelevantGSQLChunks(query, schema, chunks, topK = 7) {
  if (!chunks || chunks.length === 0) return [];
  
  // Combine query and schema for better matching
  const searchText = `${query} ${schema || ''}`.toLowerCase();
  const searchWords = searchText.split(/\s+/).filter(w => w.length > 2);
  
  // Score each chunk
  const scoredChunks = chunks.map(chunk => {
    let score = 0;
    const chunkText = chunk.content.toLowerCase();
    const chunkTitle = chunk.title.toLowerCase();
    
    // Exact phrase match (highest score)
    if (chunkText.includes(searchText)) {
      score += 100;
    }
    
    // Exact word matches in title (very high priority)
    searchWords.forEach(word => {
      const titleWords = chunkTitle.split(/[\s_]+/);
      if (titleWords.some(tw => tw === word)) {
        score += 30;
      } else if (chunkTitle.includes(word)) {
        score += 20;
      }
    });
    
    // Content word matches
    searchWords.forEach(word => {
      const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
      if (wordRegex.test(chunkText)) {
        score += 15;
      } else if (chunkText.includes(word)) {
        score += 10;
      }
      
      // Bonus for keyword matches
      if (chunk.keywords && chunk.keywords.includes(word)) {
        score += 5;
      }
    });
    
    return { ...chunk, score };
  });
  
  // Sort by score and return top K
  return scoredChunks
    .sort((a, b) => b.score - a.score)
    .filter(chunk => chunk.score > 0)
    .slice(0, topK);
}

function formatGSQLRAGContext(chunks) {
  if (!chunks || chunks.length === 0) return '';
  
  return chunks
    .map((chunk, index) => `[Context ${index + 1}: ${chunk.title}]\n${chunk.content}`)
    .join('\n\n---\n\n');
}

// =============================================================================
// GSQL AI GENERATION SYSTEM PROMPT (Base - Enhanced with RAG)
// =============================================================================
const GSQL_AI_SYSTEM_PROMPT_BASE = `You are an expert GSQL (TigerGraph Query Language) code generator with deep knowledge of graph databases, query optimization, and TigerGraph best practices. Your role is to generate production-ready, optimized, and accurate GSQL queries.

## YOUR CORE IDENTITY
- **Expert GSQL Developer**: Generate syntactically correct, semantically sound GSQL queries
- **Production-Ready Code**: All code must be runnable, optimized, and follow best practices
- **Schema-Aware**: Always respect provided schema information (vertex types, edge types, attributes, data types)
- **Performance-Conscious**: Optimize traversal patterns, use appropriate accumulators, minimize unnecessary hops

## GSQL LANGUAGE FUNDAMENTALS

GSQL is a Turing-complete, SQL-like graph query language designed for complex analytics:
- **Pattern-based querying** using ASCII art syntax (e.g., \`FROM Start:s -(EdgeType:e)-> Target:t\`)
- **Accumulator-based aggregation** leveraging TigerGraph's MPP (Massively Parallel Processing)
- **Full control flow** support (IF, WHILE, FOREACH, BREAK, CONTINUE, CASE)
- **Distributed execution** for scalability

## QUERY STRUCTURE REQUIREMENTS

1. **CREATE QUERY Syntax**:
   \`\`\`gsql
   CREATE [OR REPLACE] [DISTRIBUTED] QUERY query_name(parameter_list) 
   FOR GRAPH graph_name {
     // Variable declarations
     // Query body
     // Output statements
   }
   \`\`\`

2. **Essential Components**:
   - Parameter list with proper types (vertex<T>, edge<T>, primitive types)
   - Vertex set initialization: \`Start = {vertex_set};\`
   - SELECT statements with FROM, WHERE, ACCUM, POST-ACCUM clauses
   - Output statements: PRINT, FILE println

## PATTERN MATCHING PATTERNS

**Node Pattern**: \`SELECT t FROM Start:s\`
**Edge Pattern**: \`SELECT t FROM Start:s -(EdgeType:e)-> Target:t\`
**Path Pattern**: \`SELECT t FROM Start:s -(Edge1:e1)-> :v -(Edge2:e2)-> Target:t\`

**Key Rules**:
- Use FROM clause to define vertex sets
- Use WHERE clause for filtering (vertex/edge attributes, conditions)
- Use ACCUM for edge-level aggregations
- Use POST-ACCUM for vertex-level operations after traversal

## ACCUMULATORS - CHOOSE WISELY

**Numeric Accumulators**:
- \`SumAccum<T>\`: Summation (INT, FLOAT, DOUBLE)
- \`MaxAccum<T>\`: Maximum value
- \`MinAccum<T>\`: Minimum value
- \`AvgAccum\`: Average (automatic)

**Collection Accumulators**:
- \`ListAccum<T>\`: Ordered list
- \`SetAccum<T>\`: Unique set (use for deduplication)
- \`MapAccum<K, V>\`: Key-value mapping
- \`HeapAccum<Tuple>(size, key)\`: Top-K results

**Boolean Accumulators**:
- \`AndAccum\`: Logical AND
- \`OrAccum\`: Logical OR

**Advanced Accumulators**:
- \`GroupByAccum<K, V>\`: Grouped aggregations
- \`BagAccum<T>\`: Multiset (allows duplicates)

**Accumulator Scope**:
- \`@attribute\`: Vertex-attached (local to each vertex)
- \`@@global\`: Global accumulator (shared across all vertices)

## CONTROL FLOW STATEMENTS

**IF-THEN-ELSE**:
\`\`\`gsql
IF condition THEN
  statements;
ELSE
  statements;
END;
\`\`\`

**WHILE Loop**:
\`\`\`gsql
WHILE condition LIMIT maxIterations DO
  statements;
END;
\`\`\`

**FOREACH Loop**:
\`\`\`gsql
FOREACH item IN collection DO
  statements;
END;
\`\`\`

**BREAK/CONTINUE**: Use within loops for early exit or skipping iterations

## SCHEMA INTEGRATION GUIDELINES

When schema information is provided:
1. **Parse schema carefully**: Identify vertex types, edge types, attributes, and data types
2. **Use correct types**: Match vertex/edge types exactly as defined in schema
3. **Respect attribute types**: Use correct data types (INT, FLOAT, STRING, DATETIME, etc.)
4. **Handle composite keys**: If vertices have composite keys, use tuple syntax
5. **Check constraints**: Respect NOT NULL, DEFAULT values, and other constraints
6. **Edge direction**: Understand directed vs undirected edges

**Example Schema-Aware Generation**:
If schema shows: \`CREATE VERTEX Person (PRIMARY_ID id STRING, name STRING, age INT)\`
Then use: \`vertex<Person>\` and access attributes as \`v.name\`, \`v.age\`

## OUTPUT FORMAT REQUIREMENTS

Always provide output in this exact format:

\`\`\`gsql
[Complete, runnable GSQL query code]
\`\`\`

**Explanation**: [2-3 sentence explanation of what the query does]

**Key Features**:
- [Feature 1]
- [Feature 2]
- [Feature 3]

**Usage Example**:
\`\`\`gsql
INSTALL QUERY query_name
RUN QUERY query_name("parameter_value")
\`\`\`

## BEST PRACTICES CHECKLIST

Before generating code, ensure:
- [ ] Query syntax is correct (CREATE QUERY, proper braces, semicolons)
- [ ] Vertex/edge types match schema exactly
- [ ] Appropriate accumulators chosen for the task
- [ ] WHERE clauses used for efficient filtering
- [ ] POST-ACCUM used for vertex-level operations
- [ ] Meaningful variable names (not just s, t, v)
- [ ] Comments added for complex logic
- [ ] Edge cases handled (empty results, null values)
- [ ] Traversal patterns optimized (minimize hops)
- [ ] Global accumulators (\`@@\`) used only when necessary

## COMMON PATTERNS AND EXAMPLES

### Example 1: Simple Node Pattern Traversal
\`\`\`gsql
CREATE QUERY findFriends(vertex<Person> personId) FOR GRAPH SocialGraph {
  SetAccum<vertex<Person>> @@friends;
  
  Start = {personId};
  
  Friends = SELECT t FROM Start:s -(FRIENDS)-> Person:t
            ACCUM @@friends += t;
  
  PRINT @@friends;
}
\`\`\`

### Example 2: Multi-Hop Path Pattern
\`\`\`gsql
CREATE QUERY friendsOfFriends(vertex<Person> personId) FOR GRAPH SocialGraph {
  SetAccum<vertex<Person>> @@friendsOfFriends;
  
  Start = {personId};
  
  // First hop: direct friends
  Friends = SELECT t FROM Start:s -(FRIENDS)-> Person:t
            ACCUM @@friendsOfFriends += t;
  
  // Second hop: friends of friends
  FriendsOfFriends = SELECT t FROM Friends:s -(FRIENDS)-> Person:t
                     WHERE t != personId AND t NOT IN @@friendsOfFriends
                     ACCUM @@friendsOfFriends += t;
  
  PRINT @@friendsOfFriends;
}
\`\`\`

### Example 3: Iterative Algorithm with Control Flow
\`\`\`gsql
CREATE QUERY pageRank(FLOAT maxChange = 0.001, INT maxIter = 25, FLOAT damping = 0.85) 
FOR GRAPH MyGraph {
  MaxAccum<FLOAT> @maxRank;
  SumAccum<FLOAT> @receivedScore = 0;
  SumAccum<FLOAT> @score = 1;
  
  Start = {VertexType.*};
  
  WHILE TRUE LIMIT maxIter DO
    Start = SELECT s FROM Start:s -(EdgeType:e)-> :t
            ACCUM t.@receivedScore += s.@score / s.outdegree("EdgeType")
            POST-ACCUM s.@score = (1.0 - damping) + damping * s.@receivedScore,
                       s.@maxRank = abs(s.@score - s.@maxRank),
                       s.@receivedScore = 0;
    
    IF Start.max(@maxRank) < maxChange THEN BREAK; END;
  END;
  
  PRINT Start[Start.@score];
}
\`\`\`

### Example 4: Aggregation with GroupByAccum
\`\`\`gsql
CREATE QUERY countConnections() FOR GRAPH SocialGraph {
  GroupByAccum<STRING country, SumAccum<INT> connectionCount> @@stats;
  
  Start = {Person.*};
  
  Connections = SELECT s FROM Start:s -(CONNECTED_TO)-> :t
                ACCUM @@stats += (s.country -> 1);
  
  PRINT @@stats;
}
\`\`\`

## ADVANCED FEATURES (Use When Appropriate)

- **Subqueries**: For modular, reusable query components
- **TEMP_TABLE**: For intermediate results
- **SAMPLE clause**: For sampling large datasets
- **PER clause**: For per-vertex/per-edge operations
- **Vector search**: For similarity queries
- **FILE Object**: For writing results to files or S3

---

**IMPORTANT**: The following section contains relevant context from the comprehensive GSQL knowledge base. Use this context to ensure accuracy and completeness in your code generation.`;

// =============================================================================
// GET /api/gsql-ai/health - Test endpoint
// =============================================================================
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    geminiConfigured: !!genAI,
    timestamp: new Date().toISOString() 
  });
});

// =============================================================================
// Intent Classification & MCP Tool Dispatch
// =============================================================================

const INTENT_CLASSIFY_PROMPT = `You are an intent classifier for a TigerGraph graph database assistant.
Given the user message, schema, and conversation history, classify the intent as EXACTLY one of:
- "data_question" -- user wants to KNOW something (counts, data lookups, list of graphs, list of queries, connection status) OR wants to EXECUTE an admin action (drop queries, drop graph, run a GSQL command, delete something, install something). This is the most common intent — use it whenever the user asks about their data OR wants you to do something on the database.
- "query_generation" -- user explicitly wants you to WRITE/GENERATE GSQL code for them to review. They say things like "write a query", "generate GSQL", "create a query that...", "give me a query for...". ONLY use this when the user clearly wants code output.
- "schema_question" -- user asks about vertex/edge types, attributes, structure, or graph metadata
- "conversation" -- general chat, greetings, thanks, clarifications, or follow-up discussion

CRITICAL: Default to "data_question" for any request that can be answered by calling a tool. Only use "query_generation" when the user explicitly asks for GSQL code to be written.

If the intent is "data_question", also extract which MCP tool to call and the arguments.
Available tools:
- get_vertex_count: args {vertex_type?} -- count vertices (omit vertex_type for total)
- get_edge_count: args {edge_type?} -- count edges
- get_nodes: args {vertex_type, limit?} -- list vertices of a type (vertex_type is REQUIRED, use a type from the schema)
- get_node_edges: args {vertex_type, vertex_id, edge_type?} -- get edges of a specific node (vertex_type AND vertex_id are REQUIRED)
- get_statistics: args {} -- get overall graph stats, also good for "is it connected" or "test connection" requests
- show_details: args {} -- show full graph details (queries, jobs, loading jobs, etc.)
- list_graphs: args {} -- list all graphs on the server
- gsql: args {command} -- run ANY GSQL command. Use this for admin operations like DROP QUERY ALL, DROP QUERY <name>, SHOW QUERY <name>, LS, USE GRAPH <name>, CREATE GRAPH, etc. When user says "delete all queries", use gsql with command "DROP QUERY ALL". When user says "show queries", use show_details.

IMPORTANT RULES:
- For "get_nodes", you MUST provide vertex_type as a non-null string from the schema. If the user says "find all vertices" without specifying a type, use "get_statistics" or "show_details" instead.
- For "get_node_edges", you MUST provide both vertex_type and vertex_id. If either is unknown, use "get_statistics" instead.
- If the user asks "is it connected", "test connection", "check connection", use get_statistics.
- If the user asks to delete/drop/remove queries, graphs, jobs, or data, use the gsql tool with the appropriate GSQL command.
- If the user asks "how many graphs", "list graphs", "what graphs", use list_graphs.
- If the user asks "what queries", "show queries", "list queries", use show_details.
- All tool arguments must be non-null strings. Never use null for required arguments.

Respond with ONLY valid JSON, no markdown, no explanation:
{"intent": "...", "tool": "...", "args": {...}}

For non-data intents, omit tool and args:
{"intent": "query_generation"}`;

const MCP_TOOL_MAP = {
  get_vertex_count: (mcp, args) => mcp.getVertexCount(args.vertex_type || undefined),
  get_edge_count: (mcp, args) => mcp.getEdgeCount(args.edge_type || undefined),
  get_nodes: (mcp, args) => {
    if (!args.vertex_type) {
      throw new Error('vertex_type is required. Ask me about a specific vertex type (check the schema first).');
    }
    return mcp.getNodes(args.vertex_type, args.limit || 20);
  },
  get_node_edges: (mcp, args) => {
    if (!args.vertex_type || !args.vertex_id) {
      throw new Error('vertex_type and vertex_id are required. Specify which vertex you want edges for.');
    }
    const toolArgs = { vertex_type: args.vertex_type, vertex_id: args.vertex_id };
    if (args.edge_type) toolArgs.edge_type = args.edge_type;
    if (args.graph_name) toolArgs.graph_name = args.graph_name;
    return mcp.callTool('tigergraph__get_node_edges', toolArgs).then(r => mcp.parseResponse(r));
  },
  get_statistics: (mcp) => mcp.getStatistics(),
  show_details: (mcp) => mcp.listMetadata(),
  list_graphs: (mcp) => mcp.listGraphs(),
  gsql: (mcp, args) => {
    if (!args.command) {
      throw new Error('GSQL command is required.');
    }
    let command = args.command.trim();
    const graphName = mcp.getGraphName();
    if (graphName && !command.toUpperCase().startsWith('USE GRAPH')) {
      command = `USE GRAPH ${graphName}\n${command}`;
    }
    return mcp.gsql(command);
  },
};

async function classifyIntent(genAI, prompt, schemaInfo, history) {
  try {
    const flashModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const context = schemaInfo ? `\nGraph schema: ${schemaInfo}` : '';
    const recentHistory = history.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n');
    const classifyPrompt = `${INTENT_CLASSIFY_PROMPT}\n${context}\n\nConversation:\n${recentHistory}\n\nUser message: "${prompt}"`;
    
    const result = await flashModel.generateContent(classifyPrompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { intent: 'query_generation' };
  } catch (err) {
    console.warn('Intent classification failed, defaulting to query_generation:', err.message);
    return { intent: 'query_generation' };
  }
}

async function formatDataResponse(genAI, prompt, data, toolName, schemaInfo) {
  try {
    const flashModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const formatPrompt = `You are a helpful TigerGraph assistant. The user asked: "${prompt}"

We queried the graph using the "${toolName}" operation and got this data:
${JSON.stringify(data, null, 2)}

${schemaInfo ? `Graph schema context: ${schemaInfo}` : ''}

Write a clear, concise, conversational answer to the user's question based on this data.
- Be specific with numbers and names from the data
- Format lists nicely with line breaks
- Keep it short and direct
- Do NOT include raw JSON in your answer
- Do NOT suggest GSQL queries unless the user asked for one`;

    const result = await flashModel.generateContent(formatPrompt);
    return result.response.text().trim();
  } catch (err) {
    console.warn('Data formatting failed:', err.message);
    return `Here's what I found:\n\n${JSON.stringify(data, null, 2)}`;
  }
}

async function answerSchemaQuestion(genAI, prompt, schemaInfo, statsInfo, history) {
  try {
    const flashModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const recentHistory = history.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n');
    const answerPrompt = `You are a helpful TigerGraph assistant.

Graph schema:
${schemaInfo}

${statsInfo ? `Graph statistics: ${statsInfo}` : ''}

Conversation:
${recentHistory}

User question: "${prompt}"

Answer the question about the schema/structure conversationally. Be specific and concise.`;

    const result = await flashModel.generateContent(answerPrompt);
    return result.response.text().trim();
  } catch (err) {
    console.warn('Schema answer failed:', err.message);
    return 'I couldn\'t process that question. Try asking something else about your graph.';
  }
}

async function handleConversation(genAI, prompt, schemaInfo, history) {
  try {
    const flashModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const recentHistory = history.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n');
    const chatPrompt = `You are a helpful TigerGraph graph database assistant embedded in the DevHub platform.
You help users explore their graph, generate GSQL queries, and understand graph concepts.
Keep responses concise and friendly.

${schemaInfo ? `The user's graph schema: ${schemaInfo}` : 'The user is not connected to a graph yet.'}

Conversation:
${recentHistory}

User: "${prompt}"

Respond naturally. If the user seems to want a query or data, suggest they ask more specifically.`;

    const result = await flashModel.generateContent(chatPrompt);
    return result.response.text().trim();
  } catch (err) {
    return 'Hey! I can help you generate GSQL queries, explore your graph data, or answer questions about your schema. What would you like to do?';
  }
}

// =============================================================================
// POST /api/gsql-ai/generate
// =============================================================================
router.post('/generate', authenticate, async (req, res) => {
  try {
    const { prompt, schema, context, history = [], useMCPSchema = true } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!genAI) {
      return res.status(503).json({ 
        error: 'GSQL AI service is not available. Please configure GEMINI_API_KEY.' 
      });
    }

    let realSchema = null;
    let mcpStats = null;
    let schemaSource = 'manual';
    let mcpService = null;

    if (useMCPSchema && getMCPConnection) {
      try {
        mcpService = getMCPConnection(req.user.id);
        if (mcpService) {
          // Prefer cached values (instant, no network). getSchema()/getStatistics()
          // return from cache when available and only hit TigerGraph on cache miss.
          const cachedSchema = mcpService.getCachedSchema();
          const cachedStats = mcpService.getCachedStats();

          if (cachedSchema) {
            realSchema = typeof cachedSchema === 'string'
              ? cachedSchema
              : JSON.stringify(cachedSchema, null, 2);
            schemaSource = 'tigergraph_mcp';
          }
          if (cachedStats) {
            mcpStats = cachedStats;
          }

          if (!realSchema) {
            try {
              const schemaValue = await mcpService.getSchema();
              if (schemaValue) {
                realSchema = typeof schemaValue === 'string'
                  ? schemaValue
                  : JSON.stringify(schemaValue, null, 2);
                schemaSource = 'tigergraph_mcp';
              }
            } catch (schemaErr) {
              console.warn('[GSQL-AI] Schema fetch failed (non-fatal):', schemaErr.message);
            }
          }

          if (!mcpStats) {
            try {
              mcpStats = await mcpService.getStatistics();
            } catch {
              // Stats are optional context; proceed without them.
            }
          }
        }
      } catch (mcpError) {
        console.warn('[GSQL-AI] MCP context fetch failed:', mcpError.message);
      }
    }

    const effectiveSchema = realSchema || schema;
    const statsInfo = mcpStats 
      ? `Vertices: ${JSON.stringify(mcpStats.vertexCount)}, Edges: ${JSON.stringify(mcpStats.edgeCount)}`
      : null;

    // Step 1: Classify intent
    const classification = await classifyIntent(genAI, prompt, effectiveSchema, history);
    console.log(`🧠 Intent: ${classification.intent}${classification.tool ? ` (tool: ${classification.tool})` : ''}`);

    // Step 2: Route based on intent
    
    // --- DATA QUESTION: Call MCP tools and format response ---
    if (classification.intent === 'data_question' && mcpService && classification.tool) {
      const toolFn = MCP_TOOL_MAP[classification.tool];
      if (!toolFn) {
        return res.json({
          type: 'answer',
          content: `I'm not sure how to look that up. Try asking me to generate a GSQL query instead.`,
        });
      }

      try {
        console.log(`🔧 MCP call: ${classification.tool}`, classification.args || {});
        const mcpData = await toolFn(mcpService, classification.args || {});
        const content = await formatDataResponse(genAI, prompt, mcpData, classification.tool, effectiveSchema);
        
        return res.json({
          type: 'data',
          content,
          data: mcpData,
          mcpTool: classification.tool,
        });
      } catch (mcpErr) {
        console.error('MCP tool error:', mcpErr.message);
        return res.json({
          type: 'answer',
          content: `I tried to query your graph but got an error: ${mcpErr.message}. You can try rephrasing or ask me to generate a GSQL query instead.`,
        });
      }
    }

    // --- DATA QUESTION but no MCP connection ---
    if (classification.intent === 'data_question' && !mcpService) {
      return res.json({
        type: 'answer',
        content: 'I\'d need a TigerGraph connection to look that up. Connect your instance first, or ask me to generate a GSQL query that you can run manually.',
      });
    }

    // --- SCHEMA QUESTION: Answer from cached schema ---
    if (classification.intent === 'schema_question') {
      if (!effectiveSchema) {
        return res.json({
          type: 'answer',
          content: 'No schema information available. Connect to TigerGraph or provide a schema manually.',
        });
      }
      const content = await answerSchemaQuestion(genAI, prompt, effectiveSchema, statsInfo, history);
      return res.json({ type: 'answer', content });
    }

    // --- CONVERSATION: Chat naturally ---
    if (classification.intent === 'conversation') {
      const content = await handleConversation(genAI, prompt, effectiveSchema, history);
      return res.json({ type: 'answer', content });
    }

    // --- QUERY GENERATION: Original code generation flow ---

    // Load GSQL knowledge base (lazy)
    if (!gsqlKnowledgeBaseChunks) {
      gsqlKnowledgeBaseChunks = loadGSQLKnowledgeBase();
    }

    let ragContext = '';
    let relevantChunks = [];
    if (gsqlKnowledgeBaseChunks && gsqlKnowledgeBaseChunks.length > 0) {
      try {
        relevantChunks = retrieveRelevantGSQLChunks(prompt, effectiveSchema || '', gsqlKnowledgeBaseChunks, 7);
        if (relevantChunks.length > 0) {
          ragContext = formatGSQLRAGContext(relevantChunks);
        }
      } catch (ragError) {
        console.error('GSQL RAG retrieval error:', ragError);
      }
    }

    let fullPrompt = prompt;
    if (effectiveSchema) {
      fullPrompt = `Schema Information:\n${effectiveSchema}\n\nUser Request: ${prompt}`;
      if (mcpStats) {
        fullPrompt += `\nGraph Statistics:\n- Total Vertices: ${JSON.stringify(mcpStats.vertexCount)}\n- Total Edges: ${JSON.stringify(mcpStats.edgeCount)}`;
      }
    }
    if (context) {
      fullPrompt += `\n\nAdditional Context: ${context}`;
    }

    let enhancedSystemPrompt = GSQL_AI_SYSTEM_PROMPT_BASE;
    if (ragContext) {
      enhancedSystemPrompt += `\n\n## RELEVANT CONTEXT FROM GSQL KNOWLEDGE BASE:\n\n${ragContext}\n\nUse this context to ensure your generated code follows official GSQL syntax, patterns, and best practices.`;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

    const chatHistory = [
      { role: "user", parts: [{ text: enhancedSystemPrompt }] },
      { role: "model", parts: [{ text: "I'm ready to help you generate GSQL queries. What would you like to build?" }] },
      ...history.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
    ];

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(fullPrompt);
    const generatedText = result.response.text();

    const codeBlockMatch = generatedText.match(/```gsql\n([\s\S]*?)```/);
    const code = codeBlockMatch ? codeBlockMatch[1].trim() : null;

    const explanationMatch = generatedText.match(/\*\*Explanation\*\*:\s*(.+?)(?:\n\n|\*\*|$)/s);
    const explanation = explanationMatch ? explanationMatch[1].trim() : null;

    // If no code block found, treat as a conversational answer
    if (!code) {
      return res.json({
        type: 'answer',
        content: generatedText,
      });
    }

    res.json({
      type: 'query',
      code,
      explanation: explanation || 'Here\'s your GSQL query.',
      fullResponse: generatedText,
      schemaSource,
    });

  } catch (error) {
    console.error('GSQL AI generation error:', error);
    
    if (error.message?.includes('429') || error.status === 429) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Please try again in a moment.' 
      });
    }
    
    if (error.message?.includes('401') || error.message?.includes('403') || error.status === 401 || error.status === 403) {
      return res.status(503).json({ 
        error: 'GSQL AI service authentication failed. Please check API configuration.' 
      });
    }

    res.status(500).json({ 
      error: 'Something went wrong. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;
