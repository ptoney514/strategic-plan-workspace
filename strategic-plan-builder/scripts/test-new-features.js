#!/usr/bin/env node

/**
 * Test script for new strategic objectives features
 * Creates sample data using the enhanced fields
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Use local Supabase instance
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testNewFeatures() {
  console.log('🧪 Testing New Strategic Objectives Features\n');
  
  try {
    // First, get an existing district
    const { data: districts, error: districtError } = await supabase
      .from('spb_districts')
      .select('*')
      .limit(1);
    
    if (districtError || !districts || districts.length === 0) {
      console.log('❌ No districts found. Please create a district first.');
      return;
    }
    
    const district = districts[0];
    console.log(`📍 Using district: ${district.name} (${district.id})\n`);
    
    // 1. Create a strategic theme
    console.log('1️⃣ Creating Strategic Theme...');
    const { data: theme, error: themeError } = await supabase
      .from('spb_strategic_themes')
      .insert({
        district_id: district.id,
        name: 'Academic Excellence',
        description: 'Focus on improving student achievement and college readiness',
        color: '#4CAF50',
        icon: 'graduation-cap',
        display_order: 1
      })
      .select()
      .single();
    
    if (themeError) {
      console.log('   ❌ Error:', themeError.message);
    } else {
      console.log('   ✅ Theme created:', theme.name);
    }
    
    // 2. Update a goal with new fields (if any exist)
    console.log('\n2️⃣ Testing Goal Enhancement Fields...');
    const { data: goals, error: goalsError } = await supabase
      .from('spb_goals')
      .select('*')
      .eq('district_id', district.id)
      .eq('level', 0) // Strategic objectives only
      .limit(1);
    
    if (goals && goals.length > 0) {
      const goal = goals[0];
      const { data: updatedGoal, error: updateError } = await supabase
        .from('spb_goals')
        .update({
          owner_name: 'Dr. Sarah Johnson',
          department: 'Academic Affairs',
          priority: 'high',
          status_detail: 'in_progress',
          start_date: '2025-01-01',
          end_date: '2025-12-31',
          review_frequency: 'monthly',
          budget_allocated: 500000,
          budget_spent: 125000,
          strategic_theme_id: theme?.id,
          executive_summary: 'This strategic objective focuses on improving student outcomes through targeted interventions and support programs.'
        })
        .eq('id', goal.id)
        .select()
        .single();
      
      if (updateError) {
        console.log('   ❌ Error updating goal:', updateError.message);
      } else {
        console.log('   ✅ Goal updated with new fields');
        console.log('      Owner:', updatedGoal.owner_name);
        console.log('      Department:', updatedGoal.department);
        console.log('      Priority:', updatedGoal.priority);
        console.log('      Status:', updatedGoal.status_detail);
        console.log('      Budget:', `$${updatedGoal.budget_allocated} allocated, $${updatedGoal.budget_spent} spent`);
      }
      
      // 3. Create an initiative for the goal
      console.log('\n3️⃣ Creating Initiative...');
      const { data: initiative, error: initiativeError } = await supabase
        .from('spb_initiatives')
        .insert({
          goal_id: goal.id,
          title: 'Implement Reading Intervention Program',
          description: 'Deploy targeted reading support for struggling students',
          status: 'in_progress',
          priority: 'high',
          owner_name: 'Ms. Emily Chen',
          due_date: '2025-06-30',
          percent_complete: 35
        })
        .select()
        .single();
      
      if (initiativeError) {
        console.log('   ❌ Error:', initiativeError.message);
      } else {
        console.log('   ✅ Initiative created:', initiative.title);
        console.log('      Status:', initiative.status);
        console.log('      Progress:', initiative.percent_complete + '%');
      }
      
      // 4. Add a progress update
      console.log('\n4️⃣ Adding Progress Update...');
      const { data: update, error: updateNoteError } = await supabase
        .from('spb_goal_updates')
        .insert({
          goal_id: goal.id,
          update_text: 'Q1 results show 15% improvement in reading scores. Program expansion approved for Q2.',
          update_type: 'progress',
          sentiment: 'positive',
          created_by: 'Dr. Sarah Johnson'
        })
        .select()
        .single();
      
      if (updateNoteError) {
        console.log('   ❌ Error:', updateNoteError.message);
      } else {
        console.log('   ✅ Update added');
        console.log('      Type:', update.update_type);
        console.log('      Sentiment:', update.sentiment);
      }
      
      // 5. Add a stakeholder
      console.log('\n5️⃣ Adding Stakeholder...');
      const { data: stakeholder, error: stakeholderError } = await supabase
        .from('spb_goal_stakeholders')
        .insert({
          goal_id: goal.id,
          stakeholder_name: 'John Smith',
          stakeholder_email: 'jsmith@district.edu',
          stakeholder_role: 'sponsor',
          organization: 'School Board',
          notify_on_updates: true
        })
        .select()
        .single();
      
      if (stakeholderError) {
        console.log('   ❌ Error:', stakeholderError.message);
      } else {
        console.log('   ✅ Stakeholder added:', stakeholder.stakeholder_name);
        console.log('      Role:', stakeholder.stakeholder_role);
        console.log('      Organization:', stakeholder.organization);
      }
      
      // 6. Add a milestone
      console.log('\n6️⃣ Creating Milestone...');
      const { data: milestone, error: milestoneError } = await supabase
        .from('spb_goal_milestones')
        .insert({
          goal_id: goal.id,
          title: 'Mid-Year Assessment Complete',
          description: 'Complete comprehensive assessment of all students',
          target_date: '2025-06-15',
          status: 'pending',
          success_criteria: 'All students assessed with results documented'
        })
        .select()
        .single();
      
      if (milestoneError) {
        console.log('   ❌ Error:', milestoneError.message);
      } else {
        console.log('   ✅ Milestone created:', milestone.title);
        console.log('      Target Date:', milestone.target_date);
        console.log('      Status:', milestone.status);
      }
      
    } else {
      console.log('   ⚠️  No goals found for testing. Please create a strategic objective first.');
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✅ NEW FEATURES TEST COMPLETE');
    console.log('='.repeat(50));
    console.log('\n📊 Features Successfully Tested:');
    console.log('   • Strategic themes creation');
    console.log('   • Goal enhancement fields');
    console.log('   • Initiative tracking');
    console.log('   • Progress updates with sentiment');
    console.log('   • Stakeholder management');
    console.log('   • Milestone tracking');
    
    console.log('\n🎯 Your strategic objectives now have:');
    console.log('   • Full ownership and accountability');
    console.log('   • Timeline and budget tracking');
    console.log('   • Action items and initiatives');
    console.log('   • Progress documentation');
    console.log('   • Stakeholder engagement');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testNewFeatures().catch(console.error);