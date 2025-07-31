/*
  # Create warps table for Taste Time-Warp app

  1. New Tables
    - `warps`
      - `id` (uuid, primary key)
      - `seeds` (text array for user input favorites)
      - `target_year` (integer for selected year)
      - `bundle` (jsonb for recommendation data)
      - `essay` (text for AI-generated cultural context)
      - `divergence` (integer for recommendation divergence score 0-100)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `warps` table
    - Add policy for public SELECT access (shareable links)
    - Add policy for authenticated INSERT operations
*/

CREATE TABLE IF NOT EXISTS warps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seeds text[] NOT NULL,
  target_year int NOT NULL CHECK (target_year >= 1900 AND target_year <= 2025),
  bundle jsonb NOT NULL,
  essay text NOT NULL,
  divergence int NOT NULL CHECK (divergence >= 0 AND divergence <= 100),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE warps ENABLE ROW LEVEL SECURITY;

-- Allow public read access for sharing functionality
CREATE POLICY "Allow public read access to warps"
  ON warps
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated users to create warps
CREATE POLICY "Allow authenticated users to create warps"
  ON warps
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_warps_created_at ON warps(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_warps_target_year ON warps(target_year);