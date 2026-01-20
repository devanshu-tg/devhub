const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { supabase } = require('../config/supabase');

// Initialize Gemini (will use API key from env)
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// =============================================================================
// CONVERSATION STATE MACHINE
// =============================================================================
const CONV_STATES = {
  IDLE: 'idle',                     // Initial state - waiting for user
  GREETING: 'greeting',             // User just greeted
  ASKING_TOPIC: 'asking_topic',     // Asked user what topic they want
  ASKING_SKILL: 'asking_skill',     // Asked user their skill level
  ASKING_GOAL: 'asking_goal',       // Asked user their learning goal
  READY_TO_SEARCH: 'ready_to_search', // Have enough context to search
  SHOWING_RESOURCES: 'showing_resources', // Displayed resources
  FOLLOW_UP: 'follow_up',           // Following up after showing resources
  EXPLAINING: 'explaining'          // Explaining a concept (no resources needed)
};

// =============================================================================
// GREETING & SIMPLE RESPONSE DETECTION
// =============================================================================
const GREETING_PATTERNS = [
  /^(hi|hello|hey|hola|howdy|greetings|sup|yo)$/i,
  /^(hi|hello|hey|hola|howdy)\s*(there|!|\.)*$/i,
  /^good\s*(morning|afternoon|evening|day)/i,
  /^what'?s?\s*up/i,
  /^how\s*(are\s*you|r\s*u)/i
];

const THANKS_PATTERNS = [
  /^(thanks|thank\s*you|thx|ty|cheers|appreciated)/i,
  /thanks\s*(a\s*lot|so\s*much|!)/i
];

