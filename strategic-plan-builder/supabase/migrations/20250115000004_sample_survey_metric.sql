-- Insert sample survey metric for Goal 1.1 "Close Achievement Gap"

-- First find the goal
DO $$
DECLARE
  v_goal_id UUID;
  v_metric_id UUID;
BEGIN
  -- Find Goal 1.1
  SELECT id INTO v_goal_id 
  FROM public.spb_goals 
  WHERE goal_number = '1.1' 
  LIMIT 1;
  
  IF v_goal_id IS NULL THEN
    RAISE NOTICE 'Goal 1.1 not found. Skipping survey metric creation.';
    RETURN;
  END IF;
  
  -- Create the survey metric
  INSERT INTO public.spb_metrics (
    goal_id,
    name,
    description,
    metric_type,
    metric_category,
    data_source,
    current_value,
    target_value,
    unit,
    is_higher_better,
    collection_frequency,
    survey_primary_source,
    survey_data_source,
    survey_source_label,
    narrative_text,
    survey_scale_min,
    survey_scale_max,
    risk_threshold_critical,
    risk_threshold_off_target
  ) VALUES (
    v_goal_id,
    'Student Belonging Survey',
    'Overall average of responses (1-5 rating) on sense of belonging from district-wide surveys',
    'survey',
    'culture',
    'survey',
    3.72,  -- Current survey value
    4.0,   -- Target value
    'rating',
    true,  -- Higher is better
    'annually',
    3.70,  -- Primary source value
    3.76,  -- Data source value
    'Annual Student Belonging Survey',
    'The annual student belonging survey continues to increase each year. Staff are committed to creating inclusive environments where all students feel valued, supported, and connected to their school community.',
    1.0,   -- Scale minimum
    5.0,   -- Scale maximum
    0.7,   -- Critical threshold
    0.9    -- Off-target threshold
  ) RETURNING id INTO v_metric_id;
  
  -- Insert historical survey data points
  INSERT INTO public.spb_metric_survey_data (
    metric_id,
    year,
    primary_value,
    data_value,
    survey_value,
    response_count,
    notes
  ) VALUES 
    (v_metric_id, 2021, 3.45, 3.48, 3.42, 1250, 'Baseline year'),
    (v_metric_id, 2022, 3.58, 3.62, 3.55, 1320, 'Improvement after interventions'),
    (v_metric_id, 2023, 3.65, 3.68, 3.63, 1380, 'Continued growth'),
    (v_metric_id, 2024, 3.70, 3.76, 3.72, 1425, 'Strong progress toward target'),
    (v_metric_id, 2025, 3.75, 3.80, 3.78, 1450, 'Projected values');
  
  RAISE NOTICE 'Successfully created survey metric for Goal 1.1 with ID: %', v_metric_id;
END $$;