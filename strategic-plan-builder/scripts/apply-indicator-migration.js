const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function applyMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    console.log('📋 Applying indicator fields migration...');
    
    const migrationSql = fs.readFileSync(
      path.join(__dirname, '../supabase/migrations/20250113_add_indicator_fields.sql'),
      'utf8'
    );

    // Execute the SQL migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSql
    });

    // If exec_sql doesn't exist, try direct execution
    if (error && error.message.includes('function public.exec_sql')) {
      console.log('📝 Running migration statements individually...');
      
      // Split the SQL into individual statements and execute them
      const statements = migrationSql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        console.log('  Executing:', statement.substring(0, 50) + '...');
        
        // For ALTER TABLE statements, we need to use raw SQL through Supabase
        // Since Supabase JS doesn't support direct DDL, we'll need to use a different approach
      }
      
      console.log('⚠️  Manual migration required. Please run the following SQL in Supabase Studio:');
      console.log('');
      console.log(migrationSql);
      console.log('');
      console.log('Open Supabase Studio at: http://127.0.0.1:54323');
      console.log('Navigate to SQL Editor and paste the above SQL');
    } else if (error) {
      throw error;
    } else {
      console.log('✅ Migration applied successfully!');
    }

  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    process.exit(1);
  }
}

applyMigration();