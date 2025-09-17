/*
  # Demo Seed Data

  This migration seeds demo-friendly data for quick testing and previews.
  Safe to re-run: uses upserts or NOT EXISTS guards where applicable.

  Includes:
  - Demo users aligned with app mock credentials
  - A few missions, NPCs, star systems, session notes, communications, and lore entries

  Run with Supabase CLI:
    supabase db reset        -- to rebuild fresh including seeds
    # or
    supabase db push         -- to apply new migrations
*/

-- 1) Seed demo users (upsert by unique username/email)
WITH upsert AS (
  INSERT INTO users (username, display_name, email, clearance_level, role, avatar)
  VALUES
    ('founder', 'The Founder', 'founder@theseus.com', 'Omega', 'admin', '👑'),
    ('operative-alpha', 'Agent Mitchell', 'alpha@theseus.com', 'Alpha', 'admin', '🚀'),
    ('operative-beta', 'Operative Chen', 'beta@theseus.com', 'Beta', 'player', '⭐'),
    ('recruit', 'Recruit Davis', 'recruit@theseus.com', 'Beta', 'player', '🔰')
  ON CONFLICT (username) DO UPDATE
    SET display_name = EXCLUDED.display_name,
        email = EXCLUDED.email,
        clearance_level = EXCLUDED.clearance_level,
        role = EXCLUDED.role,
        avatar = EXCLUDED.avatar
  RETURNING id, username
),
selected_users AS (
  SELECT id, username FROM upsert
  UNION ALL
  SELECT id, username FROM users
  WHERE username IN ('founder', 'operative-alpha', 'operative-beta', 'recruit')
    AND username NOT IN (SELECT username FROM upsert)
)
SELECT 1; -- finalize CTE

-- 2) Missions (guard by title)
INSERT INTO missions (
  title, description, status, priority, assigned_to, objectives, rewards, location,
  clearance_required, created_by
)
SELECT 'Recover the Black Box',
       'An abandoned scout ship near the Perseus Drift holds a corrupted flight recorder. Retrieve and decrypt it.',
       'active', 'high',
       ARRAY[(SELECT id FROM users WHERE username = 'operative-alpha'),
             (SELECT id FROM users WHERE username = 'operative-beta')],
       '["Dock with derelict","Extract flight recorder","Bring to Theseus"]'::jsonb,
       '2x Prototype access keys, 500 credits',
       'Perseus Drift',
       'Alpha',
       (SELECT id FROM users WHERE username = 'founder')
WHERE NOT EXISTS (
  SELECT 1 FROM missions WHERE title = 'Recover the Black Box'
);

INSERT INTO missions (
  title, description, status, priority, assigned_to, objectives, rewards, location,
  clearance_required, created_by
)
SELECT 'Silent Outpost',
       'Outpost Theta-9 went dark. Investigate and re-establish contact. Expect hostiles.',
       'active', 'critical',
       ARRAY[(SELECT id FROM users WHERE username = 'operative-beta')],
       '["Land at Theta-9","Restore power","Locate survivors"]'::jsonb,
       '750 credits',
       'Theta-9',
       'Beta',
       (SELECT id FROM users WHERE username = 'founder')
WHERE NOT EXISTS (
  SELECT 1 FROM missions WHERE title = 'Silent Outpost'
);

-- 3) NPCs (guard by name)
INSERT INTO npcs (
  name, title, faction, location, description, personality, appearance, background,
  relationships, status, clearance_level, tags, image_url
)
SELECT 'Dr. Elara Voss', 'Chief Xenobiologist', 'United Labs', 'Theseus Station',
       'Renowned for her work on microbial AI symbiotes.',
       'Analytical, empathetic', 'White lab coat with holo-pins', 'Survivor of the Khepri Incident',
       '{"mentor_of": ["operative-beta"]}'::jsonb, 'alive', 'Alpha', '{scientist,ally}', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM npcs WHERE name = 'Dr. Elara Voss'
);

INSERT INTO npcs (
  name, title, faction, location, description, personality, appearance, background,
  relationships, status, clearance_level, tags, image_url
)
SELECT 'Captain Rourke', 'Station Security Chief', 'United Labs', 'Theseus Station',
       'Keeps the peace with a pragmatic, by-the-book approach.',
       'Gruff, dependable', 'Tactical vest, scarred cheek', 'Veteran of the Helios Mutiny',
       '{}', 'alive', 'Beta', '{security}', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM npcs WHERE name = 'Captain Rourke'
);

