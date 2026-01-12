const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'tutorial' | 'docs' | 'blog';
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  useCases: string[];
  thumbnail: string;
  url: string;
  duration: string;
  createdAt?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  response: string;
  citations: Array<{
    title: string;
    url: string;
    type: string;
  }>;
}

export interface LearningPath {
  title: string;
  duration: string;
  description: string;
  milestones: Array<{
    week: number;
    title: string;
    description: string;
    resources: Array<{
      title: string;
      type: string;
      duration: string;
    }>;
  }>;
}

// Resources API
export async function getResources(params?: {
  skillLevel?: string;
  type?: string;
  useCase?: string;
  search?: string;
}): Promise<{ data: Resource[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params?.skillLevel) searchParams.set('skillLevel', params.skillLevel);
  if (params?.type) searchParams.set('type', params.type);
  if (params?.useCase) searchParams.set('useCase', params.useCase);
  if (params?.search) searchParams.set('search', params.search);

  const url = `${API_URL}/resources${searchParams.toString() ? `?${searchParams}` : ''}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch resources');
    return res.json();
  } catch (error) {
    console.error('API Error:', error);
    // Return empty data on error
    return { data: [], total: 0 };
  }
}

export async function getResource(id: string): Promise<Resource | null> {
  try {
    const res = await fetch(`${API_URL}/resources/${id}`);
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
}

// Chat API
export async function sendChatMessage(
  message: string,
  history: ChatMessage[] = []
): Promise<ChatResponse> {
  try {
    const res = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });
    
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  } catch (error) {
    console.error('API Error:', error);
    return {
      response: "I'm having trouble connecting to the server. Please try again later.",
      citations: [],
    };
  }
}

// Pathfinder API
export async function generateLearningPath(answers: {
  experience: string;
  goal: string;
  usecase: string;
  time: string;
}): Promise<LearningPath> {
  try {
    const res = await fetch(`${API_URL}/pathfinder/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answers),
    });
    
    if (!res.ok) throw new Error('Failed to generate path');
    return res.json();
  } catch (error) {
    console.error('API Error:', error);
    // Return a default path on error
    return {
      title: "TigerGraph Explorer Path",
      duration: "3 weeks",
      description: "A balanced introduction to TigerGraph.",
      milestones: [],
    };
  }
}

export async function getLearningPaths(): Promise<Array<{
  id: string;
  title: string;
  duration: string;
  description: string;
  milestoneCount: number;
}>> {
  try {
    const res = await fetch(`${API_URL}/pathfinder/paths`);
    if (!res.ok) throw new Error('Failed to fetch paths');
    return res.json();
  } catch (error) {
    console.error('API Error:', error);
    return [];
  }
}
