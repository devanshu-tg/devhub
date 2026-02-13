const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { supabase } = require('../config/supabase');
const fs = require('fs');
const path = require('path');

// Initialize Gemini (will use API key from env)
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// =============================================================================
// TOPIC KEYWORDS FOR DATABASE SEARCH
// =============================================================================
const TOPIC_KEYWORDS = {
  gsql: ['gsql', 'query', 'select', 'accum', 'accumulator', 'pattern matching', 'syntax'],
  fraud: ['fraud', 'detection', 'financial', 'crime', 'aml', 'kyc', 'risk'],
  recommendations: ['recommend', 'recommendation', 'personalization', 'collaborative', 'filtering'],
  graphrag: ['graphrag', 'rag', 'retrieval', 'augmented', 'generation', 'llm', 'ai'],
  gnn: ['gnn', 'neural', 'network', 'machine learning', 'ml', 'deep learning', 'embedding'],
  schema: ['schema', 'design', 'model', 'vertex', 'edge', 'graph model', 'data model'],
  cloud: ['cloud', 'setup', 'deploy', 'installation', 'cluster', 'savanna', 'tgcloud'],
  algorithms: ['algorithm', 'pagerank', 'shortest path', 'community', 'centrality'],
  python: ['python', 'pytigergraph', 'pytg', 'connector', 'sdk', 'api'],
  getting_started: ['started', 'begin', 'intro', 'introduction', 'basics', 'fundamental', 'beginner']
};

// =============================================================================
// DETECT TOPIC FOR Q&A MODE FALLBACK
// =============================================================================
function detectTopic(message) {
  const lowerMessage = message.toLowerCase();
  
  for (const [topicId, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) {
        return { id: topicId, keywords };
      }
    }
  }
  return null;
}

// =============================================================================
// RAG: Knowledge Base Loading and Chunking
// =============================================================================
let knowledgeBaseChunks = null;

