#!/usr/bin/env node

/**
 * Test script to verify goal creation and immediate retrieval
 */

const API_BASE = 'http://localhost:3000/api';

async function testGoalCreation() {
  console.log('🧪 Testing goal creation and retrieval...\n');
  
  try {
    // Step 1: Create a new goal
    console.log('📝 Creating new goal...');
    const createResponse = await fetch(`${API_BASE}/districts/test1/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parentId: null,
        goalData: {
          goal_number: '3',
          title: 'Community Engagement',
          level: 0,
          order_position: 0
        }
      })
    });
    
    const createResult = await createResponse.json();
    console.log('✅ Goal created:', createResult.goal?.title || 'Unknown');
    console.log('   ID:', createResult.goal?.id);
    
    // Step 2: Immediately fetch the district to verify goal appears
    console.log('\n🔍 Fetching district data...');
    const fetchResponse = await fetch(`${API_BASE}/districts/test1`);
    const fetchResult = await fetchResponse.json();
    
    const goals = fetchResult.district?.goals || [];
    console.log(`✅ Found ${goals.length} goals in district`);
    
    // List all goals
    goals.forEach((goal, index) => {
      console.log(`   ${index + 1}. ${goal.title} (${goal.goal_number})`);
    });
    
    // Verify our new goal is there
    const newGoal = goals.find(g => g.title === 'Community Engagement');
    if (newGoal) {
      console.log('\n🎉 SUCCESS: New goal is immediately visible after creation!');
    } else {
      console.log('\n❌ PROBLEM: New goal not found in immediate fetch');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testGoalCreation();