const AFFIRMATIVE_PATTERNS = [
  /^(yes|yeah|yep|yup|sure|ok|okay|alright|sounds\s*good|let'?s?\s*go|go\s*ahead)$/i,
  /^(please|pls)$/i
];

function isGreeting(message) {
  const trimmed = message.trim();
  return GREETING_PATTERNS.some(pattern => pattern.test(trimmed));
}

function isThanks(message) {
  return THANKS_PATTERNS.some(pattern => pattern.test(message.trim()));
}

function isAffirmative(message) {
  return AFFIRMATIVE_PATTERNS.some(pattern => pattern.test(message.trim()));
}

// =============================================================================
// TOPIC DETECTION
// =============================================================================
const TOPICS = {
  gsql: {
    keywords: ['gsql', 'query', 'select', 'accum', 'accumulator', 'pattern matching', 'syntax', 'queries'],
    displayName: 'GSQL Query Language',
    description: 'TigerGraph\'s powerful graph query language'
  },
  fraud: {
    keywords: ['fraud', 'detection', 'financial', 'crime', 'aml', 'kyc', 'risk', 'anti-money'],
    displayName: 'Fraud Detection',
    description: 'Real-time fraud detection and prevention'
  },
  recommendations: {
    keywords: ['recommend', 'recommendation', 'personalization', 'collaborative', 'filtering', 'suggest'],
    displayName: 'Recommendation Engines',
    description: 'Build personalized recommendation systems'
  },
  graphrag: {
    keywords: ['graphrag', 'rag', 'retrieval', 'augmented', 'generation', 'llm', 'ai', 'gpt', 'chatbot'],
    displayName: 'GraphRAG & AI',
    description: 'Combine graph databases with LLMs'
  },
  gnn: {
    keywords: ['gnn', 'neural', 'network', 'machine learning', 'ml', 'deep learning', 'embedding'],
    displayName: 'Graph Neural Networks',
    description: 'Machine learning on graphs'
  },
  schema: {
    keywords: ['schema', 'design', 'model', 'vertex', 'edge', 'graph model', 'data model', 'vertices', 'edges'],
    displayName: 'Schema Design',
    description: 'Design effective graph data models'
  },
  cloud: {
    keywords: ['cloud', 'setup', 'deploy', 'installation', 'cluster', 'savanna', 'tgcloud'],
    displayName: 'TigerGraph Cloud',
    description: 'Deploy and manage in the cloud'
  },
  algorithms: {
    keywords: ['algorithm', 'pagerank', 'shortest path', 'community', 'centrality', 'betweenness', 'closeness'],
    displayName: 'Graph Algorithms',
    description: 'PageRank, shortest path, community detection'
  },
  python: {
    keywords: ['python', 'pytigergraph', 'pytg', 'connector', 'sdk', 'api'],
    displayName: 'pyTigerGraph',
    description: 'Python connector and tools'
  },
  getting_started: {
    keywords: ['started', 'begin', 'intro', 'introduction', 'basics', 'fundamental', 'new', 'first', 'beginner'],
    displayName: 'Getting Started',
    description: 'Introduction to TigerGraph'
  }
};

function detectTopic(message) {
  const lowerMessage = message.toLowerCase();
  
  for (const [topicId, topicData] of Object.entries(TOPICS)) {
    for (const keyword of topicData.keywords) {
      if (lowerMessage.includes(keyword)) {
        return { id: topicId, ...topicData };
      }
    }
  }
  
  return null;
}

function detectMultipleTopics(message) {
  const lowerMessage = message.toLowerCase();
  const foundTopics = [];
  
  for (const [topicId, topicData] of Object.entries(TOPICS)) {
    for (const keyword of topicData.keywords) {
      if (lowerMessage.includes(keyword)) {
        foundTopics.push({ id: topicId, ...topicData });
        break;
      }
    }
  }
  
  return foundTopics;
}

// =============================================================================
// SKILL LEVEL DETECTION
// =============================================================================
const SKILL_LEVELS = {
  beginner: {
    patterns: [
      /beginner/i, /new\s*(to|at)/i, /just\s*start/i, /never\s*(used|tried)/i,
      /don'?t\s*know/i, /no\s*experience/i, /first\s*time/i, /newbie/i,
      /complete\s*beginner/i, /totally\s*new/i, /zero\s*experience/i
    ],
    displayName: 'Beginner',
    description: 'New to TigerGraph and graph databases'
  },
  intermediate: {
    patterns: [
      /intermediate/i, /some\s*experience/i, /know\s*(sql|basics)/i,
      /familiar\s*with/i, /used\s*(it|tigergraph)\s*before/i,
      /worked\s*with/i, /understand\s*(the)?\s*basics/i
    ],
    displayName: 'Intermediate',
    description: 'Familiar with basics, ready for more'
  },
  advanced: {
    patterns: [
      /advanced/i, /expert/i, /experienced/i, /proficient/i,
      /deep\s*dive/i, /complex/i, /optimization/i, /performance/i,
      /production/i, /scale/i
    ],
    displayName: 'Advanced',
    description: 'Experienced, looking for advanced topics'
  }
};

function detectSkillLevel(message) {
  const lowerMessage = message.toLowerCase();
  
  for (const [level, data] of Object.entries(SKILL_LEVELS)) {
    for (const pattern of data.patterns) {
      if (pattern.test(lowerMessage)) {
        return { level, ...data };
      }
    }
  }
  
  return null;
}

// =============================================================================
// LEARNING GOAL DETECTION
// =============================================================================
const LEARNING_GOALS = {
  learn_basics: {
    patterns: [/learn\s*(the)?\s*basics/i, /understand/i, /get\s*started/i, /introduction/i, /fundamentals/i],
    displayName: 'Learn the basics'
  },
  build_project: {
    patterns: [/build/i, /create/i, /project/i, /application/i, /app/i, /implement/i],
    displayName: 'Build a project'
  },
  write_queries: {
    patterns: [/write\s*queries/i, /query/i, /gsql/i, /select/i],
    displayName: 'Write queries'
  },
  optimize: {
    patterns: [/optimize/i, /performance/i, /faster/i, /improve/i, /scale/i],
    displayName: 'Optimize performance'
  },
  explore_usecase: {
    patterns: [/use\s*case/i, /example/i, /real\s*world/i, /practical/i],
    displayName: 'Explore use cases'
  }
};

function detectLearningGoal(message) {
  const lowerMessage = message.toLowerCase();
  
  for (const [goalId, data] of Object.entries(LEARNING_GOALS)) {
    for (const pattern of data.patterns) {
      if (pattern.test(lowerMessage)) {
        return { id: goalId, ...data };
      }
    }
  }
  
  return null;
}

// =============================================================================
// EXPLICIT RESOURCE REQUEST DETECTION
// =============================================================================
function hasExplicitResourceRequest(message) {
  const patterns = [
    /show\s*me/i,
    /find\s*(me)?\s*(some|a|the)?/i,
    /looking\s*for/i,
    /any\s*(videos?|tutorials?|docs?|documentation|resources?)/i,
    /recommend/i,
    /suggest/i,
    /resources?\s*(for|on|about)/i,
    /give\s*me/i,
    /what\s*(videos?|tutorials?|docs?|resources?)/i,
    /list\s*(of)?\s*(videos?|tutorials?|docs?|resources?)/i
  ];
  
  return patterns.some(pattern => pattern.test(message));
}

// =============================================================================
// CONCEPT EXPLANATION REQUEST DETECTION
// =============================================================================
function hasExplanationRequest(message) {
  const patterns = [
    /what\s*(is|are|does)/i,
    /explain/i,
    /tell\s*me\s*(about|what)/i,
    /define/i,
    /meaning\s*of/i,
    /difference\s*between/i,
    /how\s*does\s*.+\s*work/i,
    /can\s*you\s*explain/i,
    /help\s*me\s*understand/i
  ];
  
  return patterns.some(pattern => pattern.test(message));
}

// =============================================================================
// QUICK REPLY GENERATORS
// =============================================================================
function getTopicQuickReplies() {
  return [
    { text: "GSQL Query Language", action: "topic_gsql" },
    { text: "Fraud Detection", action: "topic_fraud" },
    { text: "GraphRAG & AI", action: "topic_graphrag" },
    { text: "Recommendation Engines", action: "topic_recommendations" },
    { text: "Schema Design", action: "topic_schema" },
    { text: "Something else", action: "topic_other" }
  ];
}

function getSkillQuickReplies() {
  return [
    { text: "Complete beginner", action: "skill_beginner" },
    { text: "I know SQL", action: "skill_knows_sql" },
    { text: "Some graph experience", action: "skill_intermediate" },
    { text: "Advanced user", action: "skill_advanced" }
  ];
}

function getGoalQuickReplies(topic) {
  const baseReplies = [
    { text: "Learn the basics", action: "goal_basics" },
    { text: "Build a project", action: "goal_project" }
  ];
  
  if (topic === 'gsql') {
    return [
      ...baseReplies,
      { text: "Write complex queries", action: "goal_queries" },
      { text: "See examples", action: "goal_examples" }
    ];
  } else if (topic === 'fraud' || topic === 'recommendations') {
    return [
      ...baseReplies,
      { text: "See real-world examples", action: "goal_examples" },
      { text: "Technical deep dive", action: "goal_technical" }
    ];
  }
  
  return [
    ...baseReplies,
    { text: "Understand concepts", action: "goal_concepts" },
    { text: "See examples", action: "goal_examples" }
  ];
}

function getFollowUpQuickReplies(topic) {
  return [
    { text: "Show more resources", action: "more_resources" },
    { text: "Explain a concept", action: "explain_concept" },
    { text: "Different topic", action: "new_topic" },
    { text: "I'm done, thanks!", action: "done" }
  ];
}

// =============================================================================
// SMART RESOURCE SEARCH (Only when we have context)
// =============================================================================
async function searchResourcesWithContext(userProfile, options = {}) {
  if (!supabase) return [];
  
  const { excludeIds = [] } = options;
  
  console.log('Search called with excludeIds:', excludeIds.length, 'IDs');
  
  try {
    // Get ALL resources - no limit to ensure we get videos, tutorials, AND docs
    let query = supabase
      .from('resources')
      .select('id, title, description, type, skill_level, url, thumbnail, duration, use_cases');
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    let results = data || [];
    console.log('Total resources fetched:', results.length);
    
    // Filter out already shown resources
    if (excludeIds.length > 0) {
      const excludeSet = new Set(excludeIds);
      results = results.filter(r => !excludeSet.has(r.id));
      console.log('After excluding shown:', results.length);
    }
    
    // Score and rank results
    results = results.map(r => {
      let score = 0;
      const titleLower = r.title.toLowerCase();
      const descLower = (r.description || '').toLowerCase();
      
      // Topic keyword match scoring (highest priority)
      if (userProfile.topic) {
        const topicData = TOPICS[userProfile.topic];
        if (topicData) {
          for (const keyword of topicData.keywords) {
            if (titleLower.includes(keyword)) score += 20;
            if (descLower.includes(keyword)) score += 8;
          }
        }
      }
      
      // Skill level match - bonus for matching, but don't exclude others
      if (userProfile.skillLevel) {
        if (r.skill_level === userProfile.skillLevel) {
          score += 10;
        }
      }
      
      // Type scoring - BALANCED to ensure variety
      // Give docs a boost since they're underrepresented
      if (r.type === 'docs') score += 5;
      if (r.type === 'tutorial') score += 4;
      if (r.type === 'video') score += 3;
      
      // Use case match
      if (userProfile.topic && r.use_cases) {
        if (r.use_cases.includes(userProfile.topic)) score += 15;
      }
      
      return { ...r, relevanceScore: score };
    });
    
    // Sort by relevance
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Get top results but ENSURE TYPE DIVERSITY
    const finalResults = [];
    const typeCount = { video: 0, tutorial: 0, docs: 0 };
    const maxPerType = 4; // Max 4 of each type
    const targetTotal = 12; // Return 12 resources total
    
    // First pass: get diverse results
    for (const r of results) {
      if (finalResults.length >= targetTotal) break;
      
      const type = r.type || 'docs';
      if (typeCount[type] < maxPerType) {
        finalResults.push(r);
        typeCount[type]++;
      }
    }
    
    // If we don't have enough, fill with remaining
    if (finalResults.length < targetTotal) {
      const addedIds = new Set(finalResults.map(r => r.id));
      for (const r of results) {
        if (finalResults.length >= targetTotal) break;
        if (!addedIds.has(r.id)) {
          finalResults.push(r);
        }
      }
    }
    
    console.log('Final results:', finalResults.length, 'Types:', typeCount);
    
    return finalResults;
  } catch (error) {
    console.error('Search error:', error);
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
// ENHANCED SYSTEM PROMPT FOR GEMINI
// =============================================================================
const TEACHER_SYSTEM_PROMPT = `You are TigerGraph Learning Assistant - a friendly, patient teacher who helps developers learn TigerGraph.

## YOUR TEACHING STYLE
- Be conversational, warm, and encouraging - like a supportive mentor
- Ask ONE question at a time to understand the student's needs
- Never dump information without understanding what they need first
- Celebrate progress and encourage exploration

## STRICT RULES
1. ONLY discuss TigerGraph, GSQL, graph databases, and directly related topics
2. If asked about unrelated topics, politely redirect: "I specialize in TigerGraph - let's focus on that! What would you like to learn?"
3. NEVER show resources unless you understand what the user needs
4. When showing resources, explain WHY each one is relevant

## CONVERSATION FLOW
When a user greets you:
- Welcome them warmly
- Ask what topic they'd like to explore (DON'T show resources yet!)

When a user mentions a topic:
- Acknowledge their interest
- Ask about their experience level with that topic

When you know their topic AND skill level:
- NOW you can recommend specific resources
- Explain why each resource fits their needs
- Offer to explain concepts or show more resources

## AVAILABLE TOPICS
- GSQL query language
- Fraud detection
- Recommendation engines  
- GraphRAG (combining graphs with AI)
- Schema design
- TigerGraph Cloud
- Graph algorithms
- pyTigerGraph (Python)

Remember: You're a teacher first. Understand before recommending.`;

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
// Q&A MODE HANDLER
// =============================================================================
async function handleQAMode(req, res, message, history) {
  let response = '';
  let resources = [];
  
  // Try to use Gemini for direct Q&A
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      // Build chat history
      const chatHistory = [
        { role: "user", parts: [{ text: QA_SYSTEM_PROMPT }] },
        { role: "model", parts: [{ text: "I understand! I'm ready to answer your questions about TigerGraph, GSQL, and graph databases directly. What would you like to know?" }] },
        ...history.map(msg => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        })),
      ];
      
      const chat = model.startChat({ history: chatHistory });
      const result = await chat.sendMessage(message);
      response = result.response.text();
      
      // Optionally find 1-2 relevant resources if the question is about a specific topic
      const detectedTopic = detectTopic(message);
      if (detectedTopic && supabase) {
        try {
          const { data } = await supabase
            .from('resources')
            .select('id, title, type, skill_level, url')
            .or(`title.ilike.%${detectedTopic.keywords[0]}%,description.ilike.%${detectedTopic.keywords[0]}%`)
            .limit(2);
          
          if (data && data.length > 0) {
            resources = data.map(r => ({
              id: r.id,
              title: r.title,
              type: r.type,
              skillLevel: r.skill_level,
              url: r.url
            }));
            
            // Add a subtle suggestion at the end
            response += `\n\n---\n*Want to dive deeper? Check out: ${resources.map(r => `**${r.title}**`).join(' or ')}*`;
          }
        } catch (err) {
          console.error('Error fetching related resources:', err);
        }
      }
      
      return res.json({
        response,
        resources, // Minimal resources (0-2)
        quickReplies: [
          { text: "Tell me more", action: "tell_more" },
          { text: "Show me an example", action: "show_example" },
          { text: "Switch to Learning Mode", action: "switch_learning" }
        ],
        intent: 'qa_answer',
        context: { state: 'qa_mode', topic: detectedTopic?.id || null, skillLevel: null, goal: null }
      });
      
    } catch (error) {
      console.error('Gemini Q&A error:', error.message);
      // Fall through to fallback
    }
  }
  
  // Fallback response when Gemini is not available
  const detectedTopic = detectTopic(message);
  
  if (detectedTopic) {
    response = `Great question about **${detectedTopic.displayName}**!

While I'm having a brief connection issue with my AI backend, I can tell you that ${detectedTopic.description}.

For detailed information, I recommend switching to **Learning Mode** where I can guide you through curated resources on this topic.`;
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
// MAIN CONVERSATION HANDLER
// =============================================================================
router.post('/', async (req, res) => {
  const { message, history = [], conversationContext = {}, mode = 'learning' } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  // ==========================================================================
  // Q&A MODE - Direct answers without guided flow
  // ==========================================================================
  if (mode === 'qa') {
    return handleQAMode(req, res, message, history);
  }
  
  // ==========================================================================
  // LEARNING MODE - Guided flow with resources (existing behavior)
  // ==========================================================================
  
  // Parse incoming context (from frontend)
  let userProfile = {
    state: conversationContext.state || CONV_STATES.IDLE,
    topic: conversationContext.topic || null,
    skillLevel: conversationContext.skillLevel || null,
    goal: conversationContext.goal || null,
    background: conversationContext.background || null,
    shownResourceIds: conversationContext.shownResourceIds || [] // Track shown resources
  };
  
  let response = '';
  let resources = [];
  let quickReplies = [];
  let shouldSearch = false;
  let isShowMore = false; // Flag for "show more" requests
  
  // ==========================================================================
  // STATE MACHINE LOGIC
  // ==========================================================================
  
  // CASE 0: User asks for more resources
  const showMorePatterns = [
    /show\s*(me)?\s*more/i,
    /more\s*resources/i,
    /what\s*else/i,
    /any\s*other/i,
    /different\s*resources/i,
    /other\s*options/i
  ];
  
  if (showMorePatterns.some(p => p.test(message)) && userProfile.topic && userProfile.skillLevel) {
    isShowMore = true;
    shouldSearch = true;
    userProfile.state = CONV_STATES.SHOWING_RESOURCES;
  }
  
  // CASE 1: User says thanks
  if (isThanks(message)) {
    response = `You're welcome! I'm here whenever you need help with TigerGraph. 

Is there anything else you'd like to learn about? Feel free to ask about any topic!`;
    quickReplies = getTopicQuickReplies();
    userProfile.state = CONV_STATES.ASKING_TOPIC;
    
    return res.json({
      response,
      resources: [],
      quickReplies,
      intent: 'thanks',
      context: userProfile
    });
  }
  
  // CASE 2: User sends a greeting (Hi, Hello, etc.)
  if (isGreeting(message) && (userProfile.state === CONV_STATES.IDLE || !userProfile.topic)) {
    response = `Hey there! 👋 Welcome to TigerGraph Learning Assistant!

I'm here to help you master graph databases. Instead of overwhelming you with resources, let me understand what you need first.

**What topic interests you today?**`;
    
    quickReplies = getTopicQuickReplies();
    userProfile.state = CONV_STATES.ASKING_TOPIC;
    
    return res.json({
      response,
      resources: [], // NO resources on greeting!
      quickReplies,
      intent: 'greeting',
      context: userProfile
    });
  }
  
  // CASE 3: User explicitly requests resources ("show me tutorials", "find resources")
  if (hasExplicitResourceRequest(message)) {
    // Check if we have enough context
    const detectedTopic = detectTopic(message);
    const detectedSkill = detectSkillLevel(message);
    
    if (detectedTopic) {
      userProfile.topic = detectedTopic.id;
    }
    if (detectedSkill) {
      userProfile.skillLevel = detectedSkill.level;
    }
    
    // If we have topic, we can search
    if (userProfile.topic) {
      shouldSearch = true;
      
      // But first ask about skill level if we don't have it
      if (!userProfile.skillLevel) {
        const topicData = TOPICS[userProfile.topic];
        response = `Great! I'll find ${topicData.displayName} resources for you.

But first, let me personalize the recommendations - **what's your experience level?**`;
        
        quickReplies = getSkillQuickReplies();
        userProfile.state = CONV_STATES.ASKING_SKILL;
        
        return res.json({
          response,
          resources: [],
          quickReplies,
          intent: 'find_resource',
          context: userProfile
        });
      }
    } else {
      // No topic detected, ask what they want
      response = `I'd love to help you find the right resources!

**What topic are you interested in?**`;
      
      quickReplies = getTopicQuickReplies();
      userProfile.state = CONV_STATES.ASKING_TOPIC;
      
      return res.json({
        response,
        resources: [],
        quickReplies,
        intent: 'find_resource',
        context: userProfile
      });
    }
  }
  
  // CASE 4: User asks for explanation (concept question)
  if (hasExplanationRequest(message) && !hasExplicitResourceRequest(message)) {
    const detectedTopic = detectTopic(message);
    if (detectedTopic) {
      userProfile.topic = detectedTopic.id;
    }
    
    // Let Gemini handle the explanation, but DON'T search for resources yet
    userProfile.state = CONV_STATES.EXPLAINING;
    
    // Use Gemini for explanation
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `${TEACHER_SYSTEM_PROMPT}

The user asked: "${message}"

Explain this concept clearly and concisely. After explaining, ask if they'd like to see resources or learn more.
DO NOT list resources - just explain the concept and offer to help further.`;
        
        const result = await model.generateContent(prompt);
        response = result.response.text();
        
        quickReplies = [
          { text: "Show me resources", action: "show_resources" },
          { text: "Explain more", action: "explain_more" },
          { text: "Different topic", action: "new_topic" }
        ];
        
        return res.json({
          response,
          resources: [],
          quickReplies,
          intent: 'explain_concept',
          context: userProfile
        });
      } catch (error) {
        console.error('Gemini error:', error);
        // Fall through to fallback
      }
    }
    
    // Fallback explanation
    const topicName = detectedTopic ? detectedTopic.displayName : 'that concept';
    response = `That's a great question about ${topicName}!

Let me help you understand this better. Would you like me to:
- **Explain the concept** in simple terms
- **Show you resources** to learn more
- **See practical examples**

What would be most helpful?`;
    
    quickReplies = [
      { text: "Explain it simply", action: "explain_simple" },
      { text: "Show me resources", action: "show_resources" },
      { text: "Show examples", action: "show_examples" }
    ];
    
    return res.json({
      response,
      resources: [],
      quickReplies,
      intent: 'explain_concept',
      context: userProfile
    });
  }
  
  // CASE 5: We're in ASKING_TOPIC state and user mentions a topic
  if (userProfile.state === CONV_STATES.ASKING_TOPIC || !userProfile.topic) {
    const detectedTopic = detectTopic(message);
    
    if (detectedTopic) {
      userProfile.topic = detectedTopic.id;
      userProfile.state = CONV_STATES.ASKING_SKILL;
      
      response = `Excellent choice! **${detectedTopic.displayName}** is ${detectedTopic.description}.

To recommend the best resources for you, I need to know your current level.

**What's your experience with ${detectedTopic.displayName}?**`;
      
      quickReplies = getSkillQuickReplies();
      
      return res.json({
        response,
        resources: [],
        quickReplies,
        intent: 'topic_selected',
        context: userProfile
      });
    }
    
    // Check for "other" or general interest
    if (/other|something\s*else|different/i.test(message)) {
      response = `No problem! TigerGraph can be used for many things.

Could you tell me more about what you're trying to accomplish? For example:
- Are you working on a specific project?
- Is there a problem you're trying to solve?
- Or are you just exploring what's possible?`;
      
      quickReplies = [
        { text: "Working on a project", action: "has_project" },
        { text: "Solving a problem", action: "has_problem" },
        { text: "Just exploring", action: "exploring" }
      ];
      
      return res.json({
        response,
        resources: [],
        quickReplies,
        intent: 'clarifying',
        context: userProfile
      });
    }
  }
  
  // CASE 6: We're in ASKING_SKILL state and user mentions skill level
  if (userProfile.state === CONV_STATES.ASKING_SKILL || (userProfile.topic && !userProfile.skillLevel)) {
    const detectedSkill = detectSkillLevel(message);
    
    // Also check for "knows SQL" pattern
    const knowsSQL = /know\s*sql|familiar\s*with\s*sql|sql\s*background/i.test(message);
    
    if (detectedSkill || knowsSQL) {
      if (knowsSQL && !detectedSkill) {
        userProfile.skillLevel = 'intermediate';
        userProfile.background = 'knows_sql';
      } else {
        userProfile.skillLevel = detectedSkill.level;
      }
      
      userProfile.state = CONV_STATES.ASKING_GOAL;
      
      const topicData = TOPICS[userProfile.topic] || { displayName: 'TigerGraph' };
      const skillName = SKILL_LEVELS[userProfile.skillLevel]?.displayName || userProfile.skillLevel;
      
      let skillAck = '';
      if (userProfile.background === 'knows_sql') {
        skillAck = `Since you know SQL, you'll find GSQL quite familiar - it builds on SQL concepts!`;
      } else if (userProfile.skillLevel === 'beginner') {
        skillAck = `No worries - everyone starts somewhere! I'll make sure to recommend beginner-friendly content.`;
      } else if (userProfile.skillLevel === 'advanced') {
        skillAck = `Great to have an experienced user! I'll focus on advanced techniques and optimizations.`;
      } else {
        skillAck = `Got it - you have some experience. I'll find content that builds on what you know.`;
      }
      
      response = `${skillAck}

**What's your main goal with ${topicData.displayName}?**`;
      
      quickReplies = getGoalQuickReplies(userProfile.topic);
      
      return res.json({
        response,
        resources: [],
        quickReplies,
        intent: 'skill_selected',
        context: userProfile
      });
    }
  }
  
  // CASE 7: We're in ASKING_GOAL state or user mentions a goal
  if (userProfile.state === CONV_STATES.ASKING_GOAL || (userProfile.topic && userProfile.skillLevel)) {
    const detectedGoal = detectLearningGoal(message);
    
    if (detectedGoal) {
      userProfile.goal = detectedGoal.id;
    }
    
    // We have enough context - NOW we search!
    userProfile.state = CONV_STATES.SHOWING_RESOURCES;
    shouldSearch = true;
  }
  
  // CASE 8: Affirmative response when we have context
  if (isAffirmative(message) && userProfile.topic && userProfile.skillLevel) {
    userProfile.state = CONV_STATES.SHOWING_RESOURCES;
    shouldSearch = true;
  }
  
  // ==========================================================================
  // SEARCH AND RESPOND (only when shouldSearch is true)
  // ==========================================================================
  
  if (shouldSearch && userProfile.topic && userProfile.skillLevel) {
    // ALWAYS pass excludeIds to avoid repeats - accumulate across all searches
    const currentShownIds = userProfile.shownResourceIds || [];
    console.log('Current shown IDs before search:', currentShownIds.length);
    
    const searchOptions = {
      excludeIds: currentShownIds // Always exclude previously shown
    };
    
    resources = await searchResourcesWithContext(userProfile, searchOptions);
    const formattedResources = formatResources(resources);
    
    // Track shown resource IDs - accumulate all shown
    const newShownIds = formattedResources.map(r => r.id);
    userProfile.shownResourceIds = [...currentShownIds, ...newShownIds];
    console.log('Total shown IDs after search:', userProfile.shownResourceIds.length);
    
    const topicData = TOPICS[userProfile.topic] || { displayName: 'TigerGraph' };
    const skillName = SKILL_LEVELS[userProfile.skillLevel]?.displayName || userProfile.skillLevel;
    
    if (formattedResources.length > 0) {
      // Different response for "show more" vs initial results
      if (isShowMore) {
        response = `Here are **${formattedResources.length} more resources** for ${topicData.displayName}:`;
      } else {
        response = `Here's your personalized learning path for **${topicData.displayName}** (${skillName} level):

I've found **${formattedResources.length} resources** mixing videos, tutorials, and docs:`;
      }
      
      // Group resources by type for better presentation
      const videos = formattedResources.filter(r => r.type === 'video');
      const tutorials = formattedResources.filter(r => r.type === 'tutorial');
      const docs = formattedResources.filter(r => r.type === 'docs');
      
      // Add brief descriptions - show variety
      let counter = 1;
      if (videos.length > 0) {
        response += `\n\n📹 **Videos** (${videos.length}):`;
        videos.slice(0, 3).forEach(r => {
          response += `\n${counter}. **${r.title}** - ${r.skillLevel}`;
          counter++;
        });
      }
      if (tutorials.length > 0) {
        response += `\n\n📚 **Tutorials** (${tutorials.length}):`;
        tutorials.slice(0, 3).forEach(r => {
          response += `\n${counter}. **${r.title}** - ${r.skillLevel}`;
          counter++;
        });
      }
      if (docs.length > 0) {
        response += `\n\n📖 **Documentation** (${docs.length}):`;
        docs.slice(0, 3).forEach(r => {
          response += `\n${counter}. **${r.title}** - ${r.skillLevel}`;
          counter++;
        });
      }
      
      if (!isShowMore) {
        response += `\n\nI recommend starting with a video to get an overview, then diving into tutorials for hands-on practice!`;
      } else {
        response += `\n\nWant to see even more, or shall we explore a different aspect?`;
      }
    } else {
      if (isShowMore) {
        response = `I've shown you all the ${topicData.displayName} resources I have! 

Would you like to:
- **Explore a different topic** 
- **Change skill level** to see different content
- **Ask me to explain** a specific concept`;
      } else {
        response = `I couldn't find specific resources matching your criteria, but here's what I suggest:

1. Start with the **TigerGraph Getting Started guide** in our resource library
2. Check out the **GSQL 101** video series for fundamentals
3. Explore the **official documentation** for ${topicData.displayName}

Would you like me to search for something more specific?`;
      }
    }
    
    quickReplies = getFollowUpQuickReplies(userProfile.topic);
    
    return res.json({
      response,
      resources: formattedResources,
      quickReplies,
      intent: 'showing_resources',
      context: userProfile
    });
  }
  
  // ==========================================================================
  // FALLBACK: Use Gemini for complex queries or unknown states
  // ==========================================================================
  
  if (genAI) {
    try {
      // Build context for Gemini
      let contextInfo = '';
      if (userProfile.topic) {
        contextInfo += `\nUser's topic of interest: ${TOPICS[userProfile.topic]?.displayName || userProfile.topic}`;
      }
      if (userProfile.skillLevel) {
        contextInfo += `\nUser's skill level: ${userProfile.skillLevel}`;
      }
      if (userProfile.goal) {
        contextInfo += `\nUser's learning goal: ${userProfile.goal}`;
      }
      
      const enhancedPrompt = `${TEACHER_SYSTEM_PROMPT}

Current conversation state: ${userProfile.state}
${contextInfo}

Previous messages:
${history.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n')}

User says: "${message}"

Respond as a helpful teacher. If you don't know their topic or skill level yet, ASK - don't assume.
DO NOT show a list of resources unless you clearly understand what they need.
Keep responses concise (2-3 paragraphs max).`;
      
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(enhancedPrompt);
      response = result.response.text();
      
      // Determine appropriate quick replies based on state
      if (!userProfile.topic) {
        quickReplies = getTopicQuickReplies();
        userProfile.state = CONV_STATES.ASKING_TOPIC;
      } else if (!userProfile.skillLevel) {
        quickReplies = getSkillQuickReplies();
        userProfile.state = CONV_STATES.ASKING_SKILL;
      } else {
        quickReplies = getFollowUpQuickReplies(userProfile.topic);
      }
      
      return res.json({
        response,
        resources: [],
        quickReplies,
        intent: 'gemini_response',
        context: userProfile
      });
    } catch (error) {
      console.error('Gemini error:', error);
      // Fall through to static fallback
    }
  }
  
  // ==========================================================================
  // STATIC FALLBACK (no Gemini or Gemini failed)
  // ==========================================================================
  
  // Determine what to ask based on missing information
  if (!userProfile.topic) {
    response = `I'd love to help you learn TigerGraph! 

To give you the best recommendations, could you tell me what topic interests you most?`;
    quickReplies = getTopicQuickReplies();
    userProfile.state = CONV_STATES.ASKING_TOPIC;
  } else if (!userProfile.skillLevel) {
    const topicData = TOPICS[userProfile.topic];
    response = `Great, you're interested in ${topicData?.displayName || userProfile.topic}!

What's your current experience level?`;
    quickReplies = getSkillQuickReplies();
    userProfile.state = CONV_STATES.ASKING_SKILL;
  } else {
    response = `I'm here to help you learn ${TOPICS[userProfile.topic]?.displayName || 'TigerGraph'}!

What would you like to do next?`;
    quickReplies = getFollowUpQuickReplies(userProfile.topic);
  }
  
  return res.json({
    response,
    resources: [],
    quickReplies,
    intent: 'fallback',
    context: userProfile
  });
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
  const topics = Object.entries(TOPICS).map(([id, data]) => ({
    id,
    name: data.displayName,
    description: data.description
  }));
  
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