function loadKnowledgeBase() {
  try {
    const kbPath = path.join(__dirname, '../data/llm-full.md');
    
    if (!fs.existsSync(kbPath)) {
      console.warn('⚠️  Knowledge base file not found at:', kbPath);
      return [];
    }
    
    const content = fs.readFileSync(kbPath, 'utf-8');
    const chunks = [];
    
    // Split by section headers (## )
    const sections = content.split(/^##\s+/gm);
    
    sections.forEach((section, index) => {
      if (!section.trim()) return;
      
      // Extract title (first line) and content (rest)
      const lines = section.split('\n');
      const title = lines[0].trim();
      let sectionContent = lines.slice(1).join('\n').trim();
      
      // Skip the SYSTEM tag section (first section before any ##)
      if (title.includes('<SYSTEM>') || title.includes('TIGERGRAPH_FULL_AGENT_REFERENCE')) {
        return;
      }
      
      // Extract subsection titles (### ) and include them in content for better matching
      const subsectionMatches = sectionContent.match(/^###\s+([^\n]+)/gm);
      if (subsectionMatches) {
        // Add subsection titles to content for better keyword matching
        const subsectionTitles = subsectionMatches.map(m => m.replace(/^###\s+/, '').trim()).join(' ');
        sectionContent = subsectionTitles + ' ' + sectionContent;
      }
      
      // Skip very short chunks
      if (sectionContent.length < 50) return;
      
      chunks.push({
        id: index,
        title: title || `Section ${index}`,
        content: sectionContent,
        keywords: extractKeywords(sectionContent)
      });
    });
    
    console.log(`✅ Loaded ${chunks.length} knowledge base chunks from llm-full.md`);
    return chunks;
  } catch (error) {
    console.error('Error loading knowledge base:', error);
    return [];
  }
}

function extractKeywords(text) {
  // Simple keyword extraction
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

function retrieveRelevantChunks(question, chunks, topK = 5) {
  if (!chunks || chunks.length === 0) return [];
  
  const questionLower = question.toLowerCase();
  const questionWords = questionLower.split(/\s+/).filter(w => w.length > 2);
  
  // Score each chunk
  const scoredChunks = chunks.map(chunk => {
    let score = 0;
    const chunkText = chunk.content.toLowerCase();
    const chunkTitle = chunk.title.toLowerCase();
    
    // Exact phrase match (highest score)
    if (chunkText.includes(questionLower)) {
      score += 100;
    }
    
    // Exact word matches in title (very high priority)
    questionWords.forEach(word => {
      // Check for exact word match (not substring)
      const titleWords = chunkTitle.split(/[\s_]+/);
      if (titleWords.some(tw => tw === word)) {
        score += 30;
      } else if (chunkTitle.includes(word)) {
        score += 20;
      }
    });
    
    // Content word matches
    questionWords.forEach(word => {
      // Check for exact word match in content
      const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
      if (wordRegex.test(chunkText)) {
        score += 15; // Exact word match gets higher score
      } else if (chunkText.includes(word)) {
        score += 10; // Substring match
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

function formatRAGContext(chunks) {
  if (!chunks || chunks.length === 0) return '';
  
  return chunks
    .map((chunk, index) => `[Context ${index + 1}: ${chunk.title}]\n${chunk.content}`)
    .join('\n\n---\n\n');
}

// =============================================================================
// SMART RESOURCE SEARCH - Fetches candidates for AI to filter
// =============================================================================
async function fetchResourceCandidates(keywords = [], skillLevel = null, limit = 20) {
  if (!supabase) return [];
  
  try {
    const { data, error } = await supabase
      .from('resources')
      .select('id, title, description, type, skill_level, url, thumbnail, duration, use_cases, featured');
    
    if (error) throw error;
    
    let results = data || [];
    
    // Score and rank results based on keywords
    if (keywords.length > 0) {
      results = results.map(r => {
        let score = 0;
        const titleLower = r.title.toLowerCase();
        const descLower = (r.description || '').toLowerCase();
        const useCases = r.use_cases || [];
        
        for (const keyword of keywords) {
          const kw = keyword.toLowerCase();
          if (titleLower.includes(kw)) score += 25;
          if (descLower.includes(kw)) score += 10;
          if (useCases.some(uc => uc.toLowerCase().includes(kw))) score += 15;
        }
        
        // Bonus for skill level match
        if (skillLevel && r.skill_level === skillLevel) score += 10;
        
        // Bonus for featured
        if (r.featured) score += 5;
        
        return { ...r, relevanceScore: score };
      });
      
      // Sort by relevance
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
    
    // Return top candidates
    return results.slice(0, limit);
  } catch (error) {
    console.error('Resource search error:', error);
    return [];
  }
}

// =============================================================================
// FORMAT RESOURCES FOR RESPONSE
// =============================================================================
function formatResources(resources) {
  return resources.map(r => ({
    id: r.id,
    title: r.title,
    description: r.description,
    type: r.type,
    skillLevel: r.skill_level,
    url: r.url,
    thumbnail: r.thumbnail,
    duration: r.duration
  }));
}

// =============================================================================
// AI-DRIVEN LEARNING MODE SYSTEM PROMPT
// =============================================================================
const LEARNING_AI_SYSTEM_PROMPT = `You are a friendly TigerGraph learning assistant. Your job is to have natural conversations and help users find the perfect learning resources.

## HOW TO BEHAVE
- Talk like a real human, not a robot
- Ask ONE question at a time
- Be curious about what they're trying to accomplish
- Understand their situation BEFORE recommending anything

## CONVERSATION FLOW
1. When user says hi → Welcome them, ask what brings them here
2. Learn about their goal → Ask follow-up questions to understand their specific needs
3. Understand their level → Naturally ask about their experience
4. When you feel confident → Ask "Would you like me to recommend some resources?"
5. Only recommend AFTER they say yes

## WHEN TO RECOMMEND RESOURCES
- ONLY when you understand: their goal, their experience level, and they've agreed to see resources
- When ready, respond with EXACTLY this format (including the markers):

[READY_FOR_RESOURCES]
keywords: keyword1, keyword2, keyword3
skill_level: beginner/intermediate/advanced (or null if any level)
count: number of resources to show (1-15 based on their need)
[/READY_FOR_RESOURCES]

Then continue your message naturally like "Let me find some great resources for you!"

## IMPORTANT RULES
- NEVER use the resource format until user says yes to recommendations
- NEVER explain WHY you chose each resource - just share them naturally
- The count should match their need: simple question = 1-3, deep learning = 5-10, comprehensive = 10-15
- Focus ONLY on TigerGraph, GSQL, and graph databases
- If asked about unrelated topics, politely redirect to TigerGraph

## EXAMPLE CONVERSATIONS

User: "Hi"
You: "Hey! 👋 Welcome! What brings you to TigerGraph today? Are you working on something specific or just exploring?"

User: "I want to learn fraud detection"
You: "Fraud detection is one of the coolest use cases for graphs! Are you building this for a real project, or learning for fun? And what's your background - have you used graph databases before?"

User: "Real project, I know SQL but new to graphs"
You: "That's great - SQL knowledge transfers well to GSQL! Since you're building something real, would you like me to recommend some resources to get you started with fraud detection in TigerGraph?"

User: "Yes please"
You: [READY_FOR_RESOURCES]
keywords: fraud, detection, financial, crime, getting started
skill_level: intermediate
count: 4
[/READY_FOR_RESOURCES]

Here are some resources that should help you get started with fraud detection!`;

// =============================================================================
// Q&A MODE SYSTEM PROMPT
// =============================================================================
const QA_SYSTEM_PROMPT = `You are a TigerGraph expert assistant in Q&A mode. Your role is to:

1. Answer questions directly and clearly about TigerGraph, GSQL, graph databases, and related topics
2. Provide explanations with examples when helpful
3. Be conversational but informative
4. If you don't know something, say so honestly
5. Keep responses focused and concise (2-4 paragraphs max)
6. Use markdown formatting for code examples

You can answer questions about:
- GSQL syntax, queries, and best practices
- TigerGraph architecture and concepts
- Graph database fundamentals
- Schema design patterns
- Graph algorithms
- TigerGraph Cloud and deployment
- pyTigerGraph and integrations
- Performance optimization
- Use cases (fraud detection, recommendations, etc.)

DO NOT:
- Recommend specific resources or tutorials (unless explicitly asked)
- Ask follow-up questions about skill level or learning goals
- Redirect to other sources - answer directly

Be helpful, accurate, and conversational.`;

// =============================================================================
// Q&A MODE HANDLER WITH RAG
// =============================================================================
async function handleQAMode(req, res, message, history) {
  let response = '';
  
  // Load knowledge base on first use (lazy loading with caching)
  if (!knowledgeBaseChunks) {
    knowledgeBaseChunks = loadKnowledgeBase();
  }
  
  // Try to use Gemini for direct Q&A (no resources in Q&A mode)
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });
      
      // RAG: Retrieve relevant context from knowledge base
      let ragContext = '';
      if (knowledgeBaseChunks && knowledgeBaseChunks.length > 0) {
        try {
          const relevantChunks = retrieveRelevantChunks(message, knowledgeBaseChunks, 5);
          if (relevantChunks.length > 0) {
            ragContext = formatRAGContext(relevantChunks);
            console.log(`📚 RAG: Retrieved ${relevantChunks.length} relevant chunks`);
          }
        } catch (ragError) {
          console.error('RAG retrieval error:', ragError);
          // Continue without RAG context if retrieval fails
        }
      }
      
      // Enhance system prompt with RAG context
      let enhancedPrompt = QA_SYSTEM_PROMPT;
      if (ragContext) {
        enhancedPrompt += `\n\n## RELEVANT CONTEXT FROM KNOWLEDGE BASE:\n\n${ragContext}\n\nUse this context to provide accurate, detailed answers. If the context doesn't fully answer the question, combine it with your general knowledge.`;
      }
      
      // Build chat history
      const chatHistory = [
        { role: "user", parts: [{ text: enhancedPrompt }] },
        { role: "model", parts: [{ text: "I understand! I'm ready to answer your questions about TigerGraph, GSQL, and graph databases directly. What would you like to know?" }] },
        ...history.map(msg => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        })),
      ];
      
      const chat = model.startChat({ history: chatHistory });
      const result = await chat.sendMessage(message);
      response = result.response.text();
      
      // Q&A Mode: No resources, just direct answers
      return res.json({
        response,
        resources: [], // No resources in Q&A mode
        quickReplies: [
          { text: "Tell me more", action: "tell_more" },
          { text: "Show me an example", action: "show_example" },
          { text: "Switch to Learning Mode", action: "switch_learning" }
        ],
        intent: 'qa_answer',
        context: { state: 'qa_mode', topic: null, skillLevel: null, goal: null }
      });
      
    } catch (error) {
      console.error('Gemini Q&A error:', error.message);
      // Fall through to fallback
    }
  }
  
  // Fallback response when Gemini is not available
  const detectedTopic = detectTopic(message);
  
  if (detectedTopic) {
    response = `Great question about **${detectedTopic.id}**!

While I'm having a brief connection issue with my AI backend, I recommend switching to **Learning Mode** where I can guide you through curated resources on this topic.`;
  } else {
    response = `That's a great question! 

I'm currently experiencing a connection issue with my AI backend, so I can't provide a detailed answer right now.

Try asking about specific topics like:
- **GSQL** - TigerGraph's query language
- **Schema Design** - How to model your graph
- **Graph Algorithms** - PageRank, shortest path, etc.
- **TigerGraph Cloud** - Deployment and management

Or switch to **Learning Mode** for guided tutorials and resources!`;
  }
  
  return res.json({
    response,
    resources: [],
    quickReplies: [
      { text: "Switch to Learning Mode", action: "switch_learning" },
      { text: "Try again", action: "retry" }
    ],
    intent: 'qa_fallback',
    context: { state: 'qa_mode', topic: detectedTopic?.id || null, skillLevel: null, goal: null }
  });
}

// =============================================================================
// AI-DRIVEN LEARNING MODE HANDLER
// =============================================================================
async function handleLearningMode(req, res, message, history) {
  // Check if Gemini is available
  if (!genAI) {
    return res.json({
      response: `Hey there! 👋 I'd love to help you learn TigerGraph, but my AI brain is taking a quick nap (API key not configured).

In the meantime, you can:
- Switch to **Q&A Mode** for direct answers
- Check out the **Resources** page to browse all our content
- Come back when the AI is ready!`,
      resources: [],
      quickReplies: [
        { text: "Switch to Q&A Mode", action: "switch_qa" },
        { text: "Browse Resources", action: "browse_resources" }
      ],
      intent: 'no_ai',
      context: {}
    });
  }

  try {
    // Build conversation history for Gemini
    const chatHistory = [
      { role: "user", parts: [{ text: LEARNING_AI_SYSTEM_PROMPT }] },
      { role: "model", parts: [{ text: "Got it! I'll have natural conversations, ask questions one at a time, and only recommend resources when I truly understand what the user needs and they've agreed to see them. I'll use the special format when ready to fetch resources." }] },
      ...history.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
    ];

    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });
    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message);
    let aiResponse = result.response.text();

    // Check if AI wants to show resources
    const resourceMatch = aiResponse.match(/\[READY_FOR_RESOURCES\]([\s\S]*?)\[\/READY_FOR_RESOURCES\]/);
    
    if (resourceMatch) {
      // Parse the resource request
      const resourceBlock = resourceMatch[1];
      const keywordsMatch = resourceBlock.match(/keywords:\s*(.+)/i);
      const skillMatch = resourceBlock.match(/skill_level:\s*(\w+)/i);
      const countMatch = resourceBlock.match(/count:\s*(\d+)/i);

      const keywords = keywordsMatch 
        ? keywordsMatch[1].split(',').map(k => k.trim()).filter(k => k && k !== 'null')
        : [];
      const skillLevel = skillMatch && skillMatch[1] !== 'null' ? skillMatch[1].toLowerCase() : null;
      const count = countMatch ? parseInt(countMatch[1]) : 5;

      console.log('AI requested resources:', { keywords, skillLevel, count });

      // Remove the resource block from the response
      aiResponse = aiResponse.replace(/\[READY_FOR_RESOURCES\][\s\S]*?\[\/READY_FOR_RESOURCES\]/, '').trim();

      // Fetch resource candidates from database
      const candidates = await fetchResourceCandidates(keywords, skillLevel, count + 5);
      
      if (candidates.length > 0) {
        // Let AI pick the best ones from candidates
        const selectionPrompt = `You have these ${candidates.length} resources available:

${candidates.map((r, i) => `${i + 1}. "${r.title}" (${r.type}, ${r.skill_level}) - ${r.description?.substring(0, 100)}...`).join('\n')}

The user wants ${count} resources about: ${keywords.join(', ')}
Skill level preference: ${skillLevel || 'any'}

Return ONLY a comma-separated list of numbers (1-${candidates.length}) for the BEST ${Math.min(count, candidates.length)} resources. Example: 1, 3, 5, 7
Pick resources that best match their needs. No explanation needed.`;

        try {
          const selectionResult = await model.generateContent(selectionPrompt);
          const selectionText = selectionResult.response.text();
          
          // Parse selected indices
          const selectedIndices = selectionText.match(/\d+/g)?.map(n => parseInt(n) - 1) || [];
          
          // Get selected resources
          let selectedResources = selectedIndices
            .filter(i => i >= 0 && i < candidates.length)
            .slice(0, count)
            .map(i => candidates[i]);

          // Fallback: if AI selection failed, just take top candidates
          if (selectedResources.length === 0) {
            selectedResources = candidates.slice(0, count);
          }

          const formattedResources = formatResources(selectedResources);

          return res.json({
            response: aiResponse,
            resources: formattedResources,
            quickReplies: [
              { text: "Tell me more about these", action: "more_info" },
              { text: "Show me different resources", action: "different_resources" },
              { text: "Thanks, this helps!", action: "thanks" }
            ],
            intent: 'showing_resources',
            context: { keywords, skillLevel, lastResourceCount: formattedResources.length }
          });
        } catch (selectionError) {
          console.error('AI selection error:', selectionError);
          // Fallback to top candidates
          const formattedResources = formatResources(candidates.slice(0, count));
          
          return res.json({
            response: aiResponse,
            resources: formattedResources,
            quickReplies: [
              { text: "Tell me more", action: "more_info" },
              { text: "Show different resources", action: "different_resources" }
            ],
            intent: 'showing_resources',
            context: { keywords, skillLevel }
          });
        }
      } else {
        // No resources found
        aiResponse += "\n\nHmm, I couldn't find specific resources matching that criteria. Could you tell me more about what you're looking for?";
        
        return res.json({
          response: aiResponse,
          resources: [],
          quickReplies: [
            { text: "Show me beginner content", action: "beginner_content" },
            { text: "Browse all resources", action: "browse_all" }
          ],
          intent: 'no_resources_found',
          context: { keywords, skillLevel }
        });
      }
    }

    // No resource request - just a conversational response
    return res.json({
      response: aiResponse,
      resources: [],
      quickReplies: [], // Let the conversation flow naturally
      intent: 'conversation',
      context: {}
    });

  } catch (error) {
    console.error('Learning mode error:', error.message);
    
    return res.json({
      response: `Oops! I hit a small bump there. 😅 Could you try rephrasing that? Or if you'd like, you can:
- Ask me about a specific TigerGraph topic
- Tell me what you're trying to build
- Switch to Q&A mode for direct answers`,
      resources: [],
      quickReplies: [
        { text: "Help me get started", action: "get_started" },
        { text: "Switch to Q&A Mode", action: "switch_qa" }
      ],
      intent: 'error',
      context: {}
    });
  }
}

// =============================================================================
// MAIN CONVERSATION HANDLER
// =============================================================================
router.post('/', async (req, res) => {
  const { message, history = [], conversationContext = {}, mode = 'learning' } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  // ==========================================================================
  // Q&A MODE - Direct answers without guided flow (UNCHANGED)
  // ==========================================================================
  if (mode === 'qa') {
    return handleQAMode(req, res, message, history);
  }
  
  // ==========================================================================
  // LEARNING MODE - Now fully AI-driven!
  // ==========================================================================
  return handleLearningMode(req, res, message, history);
});

// =============================================================================
// ADDITIONAL ENDPOINTS
// =============================================================================

// GET /api/chat/suggestions
router.get('/suggestions', async (req, res) => {
  const suggestions = [
    { text: "Get started with TigerGraph", category: "beginner" },
    { text: "Learn GSQL query language", category: "learning" },
    { text: "Show me fraud detection tutorials", category: "use_case" },
    { text: "What is GraphRAG?", category: "concept" },
    { text: "How do I design a graph schema?", category: "technical" },
  ];
  
  res.json(suggestions);
});

// GET /api/chat/topics
router.get('/topics', async (req, res) => {
  const topics = [
    { id: 'gsql', name: 'GSQL Query Language', description: 'TigerGraph\'s powerful graph query language' },
    { id: 'fraud', name: 'Fraud Detection', description: 'Real-time fraud detection and prevention' },
    { id: 'recommendations', name: 'Recommendation Engines', description: 'Build personalized recommendation systems' },
    { id: 'graphrag', name: 'GraphRAG & AI', description: 'Combine graph databases with LLMs' },
    { id: 'schema', name: 'Schema Design', description: 'Design effective graph data models' },
    { id: 'cloud', name: 'TigerGraph Cloud', description: 'Deploy and manage in the cloud' },
    { id: 'algorithms', name: 'Graph Algorithms', description: 'PageRank, shortest path, community detection' },
    { id: 'python', name: 'pyTigerGraph', description: 'Python connector and tools' },
    { id: 'getting_started', name: 'Getting Started', description: 'Introduction to TigerGraph' }
  ];
  
  res.json(topics);
});

// POST /api/chat/search - Direct resource search
router.post('/search', async (req, res) => {
  const { topic, skillLevel, type, limit = 10 } = req.body;
  
  if (!supabase) {
    return res.json({ resources: [] });
  }
  
  try {
    let query = supabase
      .from('resources')
      .select('id, title, description, type, skill_level, url, thumbnail, duration');
    
    if (topic) {
      query = query.or(`title.ilike.%${topic}%,description.ilike.%${topic}%`);
    }
    
    if (skillLevel && skillLevel !== 'all') {
      query = query.eq('skill_level', skillLevel);
    }
    
    if (type && type !== 'all') {
      query = query.eq('type', type);
    }
    
    const { data, error } = await query.limit(limit);
    
    if (error) throw error;
    
    res.json({ resources: formatResources(data || []) });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;
