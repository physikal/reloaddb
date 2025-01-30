/*
  # Fix range_day_stats view security

  1. Changes
    - Drop and recreate range_day_stats view with security barrier
    - Use subquery to enforce row-level security
    - Ensure proper access control through view definition

  2. Security
    - View enforces security through WHERE clause
    - Uses SECURITY BARRIER to prevent information leakage
*/

-- Drop the existing view
DROP VIEW IF EXISTS range_day_stats;

-- Recreate the view with security barrier and RLS enforcement
CREATE VIEW range_day_stats 
WITH (security_barrier = true)
AS
SELECT 
  rd.id,
  rd.user_id,
  rd.title,
  rd.date,
  calculate_avg_muzzle_velocity(rd.shots) as avg_muzzle_velocity,
  jsonb_array_length(rd.shots) as total_shots,
  rd.ammunition,
  rd.created_at,
  rd.updated_at
FROM range_days rd
WHERE rd.user_id = auth.uid();

-- Grant access to the view
GRANT SELECT ON range_day_stats TO authenticated;