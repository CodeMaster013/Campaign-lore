import { createClient } from '@supabase/supabase-js';

const demoMode = (import.meta as any).env?.VITE_DEMO_AUTH === 'true';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Enforce explicit configuration to avoid accidental use of an invalid project
if (!supabaseUrl || !supabaseAnonKey) {
  if (!demoMode) {
    // Provide a clear runtime error with guidance
    // Note: Vite only exposes variables prefixed with VITE_
    throw new Error(
      'Supabase configuration missing: VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY are not set. ' +
      'Set these env vars in your Vite environment (e.g., .env.local) and on your hosting platform.'
    );
  }
}

function createDemoSupabase() {
  // Very small mock implementing methods we use in the app
  const auth = {
    async getSession() {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('demo_session') : null;
      const session = raw ? JSON.parse(raw) : null;
      return { data: { session }, error: null } as any;
    },
    onAuthStateChange(_cb: any) {
      // No-op subscription in demo mode
      return { data: { subscription: { unsubscribe() {} } } } as any;
    },
    async signInWithPassword() {
      // Not used in demo mode path; return a predictable error if called
      return { data: { user: null, session: null }, error: { message: 'DEMO_MODE_NO_REMOTE_AUTH' } } as any;
    },
    async signOut() {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('demo_session');
      }
      return { error: null } as any;
    }
  };

  const fromHandler = () => ({
    select() { return this; },
    eq() { return this; },
    neq() { return this; },
    not() { return this; },
    is() { return this; },
    order() { return this; },
    async maybeSingle() { return { data: null, error: { code: 'PGRST116', message: 'No rows' } } as any; },
    async insert() { return { data: null, error: null } as any; },
    async update() { return { data: null, error: null } as any; },
    // Add the missing async method that returns data
    then(resolve: any) {
      // This makes the query builder thenable, allowing it to be awaited
      resolve({ data: [], error: null });
      return this;
    }
  });

  const channel = () => ({
    on() { return this; },
    subscribe() { 
      return { 
        unsubscribe() {} 
      }; 
    }
  });

  return { 
    auth, 
    from: (_: string) => fromHandler(),
    channel: (_: string) => channel()
  } as any;
}

export const supabase = demoMode
  ? createDemoSupabase()
  : createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });

// Database types
export interface User {
  id: string;
  username: string;
  display_name: string;
  email?: string;
  clearance_level: 'Beta' | 'Alpha' | 'Omega';
  role: 'player' | 'admin';
  avatar?: string;
  join_date: string;
  last_active: string;
  is_active: boolean;
  created_at: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'failed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to: string[];
  objectives: string[];
  rewards?: string;
  location?: string;
  clearance_required: 'Beta' | 'Alpha' | 'Omega';
  created_by: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface NPC {
  id: string;
  name: string;
  title?: string;
  faction?: string;
  location?: string;
  description: string;
  personality?: string;
  appearance?: string;
  background?: string;
  relationships: Record<string, string>;
  status: 'alive' | 'dead' | 'missing' | 'unknown';
  clearance_level: 'Beta' | 'Alpha' | 'Omega';
  tags: string[];
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface StarSystem {
  id: string;
  name: string;
  coordinates: { x: number; y: number; z: number };
  system_type: string;
  stars: string[];
  planets: string[];
  description?: string;
  faction_control?: string;
  trade_routes: string[];
  hazards: string[];
  points_of_interest: Array<{ name: string; description: string }>;
  clearance_level: 'Beta' | 'Alpha' | 'Omega';
  is_explored: boolean;
  created_at: string;
  updated_at: string;
}

export interface SessionNote {
  id: string;
  session_number: number;
  title: string;
  date: string;
  summary: string;
  key_events: string[];
  player_actions: Record<string, string>;
  npc_interactions: string[];
  locations_visited: string[];
  loot_gained: string[];
  xp_awarded: number;
  next_session_prep?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Communication {
  id: string;
  sender_id: string;
  recipient_id?: string;
  channel: string;
  message: string;
  message_type: 'text' | 'encrypted' | 'system' | 'transmission';
  clearance_required: 'Beta' | 'Alpha' | 'Omega';
  is_read: boolean;
  created_at: string;
  sender?: User;
  recipient?: User;
}

export interface LoreEntry {
  id: string;
  entry_id: string;
  name: string;
  type: string;
  clearance_level: 'Beta' | 'Alpha' | 'Omega';
  classification: string;
  description: string;
  details: string[];
  relations: Record<string, string[]>;
  status?: string;
  location?: string;
  notable: string[];
  warnings: string[];
  restricted?: string;
  is_approved: boolean;
  submitted_by: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}
