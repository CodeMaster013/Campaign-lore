/*
  # Campaign Database Schema

  1. New Tables
    - `users` - User accounts and profiles
    - `missions` - Active and completed quests
    - `npcs` - Non-player character database
    - `star_systems` - Interactive star map data
    - `session_notes` - DM session tracking
    - `communications` - Player message hub
    - `lore_entries` - Dynamic lore database

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access
    - Separate player and admin permissions
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  display_name text NOT NULL,
  email text UNIQUE,
  clearance_level text NOT NULL DEFAULT 'Beta' CHECK (clearance_level IN ('Beta', 'Alpha', 'Omega')),
  role text NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'admin')),
  avatar text,
  join_date timestamptz DEFAULT now(),
  last_active timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Missions table
CREATE TABLE IF NOT EXISTS missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'archived')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  assigned_to uuid[] DEFAULT '{}',
  objectives jsonb DEFAULT '[]',
  rewards text,
  location text,
  clearance_required text DEFAULT 'Beta' CHECK (clearance_required IN ('Beta', 'Alpha', 'Omega')),
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- NPCs table
CREATE TABLE IF NOT EXISTS npcs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text,
  faction text,
  location text,
  description text NOT NULL,
  personality text,
  appearance text,
  background text,
  relationships jsonb DEFAULT '{}',
  status text DEFAULT 'alive' CHECK (status IN ('alive', 'dead', 'missing', 'unknown')),
  clearance_level text DEFAULT 'Beta' CHECK (clearance_level IN ('Beta', 'Alpha', 'Omega')),
  tags text[] DEFAULT '{}',
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Star Systems table
CREATE TABLE IF NOT EXISTS star_systems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  coordinates jsonb NOT NULL, -- {x: number, y: number, z: number}
  system_type text DEFAULT 'standard',
  stars jsonb DEFAULT '[]',
  planets jsonb DEFAULT '[]',
  description text,
  faction_control text,
  trade_routes text[] DEFAULT '{}',
  hazards text[] DEFAULT '{}',
  points_of_interest jsonb DEFAULT '[]',
  clearance_level text DEFAULT 'Beta' CHECK (clearance_level IN ('Beta', 'Alpha', 'Omega')),
  is_explored boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Session Notes table
CREATE TABLE IF NOT EXISTS session_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_number integer NOT NULL,
  title text NOT NULL,
  date timestamptz NOT NULL,
  summary text NOT NULL,
  key_events text[] DEFAULT '{}',
  player_actions jsonb DEFAULT '{}',
  npc_interactions text[] DEFAULT '{}',
  locations_visited text[] DEFAULT '{}',
  loot_gained text[] DEFAULT '{}',
  xp_awarded integer DEFAULT 0,
  next_session_prep text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Communications table
CREATE TABLE IF NOT EXISTS communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES users(id),
  recipient_id uuid REFERENCES users(id), -- null for public messages
  channel text DEFAULT 'general',
  message text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'encrypted', 'system', 'transmission')),
  clearance_required text DEFAULT 'Beta' CHECK (clearance_required IN ('Beta', 'Alpha', 'Omega')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Lore Entries table (dynamic version of the static data)
CREATE TABLE IF NOT EXISTS lore_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id text UNIQUE NOT NULL, -- for backwards compatibility
  name text NOT NULL,
  type text NOT NULL,
  clearance_level text NOT NULL CHECK (clearance_level IN ('Beta', 'Alpha', 'Omega')),
  classification text NOT NULL,
  description text NOT NULL,
  details jsonb DEFAULT '[]',
  relations jsonb DEFAULT '{}',
  status text,
  location text,
  notable jsonb DEFAULT '[]',
  warnings jsonb DEFAULT '[]',
  restricted text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE npcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE star_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE lore_entries ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Missions policies
CREATE POLICY "Users can read missions based on clearance"
  ON missions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (
        role = 'admin' OR
        (clearance_level = 'Omega') OR
        (clearance_level = 'Alpha' AND missions.clearance_required IN ('Beta', 'Alpha')) OR
        (clearance_level = 'Beta' AND missions.clearance_required = 'Beta')
      )
    )
  );

CREATE POLICY "Admins can manage missions"
  ON missions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- NPCs policies
CREATE POLICY "Users can read NPCs based on clearance"
  ON npcs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (
        role = 'admin' OR
        (clearance_level = 'Omega') OR
        (clearance_level = 'Alpha' AND npcs.clearance_level IN ('Beta', 'Alpha')) OR
        (clearance_level = 'Beta' AND npcs.clearance_level = 'Beta')
      )
    )
  );

CREATE POLICY "Admins can manage NPCs"
  ON npcs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Star Systems policies
CREATE POLICY "Users can read star systems based on clearance"
  ON star_systems FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (
        role = 'admin' OR
        (clearance_level = 'Omega') OR
        (clearance_level = 'Alpha' AND star_systems.clearance_level IN ('Beta', 'Alpha')) OR
        (clearance_level = 'Beta' AND star_systems.clearance_level = 'Beta')
      )
    )
  );

CREATE POLICY "Admins can manage star systems"
  ON star_systems FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Session Notes policies (admin only)
CREATE POLICY "Admins can manage session notes"
  ON session_notes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Communications policies
CREATE POLICY "Users can read their communications"
  ON communications FOR SELECT
  TO authenticated
  USING (
    sender_id = auth.uid() OR 
    recipient_id = auth.uid() OR 
    recipient_id IS NULL OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can send communications"
  ON communications FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Admins can manage all communications"
  ON communications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Lore Entries policies
CREATE POLICY "Users can read lore based on clearance"
  ON lore_entries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (
        role = 'admin' OR
        (clearance_level = 'Omega') OR
        (clearance_level = 'Alpha' AND lore_entries.clearance_level IN ('Beta', 'Alpha')) OR
        (clearance_level = 'Beta' AND lore_entries.clearance_level = 'Beta')
      )
    )
  );

CREATE POLICY "Admins can manage lore entries"
  ON lore_entries FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );