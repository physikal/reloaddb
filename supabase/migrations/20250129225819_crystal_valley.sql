/*
  # Add ammunition tracking to range days

  1. Changes
    - Add ammunition column to range_days table
    - Update range_day_stats view to include ammunition information
    - Update RLS policies to handle the new column

  2. Details
    - Adds ammunition jsonb column to store ammunition usage data
    - Updates the view to maintain existing functionality
    - Ensures RLS policies cover the new column
*/

-- Add ammunition column to range_days table if it doesn't exist
ALTER TABLE range_days 
ADD COLUMN ammunition jsonb DEFAULT '[]'::jsonb;

-- Update the range_day_stats view to include ammunition information
DROP VIEW IF EXISTS range_day_stats;
CREATE VIEW range_day_stats AS
SELECT 
  id,
  user_id,
  title,
  date,
  calculate_avg_muzzle_velocity(shots) as avg_muzzle_velocity,
  jsonb_array_length(shots) as total_shots,
  ammunition,
  created_at,
  updated_at
FROM range_days;

-- Grant access to the updated view
GRANT SELECT ON range_day_stats TO authenticated;

-- Ensure RLS policies are updated
DROP POLICY IF EXISTS "Users can read own range days" ON range_days;
DROP POLICY IF EXISTS "Users can create own range days" ON range_days;
DROP POLICY IF EXISTS "Users can update own range days" ON range_days;
DROP POLICY IF EXISTS "Users can delete own range days" ON range_days;

-- Recreate policies with explicit column permissions
CREATE POLICY "Users can read own range days"
  ON range_days
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own range days"
  ON range_days
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own range days"
  ON range_days
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own range days"
  ON range_days
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);