/*
  # Ammunition Usage Tracking

  1. New Tables
    - ammunition_history
      - id (uuid, primary key)
      - ammunition_id (uuid, references ammunition)
      - range_day_id (uuid, references range_days)
      - rounds_used (integer)
      - created_at (timestamptz)

  2. Functions
    - update_ammunition_quantity: Updates ammunition quantity when used in range days
    - record_ammunition_usage: Records ammunition usage history

  3. Triggers
    - on_range_day_ammunition_update: Handles ammunition quantity updates
*/

-- Create ammunition history table
CREATE TABLE ammunition_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  ammunition_id uuid REFERENCES ammunition(id) ON DELETE CASCADE,
  range_day_id uuid REFERENCES range_days(id) ON DELETE CASCADE,
  rounds_used integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on ammunition history
ALTER TABLE ammunition_history ENABLE ROW LEVEL SECURITY;

-- Create policies for ammunition history
CREATE POLICY "Users can read own ammunition history"
  ON ammunition_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ammunition a
      WHERE a.id = ammunition_id
      AND a.user_id = auth.uid()
    )
  );

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
  IF TG_OP = 'UPDATE' THEN
    old_ammo := OLD.ammunition;
    new_ammo := NEW.ammunition;
    
    -- Process each ammunition entry
    FOR i IN 0..jsonb_array_length(new_ammo) - 1 LOOP
      ammo_id := (new_ammo->i->>'ammunitionId')::uuid;
      new_rounds := (new_ammo->i->>'roundsUsed')::integer;
      
      -- Find matching old ammunition entry
      old_rounds := 0;
      IF old_ammo IS NOT NULL THEN
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
        WHERE id = ammo_id;

        IF available_rounds < (new_rounds - old_rounds) THEN
          RAISE EXCEPTION 'Not enough ammunition available';
        END IF;

        -- Update ammunition quantity
        UPDATE ammunition
        SET quantity = quantity - (new_rounds - old_rounds)
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
  AFTER UPDATE OF ammunition ON range_days
  FOR EACH ROW
  EXECUTE FUNCTION update_ammunition_quantity();

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