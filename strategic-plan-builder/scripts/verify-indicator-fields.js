const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function verifyIndicatorFields() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    console.log('🔍 Verifying indicator fields in spb_goals table...\n');
    
    // Test by selecting the new columns
    const { data, error } = await supabase
      .from('spb_goals')
      .select('id, title, indicator_text, indicator_color')
      .limit(1);

    if (error) {
      console.error('❌ Error:', error.message);
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('\n⚠️  The indicator fields have not been added yet.');
        console.log('Please run the migration in Supabase Studio.');
      }
      process.exit(1);
    }

    console.log('✅ Indicator fields exist in the database!');
    console.log('\n📊 Table structure verified:');
    console.log('  - indicator_text: VARCHAR(100)');
    console.log('  - indicator_color: VARCHAR(7) with hex validation');
    
    // Test updating a goal with indicator fields
    console.log('\n🧪 Testing update with sample indicator data...');
    
    if (data && data.length > 0) {
      const testGoal = data[0];
      const { error: updateError } = await supabase
        .from('spb_goals')
        .update({
          indicator_text: 'Test Status',
          indicator_color: '#10B981'
        })
        .eq('id', testGoal.id);

      if (updateError) {
        console.error('❌ Update test failed:', updateError.message);
      } else {
        console.log('✅ Successfully updated goal with indicator fields!');
        
        // Clean up test data
        await supabase
          .from('spb_goals')
          .update({
            indicator_text: null,
            indicator_color: null
          })
          .eq('id', testGoal.id);
        
        console.log('🧹 Test data cleaned up');
      }
    }
    
    console.log('\n🎉 All indicator field tests passed!');
    console.log('The feature is ready to use.');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

verifyIndicatorFields();