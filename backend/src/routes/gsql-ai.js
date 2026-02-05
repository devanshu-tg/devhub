const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { authenticate } = require('../middleware/auth');

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
// GSQL AI GENERATION SYSTEM PROMPT
// =============================================================================
const GSQL_AI_SYSTEM_PROMPT = `You are an expert GSQL (TigerGraph Query Language) code generator. Your job is to generate production-ready, optimized GSQL queries based on user requirements.

## YOUR ROLE
- Generate clean, well-commented GSQL code
- Follow TigerGraph best practices
- Include proper error handling where applicable
- Use efficient graph traversal patterns
- Add helpful comments explaining complex logic

## GSQL SYNTAX RULES
1. **Query Structure**:
   - Use CREATE QUERY for new queries
   - Use INSTALL QUERY to install queries
   - Use RUN QUERY to execute queries

2. **Pattern Matching**:
   - Use FROM clause to define vertex sets
   - Use WHERE clause for filtering
   - Use SELECT clause to return results
   - Use ACCUM for aggregations

3. **Accumulators**:
   - SumAccum, MaxAccum, MinAccum, AvgAccum for numeric operations
   - ListAccum, SetAccum, MapAccum for collections
   - AndAccum, OrAccum for boolean operations

4. **Best Practices**:
   - Use meaningful variable names
   - Add comments for complex logic
   - Optimize traversal patterns (avoid unnecessary hops)
   - Use appropriate data types
   - Handle edge cases

## OUTPUT FORMAT
Always provide:
1. Complete, runnable GSQL code
2. Brief explanation of what the query does
3. Key features/patterns used
4. Usage example if applicable

## EXAMPLES

User: "Find all friends of friends for a given person"
You:
\`\`\`gsql
CREATE QUERY friendsOfFriends(vertex<Person> personId) FOR GRAPH SocialGraph {
  // Find friends of friends (2-hop traversal)
  SetAccum<vertex<Person>> @@friendsOfFriends;
  
  Start = {personId};
  
  // First hop: get direct friends
  Friends = SELECT t FROM Start:s -(FRIENDS)-> Person:t
            ACCUM @@friendsOfFriends += t;
  
  // Second hop: get friends of friends
  FriendsOfFriends = SELECT t FROM Friends:s -(FRIENDS)-> Person:t
                     WHERE t != personId AND t NOT IN @@friendsOfFriends
                     ACCUM @@friendsOfFriends += t;
  
  PRINT @@friendsOfFriends;
}
\`\`\`

**Explanation**: This query performs a 2-hop traversal to find friends of friends, excluding the original person and direct friends.

**Key Features**:
- Uses SetAccum to avoid duplicates
- Two-hop pattern matching
- Proper filtering with WHERE clause

---

User: "Calculate PageRank for all vertices"
You:
\`\`\`gsql
CREATE QUERY pageRank(FLOAT maxChange = 0.001, INT maxIter = 25, FLOAT damping = 0.85) FOR GRAPH MyGraph {
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

**Explanation**: Implements PageRank algorithm with configurable damping factor and convergence threshold.

**Key Features**:
- Iterative algorithm with convergence check
- Uses SumAccum for score accumulation
- Proper use of POST-ACCUM for updates

---

Now generate GSQL code based on user requirements.`;

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
    const { prompt, schema, context } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!genAI) {
      return res.status(503).json({ 
        error: 'GSQL AI service is not available. Please configure GEMINI_API_KEY.' 
      });
    }

    // Build the full prompt with context
    let fullPrompt = prompt;
    
    if (schema) {
      fullPrompt = `Schema Information:\n${schema}\n\nUser Request: ${prompt}`;
    }
    
    if (context) {
      fullPrompt = `${fullPrompt}\n\nAdditional Context: ${context}`;
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Build the complete prompt
    const completePrompt = `${GSQL_AI_SYSTEM_PROMPT}\n\nUser Request: ${fullPrompt}`;

    // Generate GSQL code
    const result = await model.generateContent(completePrompt);
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

    res.json({
      code,
      explanation: explanation || 'GSQL query generated successfully.',
      features,
      fullResponse: generatedText
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
