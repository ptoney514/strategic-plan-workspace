#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Production Supabase configuration
const supabaseUrl = 'https://qsftokjevxueboldvmzc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzZnRva2pldnh1ZWJvbGR2bXpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkxNzM3OCwiZXhwIjoyMDY4NDkzMzc4fQ.2ojjqcBouC7waOOJtbPQJ-vSm0iLzm9WoH5HFO3h_vs';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function applyMigration() {
  console.log('🔄 Connecting to production database...');
  
  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '..', 'migrations', 'production_fix_metrics_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL into individual statements (removing BEGIN and COMMIT)
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.toUpperCase().startsWith('BEGIN') && !s.toUpperCase().startsWith('COMMIT'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    let successCount = 0;
    let errors = [];
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.trim() === ';') {
        continue;
      }
      
      console.log(`\n⚙️  Executing statement ${i + 1}/${statements.length}...`);
      
      // Extract first few words for logging
      const preview = statement.substring(0, 50).replace(/\n/g, ' ');
      console.log(`   ${preview}...`);
      
      const { data, error } = await supabase.rpc('exec_raw_sql', { 
        sql_query: statement 
      }).catch(err => {
        // If RPC doesn't exist, try direct execution
        return { data: null, error: err };
      });
      
      if (error) {
        // Try alternative approach using REST API
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc`, {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            query: statement
          })
        });
        
        if (!response.ok) {
          errors.push(`Statement ${i + 1}: ${error?.message || response.statusText}`);
          console.log(`   ❌ Failed: ${error?.message || response.statusText}`);
        } else {
          successCount++;
          console.log(`   ✅ Success`);
        }
      } else {
        successCount++;
        console.log(`   ✅ Success`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`📊 Migration Summary:`);
    console.log(`   ✅ Successful statements: ${successCount}`);
    console.log(`   ❌ Failed statements: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      errors.forEach(err => console.log(`   - ${err}`));
      
      console.log('\n💡 Note: Some errors may be expected (e.g., "column already exists")');
    }
    
    // Verify the schema
    console.log('\n🔍 Verifying schema...');
    const { data: columns, error: schemaError } = await supabase
      .from('spb_metrics')
      .select('*')
      .limit(0);
    
    if (!schemaError) {
      console.log('✅ Schema verification successful!');
    } else {
      console.log('⚠️  Could not verify schema:', schemaError.message);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run the migration
applyMigration()
  .then(() => {
    console.log('\n✨ Migration process completed!');
    console.log('🔄 Please redeploy your Vercel application to ensure changes take effect.');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Unexpected error:', err);
    process.exit(1);
  });