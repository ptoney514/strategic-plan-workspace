#!/bin/bash

# Production Supabase configuration
SUPABASE_URL="https://qsftokjevxueboldvmzc.supabase.co"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzZnRva2pldnh1ZWJvbGR2bXpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkxNzM3OCwiZXhwIjoyMDY4NDkzMzc4fQ.2ojjqcBouC7waOOJtbPQJ-vSm0iLzm9WoH5HFO3h_vs"

echo "Testing connection to production Supabase..."

# Test if we can query the metrics table structure
curl -s -X GET \
  "${SUPABASE_URL}/rest/v1/spb_metrics?limit=0" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Prefer: count=exact" | jq '.'

echo ""
echo "Checking current columns in spb_metrics table..."

# Get table schema info
curl -s -X GET \
  "${SUPABASE_URL}/rest/v1/" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" | grep -o '"spb_metrics"' | head -1

echo ""
echo "To apply the migration, please:"
echo "1. Go to: https://supabase.com/dashboard/project/qsftokjevxueboldvmzc/sql/new"
echo "2. Copy the contents of: migrations/production_fix_metrics_schema.sql"
echo "3. Paste and run in the SQL Editor"
echo ""
echo "The migration script will:"
echo "- Add missing columns (display_width, description, etc.)"
echo "- Fix constraint issues"
echo "- Ensure metrics work properly"