-- 4) Star systems (guard by name)
INSERT INTO star_systems (
  name, coordinates, system_type, stars, planets, description, faction_control, trade_routes,
  hazards, points_of_interest, clearance_level, is_explored
)
SELECT 'Theseus Prime', '{"x": 12, "y": -3, "z": 5}'::jsonb, 'standard', '[]'::jsonb, '[]'::jsonb,
       'Core operations system for United Labs.', 'United Labs', '{Theseus Corridor}', '{radiation}',
       '[{"name":"Station Alpha","description":"Primary research hub"}]'::jsonb,
       'Beta', true
WHERE NOT EXISTS (
  SELECT 1 FROM star_systems WHERE name = 'Theseus Prime'
);

INSERT INTO star_systems (
  name, coordinates, system_type, stars, planets, description, faction_control, trade_routes,
  hazards, points_of_interest, clearance_level, is_explored
)
SELECT 'Perseus Drift', '{"x": 48, "y": 7, "z": -22}'::jsonb, 'nebula', '[]'::jsonb, '[]'::jsonb,
       'Dense nebula region. Navigation is hazardous, scans are unreliable.', NULL, '{Smuggler Run}', '{ion_storm}',
       '[{"name":"Derelict Scout","description":"Source of black box"}]'::jsonb,
       'Alpha', false
WHERE NOT EXISTS (
  SELECT 1 FROM star_systems WHERE name = 'Perseus Drift'
);

-- 5) Session notes (guard by title)
INSERT INTO session_notes (
  session_number, title, date, summary, key_events, player_actions, npc_interactions, locations_visited,
  loot_gained, xp_awarded, next_session_prep, created_by
)
SELECT 1, 'Pilot Episode', now(),
       'Team assembled aboard Theseus Station. Initial briefing and first deployment.',
       '{Briefing,Launch}'::text[],
       '{"operative-alpha":"Secured docking bay","operative-beta":"Calibrated scanners"}'::jsonb,
       '{"Dr. Elara Voss","Captain Rourke"}'::text[],
       '{"Theseus Station"}'::text[],
       '{"Access keycard"}'::text[],
       100,
       'Prepare shuttle and decrypt preliminary data.',
       (SELECT id FROM users WHERE username = 'founder')
WHERE NOT EXISTS (
  SELECT 1 FROM session_notes WHERE title = 'Pilot Episode'
);

-- 6) Communications (guard by same sender, message, channel)
INSERT INTO communications (
  sender_id, recipient_id, channel, message, message_type, clearance_required, is_read
)
SELECT (SELECT id FROM users WHERE username = 'founder'), NULL, 'general',
       'Welcome to Theseus. Operatives, report to the briefing room.', 'system', 'Beta', true
WHERE NOT EXISTS (
  SELECT 1 FROM communications 
  WHERE channel = 'general' AND message = 'Welcome to Theseus. Operatives, report to the briefing room.'
);

INSERT INTO communications (
  sender_id, recipient_id, channel, message, message_type, clearance_required, is_read
)
SELECT (SELECT id FROM users WHERE username = 'operative-alpha'), (SELECT id FROM users WHERE username = 'operative-beta'), 'ops',
       'Chen, meet me at Hangar 2 in five.', 'text', 'Beta', false
WHERE NOT EXISTS (
  SELECT 1 FROM communications 
  WHERE channel = 'ops' AND message = 'Chen, meet me at Hangar 2 in five.'
);

-- 7) Lore entries (upsert by entry_id)
INSERT INTO lore_entries (
  entry_id, name, type, clearance_level, classification, description, details, relations, status, location, notable, warnings
)
VALUES
  (
    'DEM-001', 'Theseus Station', 'infrastructure', 'Beta', 'Installation',
    'Primary research and command hub of United Laboratories.',
    '["Spinal habitat ring","Quantum lab","Secure archives"]'::jsonb,
    '{"connected_to":["Theseus Prime"]}'::jsonb,
    'operational', 'Theseus Prime',
    '["Captain Rourke","Dr. Elara Voss"]'::jsonb,
    '[]'::jsonb
  ),
  (
    'DEM-002', 'Khepri Incident', 'event', 'Alpha', 'Historical',
    'Containment breach resulting in symbiote spread across three decks.',
    '["Origin unclear","Symbiotes show hive behavior"]'::jsonb,
    '{"referenced_by":["Dr. Elara Voss"]}'::jsonb,
    'classified', NULL,
    '[]'::jsonb,
    '["Do not unseal quarantine","Requires Omega override"]'::jsonb
  )
ON CONFLICT (entry_id) DO UPDATE
SET name = EXCLUDED.name,
    type = EXCLUDED.type,
    clearance_level = EXCLUDED.clearance_level,
    classification = EXCLUDED.classification,
    description = EXCLUDED.description,
    details = EXCLUDED.details,
    relations = EXCLUDED.relations,
    status = EXCLUDED.status,
    location = EXCLUDED.location,
    notable = EXCLUDED.notable,
    warnings = EXCLUDED.warnings;
