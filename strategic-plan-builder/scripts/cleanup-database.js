#!/usr/bin/env node

/**
 * Database cleanup script to remove all existing goals and metrics
 * 
 * This script clears out test data while keeping districts intact.
 * Use this to start fresh when test data is causing issues.
 * 
 * Usage: node scripts/cleanup-database.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.error('Make sure you have set:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'strategic_plan_builder'
  }
});

async function cleanupDatabase() {
  console.log('🧹 Starting database cleanup...\n');

  try {
    // Step 1: Get counts before cleanup
    console.log('📊 Getting current data counts...');
    
    const [goalsCount, metricsCount, districtsCount] = await Promise.all([
      supabase.from('goals').select('*', { count: 'exact', head: true }),
      supabase.from('metrics').select('*', { count: 'exact', head: true }),
      supabase.from('districts').select('*', { count: 'exact', head: true })
    ]);

    console.log(`📈 Current data:`);
    console.log(`   • Goals: ${goalsCount.count || 0}`);
    console.log(`   • Metrics: ${metricsCount.count || 0}`);
    console.log(`   • Districts: ${districtsCount.count || 0} (will be preserved)`);
    console.log('');

    // Step 2: Delete all metrics first (due to foreign key constraints)
    console.log('🗑️  Deleting all metrics...');
    const { error: metricsError } = await supabase
      .from('metrics')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (metricsError) {
      console.error('❌ Error deleting metrics:', metricsError);
    } else {
      console.log('✅ All metrics deleted successfully');
    }

    // Step 3: Delete all goals
    console.log('🗑️  Deleting all goals...');
    const { error: goalsError } = await supabase
      .from('goals')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (goalsError) {
      console.error('❌ Error deleting goals:', goalsError);
    } else {
      console.log('✅ All goals deleted successfully');
    }

    // Step 4: Verify cleanup
    console.log('\n🔍 Verifying cleanup...');
    
    const [finalGoalsCount, finalMetricsCount] = await Promise.all([
      supabase.from('goals').select('*', { count: 'exact', head: true }),
      supabase.from('metrics').select('*', { count: 'exact', head: true })
    ]);

    console.log(`📊 Final counts:`);
    console.log(`   • Goals: ${finalGoalsCount.count || 0}`);
    console.log(`   • Metrics: ${finalMetricsCount.count || 0}`);

    // Step 5: Test that we can still access districts
    console.log('\n🧪 Testing district access...');
    const { data: districts, error: districtsError } = await supabase
      .from('districts')
      .select('id, name, slug')
      .limit(5);

    if (districtsError) {
      console.error('❌ Error accessing districts:', districtsError);
    } else {
      console.log(`✅ Districts still accessible (${districts?.length || 0} found)`);
      if (districts && districts.length > 0) {
        districts.forEach(d => {
          console.log(`   • ${d.name} (${d.slug})`);
        });
      }
    }

    console.log('\n🎉 Database cleanup completed successfully!');
    console.log('\n📝 What happened:');
    console.log('   ✅ All goals were deleted');
    console.log('   ✅ All metrics were deleted');  
    console.log('   ✅ Districts were preserved');
    console.log('   ✅ You can now create fresh strategic objectives');

  } catch (error) {
    console.error('❌ Unexpected error during cleanup:', error);
    process.exit(1);
  }
}

// Confirmation prompt
function askForConfirmation() {
  return new Promise((resolve) => {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('⚠️  WARNING: This will delete ALL goals and metrics from the database!');
    console.log('Districts will be preserved, but all strategic objectives will be removed.');
    console.log('');
    
    readline.question('Are you sure you want to proceed? (yes/no): ', (answer) => {
      readline.close();
      resolve(answer.toLowerCase().trim() === 'yes');
    });
  });
}

// Run the cleanup with confirmation
async function main() {
  const confirmed = await askForConfirmation();
  
  if (!confirmed) {
    console.log('❌ Cleanup cancelled by user');
    process.exit(0);
  }

  await cleanupDatabase();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { cleanupDatabase };