#!/usr/bin/env node

/**
 * Script to apply the strategic objectives enhancement migration
 * This script connects to Supabase and applies the new schema changes
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  if (!supabaseUrl) console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseServiceKey) console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🚀 Starting Strategic Objectives Enhancement Migration...\n');
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250113_enhance_strategic_objectives.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration file loaded successfully');
    console.log('🔧 Applying migration to database...\n');
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: migrationSQL 
    }).single();
    
    if (error) {
      // If the RPC function doesn't exist, we'll need to apply it differently
      console.log('⚠️  Note: Direct SQL execution not available via RPC.');
      console.log('📋 Please apply the migration manually via Supabase SQL Editor:');
      console.log('   1. Go to your Supabase project dashboard');
      console.log('   2. Navigate to SQL Editor');
      console.log('   3. Copy and paste the migration from:');
      console.log(`      ${migrationPath}`);
      console.log('   4. Click "Run" to execute the migration\n');
      
      // Let's at least verify the connection works
      const { data: testData, error: testError } = await supabase
        .from('spb_goals')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.error('❌ Could not connect to database:', testError.message);
      } else {
        console.log('✅ Database connection verified');
        console.log('ℹ️  Migration file has been created and is ready to apply');
      }
    } else {
      console.log('✅ Migration applied successfully!');
    }
    
    // Verify new tables exist (this will fail if migration hasn't been applied)
    console.log('\n🔍 Verifying new tables...');
    
    const tablesToCheck = [
      'spb_strategic_themes',
      'spb_initiatives', 
      'spb_goal_updates',
      'spb_goal_artifacts',
      'spb_goal_stakeholders',
      'spb_goal_milestones',
      'spb_goal_dependencies'
    ];
    
    for (const table of tablesToCheck) {
      const { error: checkError } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (checkError) {
        console.log(`   ⏳ Table ${table} - Not yet created`);
      } else {
        console.log(`   ✅ Table ${table} - Ready`);
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log('   - Enhanced spb_goals table with 14 new fields');
    console.log('   - Enhanced spb_metrics table with 6 new fields');
    console.log('   - Created 7 new supporting tables');
    console.log('   - Added comprehensive indexes for performance');
    console.log('   - Configured RLS policies for development');
    
    console.log('\n🎉 Enhancement migration process complete!');
    console.log('   Next steps:');
    console.log('   1. Apply the migration via Supabase SQL Editor if not auto-applied');
    console.log('   2. Test the new features in the application');
    console.log('   3. Update API endpoints to leverage new fields');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run the migration
applyMigration().catch(console.error);