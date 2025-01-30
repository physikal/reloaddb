/*
  # Add Shot Log Feature

  1. Changes
    - Add shots array to range_days table to store shot data
    - Add muzzle velocity tracking for shots
    - Add ammunition reference for each shot

  2. Data Structure
    The shots array will be stored in JSONB format with the following structure:
    {
      ammunition_id: uuid,
      muzzle_velocity: number,
      notes: string,
      timestamp: timestamptz
    }
*/

-- Add shots column to range_days table
ALTER TABLE range_days 
ADD COLUMN shots jsonb DEFAULT '[]'::jsonb;

-- Add function to calculate average muzzle velocity
CREATE OR REPLACE FUNCTION calculate_avg_muzzle_velocity(shots jsonb)
RETURNS numeric AS $$
DECLARE
  total numeric := 0;
  count numeric := 0;
BEGIN
  SELECT 
    SUM((shot->>'muzzle_velocity')::numeric),
    COUNT(*)
  INTO total, count
  FROM jsonb_array_elements(shots) AS shot
  WHERE (shot->>'muzzle_velocity') IS NOT NULL;

  IF count = 0 THEN
    RETURN NULL;
  END IF;

  RETURN ROUND((total / count)::numeric, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add view for range day statistics
CREATE VIEW range_day_stats AS
SELECT 
  id,
  user_id,
  title,
  date,
  calculate_avg_muzzle_velocity(shots) as avg_muzzle_velocity,
  jsonb_array_length(shots) as total_shots,
  created_at,
  updated_at
FROM range_days;

-- Grant access to the view
GRANT SELECT ON range_day_stats TO authenticated;