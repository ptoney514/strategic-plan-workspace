# Strategic Objective Indicator Feature Setup

## Overview
This feature adds custom status indicators to top-level strategic objectives (level-0 goals), allowing users to set their own status text and color.

## Setup Instructions

### 1. Apply Database Migration
The migration adds two new fields to the `spb_goals` table:
- `indicator_text` - Custom status text (e.g., "On Target", "At Risk") 
- `indicator_color` - Hex color value (e.g., "#10B981")

To apply the migration:

1. Open Supabase Studio: http://127.0.0.1:54323
2. Navigate to the SQL Editor
3. Run the migration script located at: `/supabase/migrations/20250113_add_indicator_fields.sql`

Or copy and paste this SQL:

```sql
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
```

### 2. Verify the Feature

1. Navigate to the admin page: http://localhost:3000/districts/[slug]/admin
2. Click on any top-level strategic objective (level-0 goal)
3. Click the "Edit Objective" button that appears in the header
4. You should see the new tabbed interface with:
   - **Basic Info Tab**: Title, Description, and Custom Indicator fields
   - **Metrics Tab**: Placeholder for future development
   - **Planning Tab**: Placeholder for future development  
   - **Resources Tab**: Placeholder for future development

### 3. Test the Indicator Feature

In the Basic Info tab:
1. Edit the Title and Description fields
2. Enter custom indicator text (e.g., "On Target", "Making Progress")
3. Select a color from the predefined palette:
   - Green (#10B981) - On Track
   - Light Green (#84CC16) - Progressing
   - Yellow (#EAB308) - Caution
   - Orange (#F97316) - Needs Attention
   - Red (#EF4444) - At Risk
   - Blue (#3B82F6) - Information
   - Purple (#8B5CF6) - Strategic
   - Gray (#6B7280) - Not Started
4. Preview the indicator badge at the bottom
5. Click "Save Changes" to persist

## Features

### Custom Indicator
- **Text Field**: Allows any custom status text
- **Color Picker**: 8 predefined colors with semantic meanings
- **Live Preview**: Shows how the indicator will appear
- **Automatic Display**: Custom indicators override default status calculations

### Tabbed Interface
- **Basic Info**: Core fields for editing (currently active)
- **Other Tabs**: Placeholders for future features

### Smart Behavior
- Only shows for level-0 strategic objectives
- Preserves existing functionality for sub-goals (level-1 and level-2)
- Unsaved changes warning when navigating away
- Auto-save functionality on field changes

## Technical Details

### Components
- `components/StrategicObjectiveEdit.tsx` - New tabbed edit interface
- `app/districts/[slug]/admin/components/ExpandedObjectiveView.tsx` - Modified to use new component for level-0 goals

### Database Schema
- Table: `spb_goals`
- New columns: `indicator_text` (VARCHAR 100), `indicator_color` (VARCHAR 7)
- Constraint: Hex color format validation

### API
- Existing PUT endpoint at `/api/districts/[slug]/goals` handles the new fields automatically

## Color Palette Reference

| Color | Hex | Suggested Use |
|-------|-----|---------------|
| Green | #10B981 | On Track, Goal is progressing well |
| Light Green | #84CC16 | Progressing, Making steady progress |
| Yellow | #EAB308 | Caution, Needs monitoring |
| Orange | #F97316 | Needs Attention, Requires immediate focus |
| Red | #EF4444 | At Risk, Critical issues |
| Blue | #3B82F6 | Information, Informational status |
| Purple | #8B5CF6 | Strategic, Strategic priority |
| Gray | #6B7280 | Not Started, Not yet begun |

## Future Enhancements

The tabbed interface is designed to be extensible. Future tabs could include:
- **Metrics**: Manage KPIs and performance metrics
- **Planning**: Set timelines, milestones, and dependencies
- **Resources**: Allocate budget, personnel, and other resources