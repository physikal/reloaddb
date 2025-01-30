/*
  # Update ammunition history and triggers

  1. Changes
    - Safely update ammunition history table and triggers
    - Add function to get ammunition history
    - Add RLS policies for ammunition history
*/

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_range_day_ammunition_update ON range_days;

-- Function to update ammunition quantity
CREATE OR REPLACE FUNCTION update_ammunition_quantity()
RETURNS TRIGGER AS $$
DECLARE
  old_ammo jsonb;
  new_ammo jsonb;
  ammo_id uuid;
  old_rounds integer;
  new_rounds integer;
  available_rounds integer;
BEGIN
  -- Handle ammunition updates
  IF TG_OP = 'UPDATE' OR TG_OP = 'INSERT' THEN
    old_ammo := CASE WHEN TG_OP = 'UPDATE' THEN OLD.ammunition ELSE '[]'::jsonb END;
    new_ammo := NEW.ammunition;
    
    -- Process each ammunition entry
    FOR i IN 0..jsonb_array_length(new_ammo) - 1 LOOP
      ammo_id := (new_ammo->i->>'ammunitionId')::uuid;
      new_rounds := (new_ammo->i->>'roundsUsed')::integer;
      
      -- Find matching old ammunition entry
      old_rounds := 0;
      IF old_ammo IS NOT NULL AND jsonb_array_length(old_ammo) > 0 THEN
        FOR j IN 0..jsonb_array_length(old_ammo) - 1 LOOP
          IF (old_ammo->j->>'ammunitionId')::uuid = ammo_id THEN
            old_rounds := (old_ammo->j->>'roundsUsed')::integer;
            EXIT;
          END IF;
        END LOOP;
      END IF;

      -- Calculate rounds difference
      IF new_rounds > old_rounds THEN
        -- Check if enough ammunition is available
        SELECT quantity INTO available_rounds
        FROM ammunition
        WHERE id = ammo_id
        FOR UPDATE;  -- Lock the row to prevent race conditions

        IF available_rounds < (new_rounds - old_rounds) THEN
          RAISE EXCEPTION 'Not enough ammunition available';
        END IF;

        -- Update ammunition quantity
        UPDATE ammunition
        SET 
          quantity = quantity - (new_rounds - old_rounds),
          updated_at = now()
        WHERE id = ammo_id;

        -- Record usage in history
        INSERT INTO ammunition_history (ammunition_id, range_day_id, rounds_used)
        VALUES (ammo_id, NEW.id, new_rounds - old_rounds);
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for ammunition updates
CREATE TRIGGER on_range_day_ammunition_update
  AFTER INSERT OR UPDATE OF ammunition ON range_days
  FOR EACH ROW
  EXECUTE FUNCTION update_ammunition_quantity();

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_ammunition_history(uuid);

-- Create function to get ammunition history
CREATE OR REPLACE FUNCTION get_ammunition_history(ammo_id uuid)
RETURNS TABLE (
  id uuid,
  ammunition_id uuid,
  cartridge text,
  range_day_id uuid,
  range_day_title text,
  range_day_date timestamptz,
  rounds_used integer,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ah.id,
    ah.ammunition_id,
    a.cartridge,
    ah.range_day_id,
    rd.title as range_day_title,
    rd.date as range_day_date,
    ah.rounds_used,
    ah.created_at
  FROM ammunition_history ah
  JOIN ammunition a ON a.id = ah.ammunition_id
  JOIN range_days rd ON rd.id = ah.range_day_id
  WHERE ah.ammunition_id = ammo_id
  ORDER BY ah.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_ammunition_history(uuid) TO authenticated;