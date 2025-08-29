import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback for development/demo mode
const defaultUrl = 'https://demo.supabase.co';
const defaultKey = 'demo-key';

export const supabase = createClient(
  supabaseUrl || defaultUrl, 
  supabaseAnonKey || defaultKey
);

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
  created_at: string;
  updated_at: string;
}