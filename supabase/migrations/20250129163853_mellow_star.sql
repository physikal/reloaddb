/*
  # Initial Schema Setup

  1. New Tables
    - users
      - id (uuid, primary key)
      - email (text, unique)
      - role (text)
      - two_factor_enabled (boolean)
      - two_factor_secret (text)
      - created_at (timestamptz)
      - last_login (timestamptz)
      - load_form_config (jsonb)
      - load_card_config (jsonb)
    
    - loads
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - cartridge (text)
      - bullet_brand (text)
      - bullet_weight (numeric)
      - powder_brand (text)
      - powder_weight (numeric)
      - primer (text)
      - brass_brand (text)
      - brass_length (numeric)
      - cartridge_overall_length (numeric)
      - cartridge_base_to_ogive (numeric)
      - notes (text)
      - favorite (boolean)
      - display_config (jsonb)
      - cost_per_round (numeric)
      - cost_breakdown (jsonb)
      - created_at (timestamptz)
      - updated_at (timestamptz)

    - cartridges
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - name (text)
      - created_at (timestamptz)

    - inventory tables (firearms, ammunition, bullets, powder, primers, brass)
      Each with appropriate columns and RLS policies

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'user',
  two_factor_enabled boolean DEFAULT false,
  two_factor_secret text,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz,
  load_form_config jsonb,
  load_card_config jsonb
);

-- Loads table
CREATE TABLE loads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  cartridge text NOT NULL,
  bullet_brand text NOT NULL,
  bullet_weight numeric NOT NULL,
  powder_brand text NOT NULL,
  powder_weight numeric NOT NULL,
  primer text NOT NULL,
  brass_brand text NOT NULL,
  brass_length numeric NOT NULL,
  cartridge_overall_length numeric NOT NULL,
  cartridge_base_to_ogive numeric,
  notes text,
  favorite boolean DEFAULT false,
  display_config jsonb,
  cost_per_round numeric,
  cost_breakdown jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cartridges table
CREATE TABLE cartridges (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Firearms table
CREATE TABLE firearms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  manufacturer text,
  model text,
  serial_number text,
  type text,
  caliber text,
  barrel_length numeric,
  purchase_date timestamptz,
  purchase_price numeric,
  condition text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ammunition table
CREATE TABLE ammunition (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  cartridge text NOT NULL,
  sku text NOT NULL,
  quantity integer NOT NULL,
  lot_number text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Bullets table
CREATE TABLE bullets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  manufacturer text NOT NULL,
  sku text NOT NULL,
  weight numeric NOT NULL,
  type text NOT NULL,
  quantity integer NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Powder table
CREATE TABLE powder (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  manufacturer text NOT NULL,
  sku text NOT NULL,
  weight numeric NOT NULL,
  lot_number text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Primers table
CREATE TABLE primers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  manufacturer text NOT NULL,
  sku text NOT NULL,
  type text NOT NULL,
  quantity integer NOT NULL,
  lot_number text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Brass table
CREATE TABLE brass (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  cartridge text NOT NULL,
  manufacturer text NOT NULL,
  quantity integer NOT NULL,
  condition text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Range days table
CREATE TABLE range_days (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  date timestamptz NOT NULL,
  firearms jsonb NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE cartridges ENABLE ROW LEVEL SECURITY;
ALTER TABLE firearms ENABLE ROW LEVEL SECURITY;
ALTER TABLE ammunition ENABLE ROW LEVEL SECURITY;
ALTER TABLE bullets ENABLE ROW LEVEL SECURITY;
ALTER TABLE powder ENABLE ROW LEVEL SECURITY;
ALTER TABLE primers ENABLE ROW LEVEL SECURITY;
ALTER TABLE brass ENABLE ROW LEVEL SECURITY;
ALTER TABLE range_days ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Loads policies
CREATE POLICY "Users can read own loads"
  ON loads
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own loads"
  ON loads
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own loads"
  ON loads
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own loads"
  ON loads
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Cartridges policies
CREATE POLICY "Users can read own cartridges"
  ON cartridges
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own cartridges"
  ON cartridges
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cartridges"
  ON cartridges
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cartridges"
  ON cartridges
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Firearms policies
CREATE POLICY "Users can read own firearms"
  ON firearms
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own firearms"
  ON firearms
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own firearms"
  ON firearms
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own firearms"
  ON firearms
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Ammunition policies
CREATE POLICY "Users can read own ammunition"
  ON ammunition
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own ammunition"
  ON ammunition
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ammunition"
  ON ammunition
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ammunition"
  ON ammunition
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Bullets policies
CREATE POLICY "Users can read own bullets"
  ON bullets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bullets"
  ON bullets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bullets"
  ON bullets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bullets"
  ON bullets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Powder policies
CREATE POLICY "Users can read own powder"
  ON powder
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own powder"
  ON powder
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own powder"
  ON powder
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own powder"
  ON powder
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Primers policies
CREATE POLICY "Users can read own primers"
  ON primers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own primers"
  ON primers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own primers"
  ON primers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own primers"
  ON primers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Brass policies
CREATE POLICY "Users can read own brass"
  ON brass
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own brass"
  ON brass
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brass"
  ON brass
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own brass"
  ON brass
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Range days policies
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