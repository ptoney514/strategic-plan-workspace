// Script to update indicator status for all strategic objectives
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateIndicatorStatus() {
  try {
    console.log('🚀 Starting indicator status update...\n');
    console.log('Supabase URL:', supabaseUrl);
    
    // First, let's check current status of strategic objectives
    console.log('📊 Checking current strategic objectives...\n');
    const { data: currentGoals, error: fetchError } = await supabase
      .from('spb_goals')
      .select('id, goal_number, title, indicator_text, indicator_color, district_id')
      .eq('level', 0)
      .order('goal_number');

    if (fetchError) {
      console.error('❌ Error fetching goals:', fetchError);
      return;
    }

    console.log(`Found ${currentGoals?.length || 0} strategic objectives\n`);
    
    if (currentGoals && currentGoals.length > 0) {
      console.log('Current status:');
      currentGoals.forEach(goal => {
        console.log(`  ${goal.goal_number}. ${goal.title}`);
        console.log(`     Current: ${goal.indicator_text || '(not set)'} | ${goal.indicator_color || '(no color)'}`);
      });
      console.log('');
    }

    // Update all level-0 goals (strategic objectives) with "On Target" status and blue color
    console.log('🔄 Updating all strategic objectives to "On Target" with blue color (#3B82F6)...\n');
    
    const { data: updatedGoals, error: updateError } = await supabase
      .from('spb_goals')
      .update({
        indicator_text: 'On Target',
        indicator_color: '#3B82F6' // Blue color
      })
      .eq('level', 0)
      .select();

    if (updateError) {
      console.error('❌ Error updating indicators:', updateError);
      return;
    }

    console.log(`✅ Successfully updated ${updatedGoals?.length || 0} strategic objectives\n`);
    
    // Verify the update
    console.log('🔍 Verifying updates...\n');
    const { data: verifiedGoals, error: verifyError } = await supabase
      .from('spb_goals')
      .select('id, goal_number, title, indicator_text, indicator_color, district_id')
      .eq('level', 0)
      .order('goal_number');

    if (!verifyError && verifiedGoals) {
      console.log('Updated strategic objectives:');
      
      // Group by district for better readability
      const goalsByDistrict = {};
      verifiedGoals.forEach(goal => {
        if (!goalsByDistrict[goal.district_id]) {
          goalsByDistrict[goal.district_id] = [];
        }
        goalsByDistrict[goal.district_id].push(goal);
      });
      
      Object.keys(goalsByDistrict).forEach(districtId => {
        console.log(`\n  District: ${districtId.substring(0, 8)}...`);
        goalsByDistrict[districtId].forEach(goal => {
          console.log(`    ${goal.goal_number}. ${goal.title}`);
          console.log(`       Status: ${goal.indicator_text} | Color: ${goal.indicator_color}`);
        });
      });
      
      console.log('\n🎉 All strategic objectives have been updated successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. Visit http://localhost:3000/dashboard/denver/strategic-objectives');
      console.log('2. Check that objectives show "On Target" with blue indicator');
      console.log('3. Visit http://localhost:3000/districts/denver/admin');
      console.log('4. Expand an objective and click "Edit Objective" to verify the values');
    } else if (verifyError) {
      console.error('❌ Error verifying updates:', verifyError);
    }
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the update
updateIndicatorStatus();