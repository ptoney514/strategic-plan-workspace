const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qsftokjevxueboldvmzc.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzZnRva2pldnh1ZWJvbGR2bXpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkxNzM3OCwiZXhwIjoyMDY4NDkzMzc4fQ.2ojjqcBouC7waOOJtbPQJ-vSm0iLzm9WoH5HFO3h_vs';

const supabase = createClient(supabaseUrl, SERVICE_ROLE_KEY);

async function checkSchema() {
  console.log('Checking production schema for spb_metrics table...\n');
  
  // Get a sample metric to see all columns
  const { data: sample, error } = await supabase
    .from('spb_metrics')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error fetching sample:', error);
    return;
  }
  
  if (sample && sample.length > 0) {
    console.log('Columns in production spb_metrics table:');
    console.log('=======================================');
    Object.keys(sample[0]).forEach(col => {
      const value = sample[0][col];
      const type = value === null ? 'null' : typeof value;
      console.log(`- ${col}: ${type}`);
    });
    
    console.log('\n\nSample data:');
    console.log(JSON.stringify(sample[0], null, 2));
  } else {
    console.log('No metrics found in database');
  }
  
  // Check if display_width exists
  console.log('\n\nChecking for display_width column...');
  const { data: testWidth, error: widthError } = await supabase
    .from('spb_metrics')
    .select('id, display_width')
    .limit(1);
  
  if (widthError && widthError.message.includes('column')) {
    console.log('❌ display_width column does NOT exist');
  } else {
    console.log('✅ display_width column exists');
  }
}

checkSchema().catch(console.error);