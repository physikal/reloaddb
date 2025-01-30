/*
  # Add raw string columns for preserving numeric precision
  
  1. New Columns
    - Add raw string columns to loads table to store exact numeric input
    - bullet_weight_raw (text)
    - powder_weight_raw (text)
    - brass_length_raw (text)
    - cartridge_overall_length_raw (text)
    - cartridge_base_to_ogive_raw (text)

  2. Changes
    - Add new columns with text type
    - Make them nullable since existing data won't have these values
*/

-- Add raw string columns to preserve exact numeric input
ALTER TABLE loads
ADD COLUMN bullet_weight_raw text,
ADD COLUMN powder_weight_raw text,
ADD COLUMN brass_length_raw text,
ADD COLUMN cartridge_overall_length_raw text,
ADD COLUMN cartridge_base_to_ogive_raw text;

-- Update existing rows to populate raw columns with string versions of numeric values
UPDATE loads
SET
  bullet_weight_raw = bullet_weight::text,
  powder_weight_raw = powder_weight::text,
  brass_length_raw = brass_length::text,
  cartridge_overall_length_raw = cartridge_overall_length::text,
  cartridge_base_to_ogive_raw = CASE 
    WHEN cartridge_base_to_ogive IS NOT NULL 
    THEN cartridge_base_to_ogive::text 
    ELSE NULL 
  END;