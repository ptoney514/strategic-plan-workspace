-- Sample Metrics Data Matching the Example Image
-- This creates metrics for Goal 1 "Student Achievement & Well-being" and its sub-goals

-- First, let's ensure we have the right goals structure
-- We'll use the Omaha district as our example

DO $$
DECLARE
    v_district_id UUID;
    v_objective_1_id UUID;
    v_goal_1_1_id UUID;
    v_goal_1_2_id UUID;
    v_goal_1_3_id UUID;
BEGIN
    -- Get or create Omaha district
    SELECT id INTO v_district_id FROM spb_districts WHERE slug = 'omaha' LIMIT 1;
    
    IF v_district_id IS NULL THEN
        INSERT INTO spb_districts (name, slug, primary_color, secondary_color, is_public, admin_email)
        VALUES ('Omaha Public Schools', 'omaha', '#2563eb', '#10b981', true, 'admin@omaha.edu')
        RETURNING id INTO v_district_id;
    END IF;

    -- Create Strategic Objective 1: Student Achievement & Well-being
    -- First check if it exists
    SELECT id INTO v_objective_1_id FROM spb_goals 
    WHERE district_id = v_district_id AND goal_number = '1' LIMIT 1;
    
    IF v_objective_1_id IS NULL THEN
        INSERT INTO spb_goals (district_id, parent_id, goal_number, title, description, level, order_position, indicator_text, indicator_color)
        VALUES (
            v_district_id,
            NULL,
            '1',
            'Student Achievement & Well-being',
            'Focus on improving academic outcomes and student wellness through evidence-based strategies and comprehensive support systems.',
            0,
            1,
            'On Track',
            '#10b981'
        )
        RETURNING id INTO v_objective_1_id;
    END IF;

    -- Create Goal 1.1
    SELECT id INTO v_goal_1_1_id FROM spb_goals 
    WHERE district_id = v_district_id AND goal_number = '1.1' LIMIT 1;
    
    IF v_goal_1_1_id IS NULL THEN
        INSERT INTO spb_goals (district_id, parent_id, goal_number, title, description, level, order_position)
        VALUES (
            v_district_id,
            v_objective_1_id,
            '1.1',
            'Grow and nurture a district culture that values, respects, and supports the well-being of all students',
            'Create an inclusive environment where every student feels valued, supported, and empowered to reach their full potential.',
            1,
            1
        )
        RETURNING id INTO v_goal_1_1_id;
    END IF;

    -- Create Goal 1.2
    SELECT id INTO v_goal_1_2_id FROM spb_goals 
    WHERE district_id = v_district_id AND goal_number = '1.2' LIMIT 1;
    
    IF v_goal_1_2_id IS NULL THEN
        INSERT INTO spb_goals (district_id, parent_id, goal_number, title, description, level, order_position)
        VALUES (
            v_district_id,
            v_objective_1_id,
            '1.2',
            'NDE Academic Classification',
            'Achieve and maintain high academic classification standards as defined by the Nebraska Department of Education.',
            1,
            2
        )
        RETURNING id INTO v_goal_1_2_id;
    END IF;

    -- Create Goal 1.3
    SELECT id INTO v_goal_1_3_id FROM spb_goals 
    WHERE district_id = v_district_id AND goal_number = '1.3' LIMIT 1;
    
    IF v_goal_1_3_id IS NULL THEN
        INSERT INTO spb_goals (district_id, parent_id, goal_number, title, description, level, order_position)
        VALUES (
            v_district_id,
            v_objective_1_id,
            '1.3',
            'Average Score of Teachers on the Instructional Framework',
            'Maintain high-quality instruction across all classrooms through effective teaching practices and continuous improvement.',
            1,
            3
        )
        RETURNING id INTO v_goal_1_3_id;
    END IF;

    -- Delete existing metrics for these goals to avoid duplicates
    DELETE FROM spb_metrics WHERE goal_id IN (v_goal_1_1_id, v_goal_1_2_id, v_goal_1_3_id);

    -- Create Metric for Goal 1.1
    INSERT INTO spb_metrics (
        goal_id, 
        name,
        description,
        measure_title,
        metric_type,
        metric_category,
        current_value,
        target_value,
        measure_unit,
        decimal_places,
        show_percentage,
        is_higher_better,
        risk_threshold_critical,
        risk_threshold_off_target,
        collection_frequency
    ) VALUES (
        v_goal_1_1_id,
        'Student Belonging Survey',
        'Overall average of responses (1-5 rating) on sense of belonging and support',
        'Belonging Score',
        'rating',
        'culture',
        3.74,
        4.0,
        'points',
        2,
        false,
        true,
        0.85,  -- Critical if below 85% of target (3.4)
        0.93,  -- Off-target if below 93% of target (3.72)
        'annually'
    );

    -- Create Metric for Goal 1.2
    INSERT INTO spb_metrics (
        goal_id,
        name,
        description,
        measure_title,
        metric_type,
        metric_category,
        current_value,
        target_value,
        measure_unit,
        decimal_places,
        show_percentage,
        is_higher_better,
        risk_threshold_critical,
        risk_threshold_off_target,
        collection_frequency
    ) VALUES (
        v_goal_1_2_id,
        'NDE Classification Score',
        'Excellent: 100%; Great: 90%; Good: 80%; Needs Improvement: <80%',
        'Classification Score',
        'percent',
        'achievement',
        90,
        95,
        '%',
        0,
        true,
        true,
        0.84,  -- Critical if below 80
        0.89,  -- Off-target if below 85
        'annually'
    );

    -- Create Metric for Goal 1.3
    INSERT INTO spb_metrics (
        goal_id,
        name,
        description,
        measure_title,
        metric_type,
        metric_category,
        current_value,
        target_value,
        measure_unit,
        decimal_places,
        show_percentage,
        is_higher_better,
        risk_threshold_critical,
        risk_threshold_off_target,
        collection_frequency
    ) VALUES (
        v_goal_1_3_id,
        'Instructional Framework Score',
        '% meeting expectations',
        'Teacher Performance',
        'rating',
        'achievement',
        3.73,
        4.0,
        'points',
        2,
        false,
        true,
        0.85,  -- Critical if below 3.4
        0.93,  -- Off-target if below 3.72
        'quarterly'
    );

    -- Add some time-series data for these metrics
    -- Goal 1.1 Metric Time Series (Quarterly data for 2024)
    INSERT INTO spb_metric_time_series (metric_id, period, period_type, target_value, actual_value, status)
    SELECT 
        m.id,
        period,
        'quarterly'::varchar,
        target,
        actual,
        CASE 
            WHEN actual >= target * 0.93 THEN 'on-target'
            WHEN actual >= target * 0.85 THEN 'off-target'
            ELSE 'critical'
        END
    FROM spb_metrics m
    CROSS JOIN (VALUES 
        ('2024-Q1', 4.0, 3.65),
        ('2024-Q2', 4.0, 3.70),
        ('2024-Q3', 4.0, 3.72),
        ('2024-Q4', 4.0, 3.74)
    ) AS data(period, target, actual)
    WHERE m.goal_id = v_goal_1_1_id
    ON CONFLICT (metric_id, period) DO UPDATE
    SET actual_value = EXCLUDED.actual_value,
        target_value = EXCLUDED.target_value,
        status = EXCLUDED.status;

    -- Goal 1.2 Metric Time Series (Annual data)
    INSERT INTO spb_metric_time_series (metric_id, period, period_type, target_value, actual_value, status)
    SELECT 
        m.id,
        period,
        'annual'::varchar,
        target,
        actual,
        CASE 
            WHEN actual >= target * 0.95 THEN 'on-target'
            WHEN actual >= target * 0.89 THEN 'off-target'
            ELSE 'critical'
        END
    FROM spb_metrics m
    CROSS JOIN (VALUES 
        ('2023', 95, 88),
        ('2024', 95, 90)
    ) AS data(period, target, actual)
    WHERE m.goal_id = v_goal_1_2_id
    ON CONFLICT (metric_id, period) DO UPDATE
    SET actual_value = EXCLUDED.actual_value,
        target_value = EXCLUDED.target_value,
        status = EXCLUDED.status;

    -- Goal 1.3 Metric Time Series (Quarterly data)
    INSERT INTO spb_metric_time_series (metric_id, period, period_type, target_value, actual_value, status)
    SELECT 
        m.id,
        period,
        'quarterly'::varchar,
        target,
        actual,
        CASE 
            WHEN actual >= target * 0.93 THEN 'on-target'
            WHEN actual >= target * 0.85 THEN 'off-target'
            ELSE 'critical'
        END
    FROM spb_metrics m
    CROSS JOIN (VALUES 
        ('2024-Q1', 4.0, 3.60),
        ('2024-Q2', 4.0, 3.68),
        ('2024-Q3', 4.0, 3.71),
        ('2024-Q4', 4.0, 3.73)
    ) AS data(period, target, actual)
    WHERE m.goal_id = v_goal_1_3_id
    ON CONFLICT (metric_id, period) DO UPDATE
    SET actual_value = EXCLUDED.actual_value,
        target_value = EXCLUDED.target_value,
        status = EXCLUDED.status;

END $$;

-- Verify the data
SELECT 
    g.goal_number,
    g.title as goal_title,
    m.name as metric_name,
    m.current_value,
    m.target_value,
    m.measure_unit,
    CASE 
        WHEN m.current_value IS NULL OR m.target_value IS NULL THEN 'no-data'
        WHEN m.is_higher_better AND (m.current_value / m.target_value) >= 0.93 THEN 'on-target'
        WHEN m.is_higher_better AND (m.current_value / m.target_value) >= 0.85 THEN 'off-target'
        WHEN m.is_higher_better THEN 'critical'
        WHEN NOT m.is_higher_better AND (m.current_value / m.target_value) <= 1.07 THEN 'on-target'
        WHEN NOT m.is_higher_better AND (m.current_value / m.target_value) <= 1.15 THEN 'off-target'
        ELSE 'critical'
    END as status
FROM spb_goals g
JOIN spb_metrics m ON g.id = m.goal_id
WHERE g.goal_number IN ('1.1', '1.2', '1.3')
ORDER BY g.goal_number;

SELECT 'Sample metrics data created successfully!' as message;