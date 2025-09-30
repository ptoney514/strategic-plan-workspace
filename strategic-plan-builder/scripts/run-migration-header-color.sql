-- Script to run the header color migration
-- Run this in your Supabase SQL editor or via psql

-- First, let's check if the column already exists
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'spb_goals'
AND column_name = 'header_color';

-- If it doesn't exist, run the migration:
-- Add header_color field to spb_goals table
ALTER TABLE public.spb_goals
ADD COLUMN IF NOT EXISTS header_color VARCHAR(7);

-- Add check constraint for hex color format
ALTER TABLE public.spb_goals
DROP CONSTRAINT IF EXISTS check_header_color_hex;

ALTER TABLE public.spb_goals
ADD CONSTRAINT check_header_color_hex
CHECK (header_color IS NULL OR header_color ~ '^#[0-9A-Fa-f]{6}$');

-- Add comment for documentation
COMMENT ON COLUMN public.spb_goals.header_color IS 'Solid color background for the strategic objective card header (hex format, e.g., "#3B82F6"). Used as an alternative to image_url.';

-- Verify the column was added
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'spb_goals'
AND column_name IN ('header_color', 'image_url', 'indicator_color');

-- Optional: Set some default colors for testing
-- UPDATE public.spb_goals
-- SET header_color = '#3B82F6'
-- WHERE level = 0
-- AND id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
--
-- UPDATE public.spb_goals
-- SET header_color = '#10B981'
-- WHERE level = 0
-- AND id = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';