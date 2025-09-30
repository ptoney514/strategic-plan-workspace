-- Migration: Add image field to strategic objectives
-- Description: Adds image_url field for custom objective card images
-- Date: 2025-01-14

-- Add image_url field to spb_goals table
ALTER TABLE public.spb_goals
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.spb_goals.image_url IS 'URL for the strategic objective card image (recommended: 800x400px, max 2MB)';