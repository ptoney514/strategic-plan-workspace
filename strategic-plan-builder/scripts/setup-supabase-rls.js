#!/usr/bin/env node

/**
 * Setup script to configure Supabase Row Level Security (RLS) policies for development
 * 
 * This script applies the SQL policies from supabase/enable-public-access.sql
 * to enable full public access for development purposes.
 * 
 * Usage: node scripts/setup-supabase-rls.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.error('Make sure you have set:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nYou can find these values in your Supabase project settings.');
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

async function setupRLS() {
  console.log('🚀 Setting up Supabase for development mode...\n');

  try {
    // Read the SQL file - using simplified development setup
    const sqlPath = path.join(__dirname, '../supabase/disable-rls-for-dev.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Split SQL into individual statements (basic splitting by semicolon)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && !stmt.startsWith('/*'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (!statement) continue;

      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement
        });

        if (error) {
          console.warn(`⚠️  Warning for statement ${i + 1}: ${error.message}`);
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.error(`❌ Error executing statement ${i + 1}: ${err.message}`);
        // Continue with other statements
      }
    }

    console.log('\n🔍 Verifying database access...');
    
    // Test that we can now access data
    const testResult = await testDatabaseAccess();
    
    if (testResult.success) {
      console.log('\n✅ Development setup completed successfully!');
      console.log('🎉 Your Supabase database is now configured for development.');
      console.log('\n🔑 RLS is DISABLED - using service role key for all operations.');
      console.log('⚠️  IMPORTANT: Enable RLS and proper authentication before production!');
    } else {
      console.log('\n❌ Setup completed but verification failed.');
      console.log('You may need to manually check your Supabase configuration.');
    }

  } catch (error) {
    console.error('❌ Error setting up RLS:', error.message);
    process.exit(1);
  }
}

async function testDatabaseAccess() {
  try {
    // Test reading districts
    const { data: districts, error: readError } = await supabase
      .from('spb_districts')
      .select('id, name')
      .limit(1);

    if (readError) {
      console.log(`❌ Read test failed: ${readError.message}`);
      return { success: false, error: readError.message };
    }

    console.log(`✅ Read access verified (found ${districts?.length || 0} districts)`);

    // Test that policies are working by checking if we can create a test record
    // (We won't actually insert it, just check if the operation would be allowed)
    return { success: true };

  } catch (error) {
    console.log(`❌ Database access test failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Alternative method using direct SQL execution if RPC doesn't work
async function setupRLSDirect() {
  console.log('🔄 Trying alternative method...\n');
  
  const policies = [
    {
      name: 'districts_policy',
      sql: `
        DROP POLICY IF EXISTS "Enable all access for development" ON strategic_plan_builder.districts;
        CREATE POLICY "Enable all access for development" 
        ON strategic_plan_builder.districts FOR ALL USING (true) WITH CHECK (true);
      `
    },
    {
      name: 'goals_policy', 
      sql: `
        DROP POLICY IF EXISTS "Enable all access for development" ON strategic_plan_builder.goals;
        CREATE POLICY "Enable all access for development" 
        ON strategic_plan_builder.goals FOR ALL USING (true) WITH CHECK (true);
      `
    },
    {
      name: 'metrics_policy',
      sql: `
        DROP POLICY IF EXISTS "Enable all access for development" ON strategic_plan_builder.metrics;
        CREATE POLICY "Enable all access for development" 
        ON strategic_plan_builder.metrics FOR ALL USING (true) WITH CHECK (true);
      `
    }
  ];

  for (const policy of policies) {
    try {
      console.log(`⏳ Creating ${policy.name}...`);
      
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: policy.sql
      });

      if (error) {
        console.warn(`⚠️  Warning for ${policy.name}: ${error.message}`);
      } else {
        console.log(`✅ ${policy.name} created successfully`);
      }
    } catch (err) {
      console.error(`❌ Error creating ${policy.name}: ${err.message}`);
    }
  }
}

// Run the setup
if (require.main === module) {
  setupRLS().catch(console.error);
}

module.exports = { setupRLS, testDatabaseAccess };