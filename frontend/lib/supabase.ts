import { createBrowserClient } from '@supabase/ssr';
import { Session } from '@supabase/supabase-js';

// Create a Supabase client for browser-side operations
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Export a singleton instance for convenience
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;
let instanceCount = 0;

export function getSupabase() {
  if (!supabaseInstance) {
    instanceCount++;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/40d92828-9f17-455f-a0e1-01c5e52c9c7a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'supabase.ts:getSupabase',message:'Creating NEW Supabase client',data:{instanceCount},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    supabaseInstance = createClient();
  }
  return supabaseInstance;
}

// Store the current session for synchronous access (updated by AuthProvider)
let currentSession: Session | null = null;

export function setCurrentSession(session: Session | null) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/40d92828-9f17-455f-a0e1-01c5e52c9c7a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'supabase.ts:setCurrentSession',message:'Setting current session',data:{hasSession:!!session,userEmail:session?.user?.email},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  currentSession = session;
}

export function getCurrentSession(): Session | null {
  return currentSession;
}

// Types for user-related data
export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface UserBookmark {
  id: string;
  user_id: string;
  resource_id: string;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  resource_id: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}
