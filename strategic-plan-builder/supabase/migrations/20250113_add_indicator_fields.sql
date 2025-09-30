-- Migration: Add custom indicator fields to strategic objectives
-- Description: Adds indicator_text and indicator_color fields for custom status indicators
-- Date: 2025-01-13

-- Add indicator fields to spb_goals table
ALTER TABLE public.spb_goals
ADD COLUMN IF NOT EXISTS indicator_text VARCHAR(100),
ADD COLUMN IF NOT EXISTS indicator_color VARCHAR(7);

-- Add check constraint for hex color format
ALTER TABLE public.spb_goals
ADD CONSTRAINT check_indicator_color_hex 
CHECK (indicator_color IS NULL OR indicator_color ~ '^#[0-9A-Fa-f]{6}$');

-- Add comment for documentation
COMMENT ON COLUMN public.spb_goals.indicator_text IS 'Custom status indicator text (e.g., "On Target", "At Risk")';
COMMENT ON COLUMN public.spb_goals.indicator_color IS 'Hex color value for the indicator (e.g., "#10B981")';