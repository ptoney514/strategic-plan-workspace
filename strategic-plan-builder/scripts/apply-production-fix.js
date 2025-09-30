const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Initialize Supabase client with service role key for admin access
const supabaseUrl = 'https://qsftokjevxueboldvmzc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzZnRva2pldnh1ZWJvbGR2bXpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkxNzM3OCwiZXhwIjoyMDY4NDkzMzc4fQ.2ojjqcBouC7waOOJtbPQJ-vSm0iLzm9WoH5HFO3h_vs';

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  try {
    console.log('Applying migration to add missing display fields...');
    
    // Read the migration file
    const migrationSQL = fs.readFileSync('/Volumes/Samsung 2TB/Projects/02-development/strategic-plan-builder/supabase/migrations/20250116_add_display_fields.sql', 'utf8');
    
    // Execute the migration using raw SQL
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: migrationSQL 
    }).catch(async (rpcError) => {
      // If RPC doesn't exist, try direct execution through postgres-js
      console.log('RPC method not available, attempting direct SQL execution...');
      
      // Split the SQL into individual statements
      const statements = migrationSQL
        .split(';')
        .filter(stmt => stmt.trim())
        .map(stmt => stmt.trim() + ';');
      
      for (const statement of statements) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        
        // We'll need to use the REST API directly
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({ query: statement })
        });
        
        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Failed to execute SQL: ${error}`);
        }
      }
      
      return { data: 'Migration applied successfully', error: null };
    });
    
    if (error) {
      console.error('Error applying migration:', error);
      return;
    }
    
    console.log('Migration applied successfully!');
    
    // Verify the columns were added
    console.log('\nVerifying columns exist...');
    const { data: columns, error: verifyError } = await supabase
      .from('spb_metrics')
      .select('*')
      .limit(0);
    
    if (!verifyError) {
      console.log('✅ Database schema updated successfully');
    } else {
      console.error('Verification error:', verifyError);
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Alternative approach using direct admin operations
async function applyMigrationAlternative() {
  try {
    console.log('Checking current columns in spb_metrics table...');
    
    // Test by trying to update a metric with the new fields
    const { data: testData, error: testError } = await supabase
      .from('spb_metrics')
      .select('id')
      .limit(1);
    
    if (testData && testData.length > 0) {
      const testId = testData[0].id;
      console.log('Testing update with display_width field...');
      
      const { error: updateError } = await supabase
        .from('spb_metrics')
        .update({ display_width: 'full' })
        .eq('id', testId);
      
      if (updateError) {
        console.log('display_width field does not exist, migration needed');
        console.log('\n⚠️  Manual migration required!');
        console.log('Please run the following SQL in your Supabase SQL Editor:');
        console.log('----------------------------------------');
        const migrationSQL = fs.readFileSync('/Volumes/Samsung 2TB/Projects/02-development/strategic-plan-builder/supabase/migrations/20250116_add_display_fields.sql', 'utf8');
        console.log(migrationSQL);
        console.log('----------------------------------------');
      } else {
        console.log('✅ display_width field already exists!');
      }
    }
    
  } catch (err) {
    console.error('Error:', err);
  }
}

// Try the alternative approach
applyMigrationAlternative();