// Test script to validate the new database structure
// This checks that our type definitions and service layer are consistent

const { dbService } = require('./lib/db-service');

async function testDatabaseStructure() {
  console.log('Testing database structure refactoring...');
  
  // Test 1: Check that the service functions exist
  const expectedFunctions = [
    'getDistrict',
    'buildGoalHierarchy', 
    'updateDistrict',
    'createGoal',
    'updateGoal',
    'deleteGoal',
    'createMetric',
    'updateMetric', 
    'deleteMetric',
    'getNextGoalNumber',
    'getAllDistricts',
    'createDistrict'
  ];
  
  console.log('\n✅ Checking service functions exist:');
  const missingFunctions = expectedFunctions.filter(func => typeof dbService[func] !== 'function');
  if (missingFunctions.length > 0) {
    console.error('❌ Missing functions:', missingFunctions);
    return false;
  }
  console.log('✅ All expected functions are present');
  
  // Test 2: Check buildGoalHierarchy function with mock data
  console.log('\n✅ Testing hierarchical structure building:');
  const mockGoals = [
    { id: '1', goal_number: '1', title: 'Strategic Objective 1', level: 0, parent_id: null },
    { id: '2', goal_number: '1.1', title: 'Goal 1.1', level: 1, parent_id: '1' },
    { id: '3', goal_number: '1.2', title: 'Goal 1.2', level: 1, parent_id: '1' },
    { id: '4', goal_number: '1.1.1', title: 'Sub-goal 1.1.1', level: 2, parent_id: '2' },
    { id: '5', goal_number: '2', title: 'Strategic Objective 2', level: 0, parent_id: null }
  ];
  
  const hierarchy = dbService.buildGoalHierarchy(mockGoals);
  
  if (hierarchy.length !== 2) {
    console.error('❌ Expected 2 root goals, got', hierarchy.length);
    return false;
  }
  
  if (!hierarchy[0].children || hierarchy[0].children.length !== 2) {
    console.error('❌ Expected 2 children for first strategic objective');
    return false;
  }
  
  if (!hierarchy[0].children[0].children || hierarchy[0].children[0].children.length !== 1) {
    console.error('❌ Expected 1 child for first goal');
    return false;
  }
  
  console.log('✅ Hierarchical structure built correctly');
  
  console.log('\n✅ Database structure validation complete!');
  console.log('\nNext steps:');
  console.log('1. Run the migration script: migrations/001_refactor_to_hierarchical.sql');
  console.log('2. Test the UI components in development environment');
  console.log('3. Create sample data to validate the full workflow');
  
  return true;
}

// Run if called directly
if (require.main === module) {
  testDatabaseStructure()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testDatabaseStructure };