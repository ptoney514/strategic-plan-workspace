#!/usr/bin/env node

/**
 * Script to verify the strategic objectives enhancement migration
 * Checks that all new tables and fields have been created successfully
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Use local Supabase instance
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyMigration() {
  console.log('🔍 Verifying Strategic Objectives Enhancement Migration...\n');
  
  let allTablesCreated = true;
  let allFieldsAdded = true;
  
  try {
    // Check new tables
    console.log('📊 Checking new tables:');
    const tablesToCheck = [
      { name: 'spb_strategic_themes', description: 'Strategic themes/pillars' },
      { name: 'spb_initiatives', description: 'Action items and initiatives' },
      { name: 'spb_goal_updates', description: 'Progress updates and notes' },
      { name: 'spb_goal_artifacts', description: 'Evidence and documents' },
      { name: 'spb_goal_stakeholders', description: 'Stakeholder management' },
      { name: 'spb_goal_milestones', description: 'Key milestones' },
      { name: 'spb_goal_dependencies', description: 'Goal relationships' }
    ];
    
    for (const table of tablesToCheck) {
      const { data, error } = await supabase
        .from(table.name)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`   ❌ ${table.name} - NOT FOUND`);
        allTablesCreated = false;
      } else {
        console.log(`   ✅ ${table.name} - Created (${table.description})`);
      }
    }
    
    // Check enhanced fields in spb_goals
    console.log('\n📋 Checking enhanced fields in spb_goals:');
    const { data: goalSample, error: goalError } = await supabase
      .from('spb_goals')
      .select('*')
      .limit(1);
    
    if (!goalError && goalSample && goalSample.length > 0) {
      const newFields = [
        'owner_id', 'owner_name', 'department', 'priority', 
        'status_detail', 'start_date', 'end_date', 'review_frequency',
        'last_reviewed', 'budget_allocated', 'budget_spent', 
        'strategic_theme_id', 'is_public', 'executive_summary'
      ];
      
      const sample = goalSample[0];
      for (const field of newFields) {
        if (field in sample) {
          console.log(`   ✅ ${field} - Added`);
        } else {
          console.log(`   ❌ ${field} - NOT FOUND`);
          allFieldsAdded = false;
        }
      }
    } else {
      console.log('   ⚠️  Could not verify fields (no goals in database)');
    }
    
    // Check enhanced fields in spb_metrics
    console.log('\n📈 Checking enhanced fields in spb_metrics:');
    const { data: metricSample, error: metricError } = await supabase
      .from('spb_metrics')
      .select('*')
      .limit(1);
    
    if (!metricError && metricSample && metricSample.length > 0) {
      const newMetricFields = [
        'baseline_value', 'milestone_dates', 'trend_direction',
        'collection_frequency', 'data_source_details', 'last_collected'
      ];
      
      const sample = metricSample[0];
      for (const field of newMetricFields) {
        if (field in sample) {
          console.log(`   ✅ ${field} - Added`);
        } else {
          console.log(`   ❌ ${field} - NOT FOUND`);
          allFieldsAdded = false;
        }
      }
    } else {
      console.log('   ⚠️  Could not verify fields (no metrics in database)');
    }
    
    // Test creating a sample strategic theme
    console.log('\n🧪 Testing new table functionality:');
    const { data: themeData, error: themeError } = await supabase
      .from('spb_strategic_themes')
      .insert({
        district_id: '00000000-0000-0000-0000-000000000000',
        name: 'Test Theme',
        description: 'Testing migration success',
        color: '#0099CC'
      })
      .select()
      .single();
    
    if (themeError) {
      console.log('   ❌ Could not create test theme:', themeError.message);
    } else {
      console.log('   ✅ Successfully created test theme');
      
      // Clean up test data
      await supabase
        .from('spb_strategic_themes')
        .delete()
        .eq('id', themeData.id);
      console.log('   ✅ Test data cleaned up');
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 MIGRATION VERIFICATION SUMMARY');
    console.log('='.repeat(50));
    
    if (allTablesCreated && allFieldsAdded) {
      console.log('✅ All enhancements successfully applied!');
      console.log('\n🎉 Your strategic objectives now support:');
      console.log('   • Ownership and accountability tracking');
      console.log('   • Timeline and milestone management');
      console.log('   • Budget tracking');
      console.log('   • Strategic theme alignment');
      console.log('   • Initiative and action item tracking');
      console.log('   • Evidence and artifact uploads');
      console.log('   • Progress updates with sentiment');
      console.log('   • Stakeholder management');
      console.log('   • Goal dependencies and relationships');
    } else {
      console.log('⚠️  Some enhancements may not have been fully applied.');
      console.log('   Please check the migration logs for errors.');
    }
    
    console.log('\n📝 Next Steps:');
    console.log('   1. Update API endpoints to use new fields');
    console.log('   2. Enhance UI components for data display');
    console.log('   3. Add forms for data entry');
    console.log('   4. Test with sample data');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

// Run the verification
verifyMigration().catch(console.error);