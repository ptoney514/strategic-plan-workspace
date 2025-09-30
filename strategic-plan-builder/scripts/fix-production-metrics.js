const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qsftokjevxueboldvmzc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzZnRva2pldnh1ZWJvbGR2bXpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MTczNzgsImV4cCI6MjA2ODQ5MzM3OH0.23MJDiRu-PRyyYh5pJV5wXpUyxdkS7x_cZ_9sgUFJms';

// You need to get the service role key from Supabase dashboard
// Settings -> API -> service_role (secret)
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY_PROD;

if (!SERVICE_ROLE_KEY) {
  console.error('Please set SUPABASE_SERVICE_ROLE_KEY_PROD environment variable');
  console.error('You can find it in Supabase Dashboard -> Settings -> API -> service_role');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, SERVICE_ROLE_KEY);

async function fixMetricsConstraints() {
  console.log('Checking current constraints...');
  
  // Check what columns need defaults
  const { data: columns, error: checkError } = await supabase
    .rpc('query', {
      query: `
        SELECT column_name, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_name = 'spb_metrics' 
        AND is_nullable = 'NO' 
        AND column_default IS NULL
      `
    });

  if (checkError) {
    console.error('Error checking columns:', checkError);
  } else {
    console.log('Columns without defaults:', columns);
  }

  // Apply fixes
  const fixes = [
    "ALTER TABLE public.spb_metrics ALTER COLUMN name SET DEFAULT 'New Metric'",
    "ALTER TABLE public.spb_metrics ALTER COLUMN metric_type SET DEFAULT 'percent'",
    "ALTER TABLE public.spb_metrics ALTER COLUMN measure_title SET DEFAULT 'Metric'",
    "ALTER TABLE public.spb_metrics ALTER COLUMN measure_unit SET DEFAULT '%'",
    "ALTER TABLE public.spb_metrics ALTER COLUMN unit SET DEFAULT '%'",
    "ALTER TABLE public.spb_metrics ALTER COLUMN metric_category SET DEFAULT 'other'",
    "ALTER TABLE public.spb_metrics ALTER COLUMN collection_frequency SET DEFAULT 'quarterly'",
    "ALTER TABLE public.spb_metrics ALTER COLUMN is_higher_better SET DEFAULT true",
    "ALTER TABLE public.spb_metrics ALTER COLUMN trend_direction SET DEFAULT 'stable'",
    "ALTER TABLE public.spb_metrics ALTER COLUMN current_value SET DEFAULT 0",
    "ALTER TABLE public.spb_metrics ALTER COLUMN target_value SET DEFAULT 100",
    "ALTER TABLE public.spb_metrics ALTER COLUMN display_order SET DEFAULT 0",
    "ALTER TABLE public.spb_metrics ALTER COLUMN decimal_places SET DEFAULT 0",
    "ALTER TABLE public.spb_metrics ALTER COLUMN show_percentage SET DEFAULT false"
  ];

  for (const fix of fixes) {
    console.log(`Running: ${fix}`);
    const { error } = await supabase.rpc('query', { query: fix });
    if (error) {
      console.error(`Failed: ${error.message}`);
    } else {
      console.log('✓ Success');
    }
  }

  console.log('\nFix complete! Try adding a metric now.');
}

fixMetricsConstraints().catch(console.error);