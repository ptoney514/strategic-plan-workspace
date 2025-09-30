-- Migration: Add header color field to strategic objectives
-- Description: Adds header_color field as an alternative to header images
-- Date: 2025-01-17

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

-- Set default colors for existing objectives without images (optional)
-- UPDATE public.spb_goals
-- SET header_color = '#3B82F6'
-- WHERE level = 0 AND image_url IS NULL AND header_color IS NULL;