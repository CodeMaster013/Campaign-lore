/*
  # Add lore entries table and approval system

  1. New Tables
    - `lore_entries`
      - `id` (uuid, primary key)
      - `entry_id` (text, unique identifier)
      - `name` (text, entry name)
      - `type` (text, entry type)
      - `clearance_level` (text, required clearance)
      - `classification` (text, classification level)
      - `description` (text, main description)
      - `details` (jsonb, array of detail strings)
      - `relations` (jsonb, relationships object)
      - `status` (text, current status)
      - `location` (text, location info)
      - `notable` (jsonb, array of notable items)
      - `warnings` (jsonb, array of warnings)
      - `restricted` (text, restriction notice)
      - `is_approved` (boolean, approval status)
      - `submitted_by` (uuid, submitter reference)
      - `approved_by` (uuid, approver reference)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `lore_entries` table
    - Add policies for reading approved entries based on clearance
    - Add policies for admins to manage all entries
    - Add policies for users to submit entries for approval
    - Add policies for users to read their own submissions
*/

CREATE TABLE IF NOT EXISTS lore_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id text UNIQUE NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  clearance_level text NOT NULL DEFAULT 'Beta',
  classification text NOT NULL,
  description text NOT NULL,
  details jsonb DEFAULT '[]'::jsonb,
  relations jsonb DEFAULT '{}'::jsonb,
  status text,
  location text,
  notable jsonb DEFAULT '[]'::jsonb,
  warnings jsonb DEFAULT '[]'::jsonb,
  restricted text,
  is_approved boolean DEFAULT false,
  submitted_by uuid REFERENCES users(id),
  approved_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable row-level security (RLS)
ALTER TABLE lore_entries ENABLE ROW LEVEL SECURITY;

-- Users can read approved entries based on their clearance level
CREATE POLICY "Users can read approved lore based on clearance"
  ON lore_entries
  FOR SELECT
  TO authenticated
  USING (
    is_approved = true AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND (
        users.role = 'admin' OR
        users.clearance_level = 'Omega' OR
        (users.clearance_level = 'Alpha' AND lore_entries.clearance_level = ANY(ARRAY['Beta', 'Alpha'])) OR
        (users.clearance_level = 'Beta' AND lore_entries.clearance_level = 'Beta')
      )
    )
  );

-- Users can read their own submissions (approved or pending)
CREATE POLICY "Users can read own submissions"
  ON lore_entries
  FOR SELECT
  TO authenticated
  USING (submitted_by = auth.uid());

-- Admins can read all entries
CREATE POLICY "Admins can read all lore entries"
  ON lore_entries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Users can submit new entries for approval
CREATE POLICY "Users can submit lore entries"
  ON lore_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    submitted_by = auth.uid() AND
    is_approved = false
  );

-- Users can update their own pending submissions
CREATE POLICY "Users can update own pending submissions"
  ON lore_entries
  FOR UPDATE
  TO authenticated
  USING (
    submitted_by = auth.uid() AND
    is_approved = false
  )
  WITH CHECK (
    submitted_by = auth.uid() AND
    is_approved = false
  );

-- Admins can manage all lore entries
CREATE POLICY "Admins can manage all lore entries"
  ON lore_entries
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Add constraints
-- The fix: DROP the constraint if it already exists before adding it.
ALTER TABLE lore_entries 
DROP CONSTRAINT IF EXISTS lore_entries_clearance_level_check;

ALTER TABLE lore_entries 
ADD CONSTRAINT lore_entries_clearance_level_check 
CHECK (clearance_level = ANY(ARRAY['Beta', 'Alpha', 'Omega']));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lore_entries_approved ON lore_entries(is_approved);
CREATE INDEX IF NOT EXISTS idx_lore_entries_clearance ON lore_entries(clearance_level);
CREATE INDEX IF NOT EXISTS idx_lore_entries_type ON lore_entries(type);
CREATE INDEX IF NOT EXISTS idx_lore_entries_submitted_by ON lore_entries(submitted_by);
