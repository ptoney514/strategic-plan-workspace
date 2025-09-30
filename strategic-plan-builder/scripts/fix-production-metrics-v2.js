const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qsftokjevxueboldvmzc.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzZnRva2pldnh1ZWJvbGR2bXpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkxNzM3OCwiZXhwIjoyMDY4NDkzMzc4fQ.2ojjqcBouC7waOOJtbPQJ-vSm0iLzm9WoH5HFO3h_vs';

const supabase = createClient(supabaseUrl, SERVICE_ROLE_KEY);

async function testAndFix() {
  console.log('Testing metric creation with current setup...\n');
  
  // First, let's try to insert a test metric to see what fails
  const testMetric = {
    goal_id: '7730-b581bf601aa431f4', // From your screenshot
    name: 'Test Metric',
    metric_type: 'percent',
    current_value: 0,
    target_value: 100,
    // Add all potentially required fields
    measure_title: 'Test',
    measure_unit: '%',
    unit: '%',
    metric_category: 'other',
    collection_frequency: 'quarterly',
    is_higher_better: true,
    decimal_places: 0,
    show_percentage: false,
    display_order: 999,
    trend_direction: 'stable'
  };

  console.log('Attempting to insert test metric...');
  const { data, error } = await supabase
    .from('spb_metrics')
    .insert([testMetric])
    .select();

  if (error) {
    console.error('❌ Failed to insert metric:', error.message);
    console.error('Error details:', error.details);
    console.error('Error hint:', error.hint);
    
    // Now let's check what columns exist and their constraints
    console.log('\n📋 Checking table structure...\n');
    
    const { data: columns, error: columnsError } = await supabase
      .from('spb_metrics')
      .select()
      .limit(0);
    
    if (!columnsError && columns !== null) {
      // Get a sample row to see what columns exist
      const { data: sample, error: sampleError } = await supabase
        .from('spb_metrics')
        .select('*')
        .limit(1);
      
      if (sample && sample.length > 0) {
        console.log('Sample metric columns:', Object.keys(sample[0]));
      }
    }
    
    // Try inserting with minimal fields
    console.log('\n🔧 Attempting minimal insert...');
    const minimalMetric = {
      goal_id: '7730-b581bf601aa431f4',
      name: 'Test Metric Minimal'
    };
    
    const { data: minData, error: minError } = await supabase
      .from('spb_metrics')
      .insert([minimalMetric])
      .select();
    
    if (minError) {
      console.error('❌ Minimal insert also failed:', minError.message);
      console.log('\n⚠️  The issue is likely with database constraints.');
      console.log('Please run the SQL script manually in Supabase Dashboard:');
      console.log('1. Go to SQL Editor in Supabase Dashboard');
      console.log('2. Run the fix-metrics-table-constraints.sql script');
    } else {
      console.log('✅ Minimal insert succeeded!');
      // Clean up test metric
      if (minData && minData[0]) {
        await supabase.from('spb_metrics').delete().eq('id', minData[0].id);
        console.log('🧹 Cleaned up test metric');
      }
    }
    
  } else {
    console.log('✅ Test metric created successfully!');
    console.log('Metric ID:', data[0].id);
    
    // Clean up the test metric
    if (data && data[0]) {
      const { error: deleteError } = await supabase
        .from('spb_metrics')
        .delete()
        .eq('id', data[0].id);
      
      if (!deleteError) {
        console.log('🧹 Test metric cleaned up');
      }
    }
    
    console.log('\n🎉 Metrics are working correctly now!');
  }
}

testAndFix().catch(console.error);