const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { supabase } = require('../config/supabase');

// Initialize Gemini (will use API key from env)
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are an AI assistant for TigerGraph DevHub, a developer portal for learning TigerGraph graph database.

Your role is to:
1. Help developers learn about TigerGraph and graph databases
2. Recommend relevant resources (tutorials, videos, documentation) from our library
3. Explain GSQL concepts and provide examples
4. Guide users on learning paths based on their goals

Be concise, helpful, and always try to point users to specific resources when relevant.
When you have context about available resources, recommend specific ones by name.

Key topics you can help with:
- Graph database fundamentals
- GSQL query language
- TigerGraph Cloud setup
- Use cases: Fraud detection, Recommendations, GraphRAG, GNN
- Schema design and data modeling
- Graph algorithms and analytics

Format your responses with clear sections and bullet points when listing multiple items.`;

// Helper function to search resources for RAG context
async function searchResources(query) {
  if (!supabase) return [];
  
  try {
    // Simple keyword search in title and description
    const { data, error } = await supabase
      .from('resources')
      .select('id, title, description, type, skill_level, url')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(5);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Resource search error:', error);
    return [];
  }
}

// Helper to get all resources for context (fallback)
async function getAllResources() {
  if (!supabase) {
    // Return mock data if Supabase not configured
    return [
      { title: "Getting Started with TigerGraph", type: "tutorial", skill_level: "beginner", url: "https://docs.tigergraph.com/getting-started" },
      { title: "GSQL 101 - Pattern Matching", type: "video", skill_level: "beginner", url: "https://docs.tigergraph.com/gsql" },
      { title: "Fraud Detection with Graph Analytics", type: "tutorial", skill_level: "intermediate", url: "https://docs.tigergraph.com/fraud" },
      { title: "GraphRAG Implementation Guide", type: "blog", skill_level: "advanced", url: "https://tigergraph.com/blog/graphrag" },
      { title: "Building Recommendation Engines", type: "video", skill_level: "intermediate", url: "https://docs.tigergraph.com/recommendations" },
    ];
  }
  
  try {
    const { data, error } = await supabase
      .from('resources')
      .select('title, description, type, skill_level, url')
      .limit(20);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get resources error:', error);
    return [];
  }
}

// Extract keywords from user message for search
function extractKeywords(message) {
  const stopWords = ['what', 'how', 'where', 'when', 'why', 'is', 'are', 'the', 'a', 'an', 'to', 'for', 'of', 'in', 'on', 'with', 'me', 'show', 'tell', 'about', 'can', 'you', 'i', 'want', 'need', 'learn', 'help'];
  const words = message.toLowerCase().split(/\s+/);
  return words.filter(word => word.length > 2 && !stopWords.includes(word)).join(' ');
}

// POST /api/chat - Send message to AI
router.post('/', async (req, res) => {
  const { message, history = [] } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  // Search for relevant resources based on the query
  const keywords = extractKeywords(message);
  let relevantResources = await searchResources(keywords);
  
  // If no specific results, get general resources
  if (relevantResources.length === 0) {
    relevantResources = await getAllResources();
  }
  
  // Build context from resources
  const resourceContext = relevantResources.length > 0
    ? `\n\nAvailable resources that might be relevant:\n${relevantResources.map(r => 
        `- "${r.title}" (${r.type}, ${r.skill_level}): ${r.description || 'No description'}`
      ).join('\n')}`
    : '';
  
  // If no API key, return mock response with actual resource citations
  if (!genAI) {
    const citations = relevantResources.slice(0, 3).map(r => ({
      title: r.title,
      url: r.url,
      type: r.type,
    }));
    
    return res.json({
      response: `Great question about "${message}"! 

Here's what I recommend for learning TigerGraph:

**Getting Started:**
${relevantResources.slice(0, 3).map(r => `• **${r.title}** - ${r.type} for ${r.skill_level} level`).join('\n')}

These resources will help you understand the fundamentals and get hands-on experience.

Would you like me to create a personalized learning path based on your experience level and goals?`,
      citations,
    });
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // Build chat with context
    const contextMessage = SYSTEM_PROMPT + resourceContext;
    
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: contextMessage }] },
        { role: "model", parts: [{ text: "I understand. I'm ready to help developers learn TigerGraph! I'll recommend specific resources from our library when relevant." }] },
        ...history.map(msg => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        })),
      ],
    });
    
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();
    
    // Extract citations based on resources mentioned or related to the query
    const citations = relevantResources.slice(0, 3).map(r => ({
      title: r.title,
      url: r.url,
      type: r.type,
    }));
    
    res.json({
      response: text,
      citations,
    });
  } catch (error) {
    console.error('Gemini API error:', error);
    
    // Return fallback response on error
    const citations = relevantResources.slice(0, 2).map(r => ({
      title: r.title,
      url: r.url,
      type: r.type,
    }));
    
    res.json({
      response: `I'd be happy to help you with "${message}"! 

While I'm having trouble connecting to my AI service, here are some resources that might help:

${relevantResources.slice(0, 3).map(r => `• **${r.title}** (${r.type})`).join('\n')}

You can also try the Pathfinder to get a personalized learning path!`,
      citations,
    });
  }
});

// GET /api/chat/suggestions - Get suggested prompts
router.get('/suggestions', async (req, res) => {
  const suggestions = [
    "What's the best way to get started with TigerGraph?",
    "Show me fraud detection tutorials",
    "How do I write my first GSQL query?",
    "Explain GraphRAG with TigerGraph",
    "What are graph algorithms useful for?",
    "Help me learn about recommendation engines",
  ];
  
  res.json(suggestions);
});

module.exports = router;
