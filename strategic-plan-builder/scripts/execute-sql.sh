#!/bin/bash

# Production Supabase credentials
SUPABASE_URL="https://qsftokjevxueboldvmzc.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzZnRva2pldnh1ZWJvbGR2bXpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkxNzM3OCwiZXhwIjoyMDY4NDkzMzc4fQ.2ojjqcBouC7waOOJtbPQJ-vSm0iLzm9WoH5HFO3h_vs"

# SQL to execute - add display_width first
SQL1="ALTER TABLE public.spb_metrics ADD COLUMN IF NOT EXISTS display_width text DEFAULT 'full';"

# Execute SQL using Supabase REST API
echo "Adding display_width column..."
curl -X POST \
  "${SUPABASE_URL}/rest/v1/rpc" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"${SQL1}\"}"

# Add description column
SQL2="ALTER TABLE public.spb_metrics ADD COLUMN IF NOT EXISTS description text;"
echo -e "\nAdding description column..."
curl -X POST \
  "${SUPABASE_URL}/rest/v1/rpc" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"${SQL2}\"}"

# Add visualization_type column  
SQL3="ALTER TABLE public.spb_metrics ADD COLUMN IF NOT EXISTS visualization_type text DEFAULT 'progress';"
echo -e "\nAdding visualization_type column..."
curl -X POST \
  "${SUPABASE_URL}/rest/v1/rpc" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"${SQL3}\"}"

# Add visualization_config column
SQL4="ALTER TABLE public.spb_metrics ADD COLUMN IF NOT EXISTS visualization_config jsonb;"
echo -e "\nAdding visualization_config column..."
curl -X POST \
  "${SUPABASE_URL}/rest/v1/rpc" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"${SQL4}\"}"

echo -e "\nMigration complete!"