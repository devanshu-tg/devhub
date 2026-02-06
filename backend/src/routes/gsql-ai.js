const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { authenticate } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

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
// POST /api/gsql-ai/generate
// =============================================================================
router.post('/generate', authenticate, async (req, res) => {
  try {
    const { prompt, schema, context, history = [] } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!genAI) {
      return res.status(503).json({ 
        error: 'GSQL AI service is not available. Please configure GEMINI_API_KEY.' 
      });
    }

    // Load GSQL knowledge base on first request (lazy loading with caching)
    if (!gsqlKnowledgeBaseChunks) {
      gsqlKnowledgeBaseChunks = loadGSQLKnowledgeBase();
    }

    // RAG: Retrieve relevant context from GSQL knowledge base
    let ragContext = '';
    let relevantChunks = [];
    if (gsqlKnowledgeBaseChunks && gsqlKnowledgeBaseChunks.length > 0) {
      try {
        relevantChunks = retrieveRelevantGSQLChunks(prompt, schema || '', gsqlKnowledgeBaseChunks, 7);
        if (relevantChunks.length > 0) {
          ragContext = formatGSQLRAGContext(relevantChunks);
          console.log(`📚 GSQL RAG: Retrieved ${relevantChunks.length} relevant chunks`);
        }
      } catch (ragError) {
        console.error('GSQL RAG retrieval error:', ragError);
        // Continue without RAG context if retrieval fails
      }
    }

    // Build the full prompt with context
    let fullPrompt = prompt;
    
    if (schema) {
      fullPrompt = `Schema Information:\n${schema}\n\nUser Request: ${prompt}`;
    }
    
    if (context) {
      fullPrompt = `${fullPrompt}\n\nAdditional Context: ${context}`;
    }

    // Build enhanced system prompt with RAG context
    let enhancedSystemPrompt = GSQL_AI_SYSTEM_PROMPT_BASE;
    if (ragContext) {
      enhancedSystemPrompt += `\n\n## RELEVANT CONTEXT FROM GSQL KNOWLEDGE BASE:\n\n${ragContext}\n\nUse this context to ensure your generated code follows official GSQL syntax, patterns, and best practices. Reference specific syntax rules, accumulator types, and patterns from this context when generating code.`;
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Build chat history for conversational context
    const chatHistory = [
      { role: "user", parts: [{ text: enhancedSystemPrompt }] },
      { role: "model", parts: [{ text: "I'm ready to help you generate GSQL queries! I have access to comprehensive GSQL documentation and best practices. What would you like to build?" }] },
      ...history.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
    ];

    // Use chat interface for conversation history
    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(fullPrompt);
    const response = result.response;
    const generatedText = response.text();

    // Extract code blocks if present
    const codeBlockMatch = generatedText.match(/```gsql\n([\s\S]*?)```/);
    const code = codeBlockMatch ? codeBlockMatch[1].trim() : generatedText;

    // Extract explanation if present
    const explanationMatch = generatedText.match(/\*\*Explanation\*\*:\s*(.+?)(?:\n\n|\*\*|$)/s);
    const explanation = explanationMatch ? explanationMatch[1].trim() : null;

    // Extract key features if present
    const featuresMatch = generatedText.match(/\*\*Key Features\*\*:\s*([\s\S]*?)(?:\n\n|$)/);
    const features = featuresMatch 
      ? featuresMatch[1].split('\n').map(f => f.trim().replace(/^[-*]\s*/, '')).filter(f => f)
      : [];

    // Calculate average confidence score from chunk scores
    const calculateConfidence = (chunks) => {
      if (!chunks || chunks.length === 0) return 0;
      const totalScore = chunks.reduce((sum, chunk) => sum + (chunk.score || 0), 0);
      const maxPossibleScore = chunks.length * 100; // Rough estimate
      return Math.min(100, Math.round((totalScore / maxPossibleScore) * 100));
    };

    res.json({
      code,
      explanation: explanation || 'GSQL query generated successfully.',
      features,
      fullResponse: generatedText,
      ragContext: relevantChunks.length > 0 ? {
        chunksRetrieved: relevantChunks.length,
        relevantSections: relevantChunks.map(c => c.title),
        confidence: calculateConfidence(relevantChunks)
      } : undefined
    });

  } catch (error) {
    console.error('GSQL AI generation error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      status: error.status
    });
    
    // Handle specific Gemini API errors
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
      error: 'Failed to generate GSQL code. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
