/*
  # Fix infinite recursion in users table RLS policies

  1. Problem
    - Current policies create infinite recursion by querying users table within users table policies
    - This prevents any user queries from working

  2. Solution
    - Drop existing recursive policies
    - Create simple, non-recursive policies
    - Use auth.uid() directly without subqueries to users table

  3. New Policies
    - Users can read their own profile (auth.uid() = id)
    - Service role can manage all users
    - Simple insert policy for new user creation
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;

-- Create simple, non-recursive policies
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow user creation during signup"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Service role can bypass RLS for admin operations
-- This allows the application to manage users programmatically