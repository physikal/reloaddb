/*
  # Add Changelog Table

  1. New Tables
    - `changelog`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `version` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `changelog` table
    - Add policies for read access by all authenticated users
    - Add policies for write access only by admin user (boody@physikal.com)
*/

-- Create changelog table
CREATE TABLE changelog (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  content text NOT NULL,
  version text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE changelog ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Anyone can read changelog entries
CREATE POLICY "Anyone can read changelog entries"
  ON changelog
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admin can create changelog entries
CREATE POLICY "Only admin can create changelog entries"
  ON changelog
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.email() = 'boody@physikal.com');

-- Only admin can update changelog entries
CREATE POLICY "Only admin can update changelog entries"
  ON changelog
  FOR UPDATE
  TO authenticated
  USING (auth.email() = 'boody@physikal.com');

-- Only admin can delete changelog entries
CREATE POLICY "Only admin can delete changelog entries"
  ON changelog
  FOR DELETE
  TO authenticated
  USING (auth.email() = 'boody@physikal.com');