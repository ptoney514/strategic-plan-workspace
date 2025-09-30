-- Comprehensive seed data for local development
-- This creates multiple districts with complete goal hierarchies and metrics

-- Clear existing data (for clean slate)
TRUNCATE public.spb_metrics CASCADE;
TRUNCATE public.spb_goals CASCADE;
TRUNCATE public.spb_districts CASCADE;

-- ================================================
-- DISTRICT 1: Omaha Public Schools
-- ================================================
INSERT INTO public.spb_districts (id, name, slug, primary_color, secondary_color, is_public)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Omaha Public Schools',
    'omaha',
    '#003366',
    '#FFA500',
    true
) ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color;

-- Strategic Objectives for Omaha (Level 0)
INSERT INTO public.spb_goals (id, district_id, goal_number, title, description, level, order_position)
VALUES 
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1', 'Academic Excellence', 'Ensure all students achieve academic success and are college/career ready', 0, 1),
    ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2', 'Student Wellbeing', 'Support the social-emotional health and safety of all students', 0, 2),
    ('b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '3', 'Operational Excellence', 'Optimize district operations and resource management', 0, 3)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- Goals for Academic Excellence (Level 1)
INSERT INTO public.spb_goals (id, district_id, parent_id, goal_number, title, description, level, order_position)
VALUES 
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1.1', 'Improve Reading Proficiency', 'Increase reading scores across all grade levels', 1, 1),
    ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1.2', 'Enhance Math Achievement', 'Improve mathematics performance district-wide', 1, 2),
    ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1.3', 'STEM Program Development', 'Expand science, technology, engineering, and math programs', 1, 3)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- Sub-goals for Reading Proficiency (Level 2)
INSERT INTO public.spb_goals (id, district_id, parent_id, goal_number, title, description, level, order_position)
VALUES 
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1.1.1', 'Early Literacy Initiative', 'Implement comprehensive K-2 reading intervention program', 2, 1),
    ('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1.1.2', 'Reading Resource Enhancement', 'Update library materials and digital reading platforms', 2, 2),
    ('d2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1.1.3', 'Teacher Professional Development', 'Provide literacy training for all elementary teachers', 2, 3)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- Goals for Student Wellbeing (Level 1)
INSERT INTO public.spb_goals (id, district_id, parent_id, goal_number, title, description, level, order_position)
VALUES 
    ('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2.1', 'Mental Health Support', 'Expand counseling and psychological services', 1, 1),
    ('c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2.2', 'Attendance Improvement', 'Reduce chronic absenteeism by 25%', 1, 2)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- Metrics for Omaha
INSERT INTO public.spb_metrics (goal_id, name, metric_type, data_source, current_value, target_value, unit, status, chart_type)
VALUES 
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Reading Proficiency Rate', 'percent', 'state_testing', 72, 85, '%', 'near-target', 'bar'),
    ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Math Proficiency Rate', 'percent', 'state_testing', 68, 80, '%', 'off-target', 'line'),
    ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'STEM Enrollment', 'number', 'enrollment_system', 1250, 2000, 'students', 'near-target', 'bar'),
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'K-2 Reading Level', 'percent', 'dibels_assessment', 65, 90, '%', 'off-target', 'line'),
    ('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Digital Library Usage', 'number', 'library_system', 45000, 75000, 'checkouts', 'near-target', 'bar'),
    ('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Student Support Ratio', 'ratio', 'hr_system', 250, 150, 'students/counselor', 'off-target', 'bar'),
    ('c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Chronic Absenteeism', 'percent', 'attendance_system', 18, 13.5, '%', 'near-target', 'line')
ON CONFLICT DO NOTHING;

-- ================================================
-- DISTRICT 2: Denver Public Schools
-- ================================================
INSERT INTO public.spb_districts (id, name, slug, primary_color, secondary_color, is_public)
VALUES (
    'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Denver Public Schools',
    'denver',
    '#1E4C8A',
    '#F37021',
    true
) ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color;

-- Strategic Objectives for Denver (Level 0)
INSERT INTO public.spb_goals (id, district_id, goal_number, title, description, level, order_position)
VALUES 
    ('b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1', 'Equity and Access', 'Ensure equitable access to quality education for all students', 0, 1),
    ('b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2', 'Teacher Excellence', 'Recruit, develop, and retain high-quality educators', 0, 2),
    ('b5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '3', 'Family Engagement', 'Strengthen family and community partnerships', 0, 3)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- Goals for Equity and Access (Level 1)
INSERT INTO public.spb_goals (id, district_id, parent_id, goal_number, title, description, level, order_position)
VALUES 
    ('c5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1.1', 'Close Achievement Gap', 'Reduce disparities in academic outcomes', 1, 1),
    ('c6eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1.2', 'Special Education Services', 'Improve outcomes for students with disabilities', 1, 2),
    ('c7eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1.3', 'English Language Learners', 'Support ELL students academic success', 1, 3)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- Sub-goals for Close Achievement Gap (Level 2)
INSERT INTO public.spb_goals (id, district_id, parent_id, goal_number, title, description, level, order_position)
VALUES 
    ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1.1.1', 'Targeted Interventions', 'Implement data-driven intervention programs', 2, 1),
    ('d4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1.1.2', 'Extended Learning Time', 'Provide after-school and summer programs', 2, 2)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- Goals for Teacher Excellence (Level 1)
INSERT INTO public.spb_goals (id, district_id, parent_id, goal_number, title, description, level, order_position)
VALUES 
    ('c8eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2.1', 'Teacher Retention', 'Improve teacher retention rate to 90%', 1, 1),
    ('c9eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2.2', 'Professional Development', 'Enhance teacher training programs', 1, 2)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- Metrics for Denver
INSERT INTO public.spb_metrics (goal_id, name, metric_type, data_source, current_value, target_value, unit, status, chart_type)
VALUES 
    ('c5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Achievement Gap', 'percent', 'state_testing', 25, 10, '%', 'off-target', 'line'),
    ('c6eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'IEP Goal Achievement', 'percent', 'special_ed_system', 60, 80, '%', 'near-target', 'bar'),
    ('c7eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ELL Proficiency Growth', 'percent', 'wida_assessment', 45, 65, '%', 'near-target', 'line'),
    ('c8eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Teacher Retention Rate', 'percent', 'hr_system', 82, 90, '%', 'near-target', 'bar'),
    ('c9eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'PD Hours per Teacher', 'number', 'pd_tracking', 40, 60, 'hours', 'on-target', 'bar'),
    ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Students in Intervention', 'number', 'rti_system', 2500, 3500, 'students', 'near-target', 'bar')
ON CONFLICT DO NOTHING;

-- ================================================
-- DISTRICT 3: Austin Independent School District
-- ================================================
INSERT INTO public.spb_districts (id, name, slug, primary_color, secondary_color, is_public)
VALUES (
    'a2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Austin Independent School District',
    'austin',
    '#005DAA',
    '#F7941E',
    true
) ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color;

-- Strategic Objectives for Austin (Level 0)
INSERT INTO public.spb_goals (id, district_id, goal_number, title, description, level, order_position)
VALUES 
    ('b6eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1', 'Innovation and Technology', 'Integrate technology and innovative teaching methods', 0, 1),
    ('b7eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2', 'College and Career Readiness', 'Prepare students for post-secondary success', 0, 2),
    ('b8eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '3', 'Sustainability', 'Create environmentally sustainable schools', 0, 3)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- Goals for Innovation and Technology (Level 1)
INSERT INTO public.spb_goals (id, district_id, parent_id, goal_number, title, description, level, order_position)
VALUES 
    ('caeebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b6eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1.1', '1:1 Device Program', 'Provide devices for all students', 1, 1),
    ('cbeebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b6eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1.2', 'Digital Curriculum', 'Implement digital learning platforms', 1, 2),
    ('cceebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b6eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1.3', 'Coding Education', 'Introduce computer science at all levels', 1, 3)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- Sub-goals for 1:1 Device Program (Level 2)
INSERT INTO public.spb_goals (id, district_id, parent_id, goal_number, title, description, level, order_position)
VALUES 
    ('d5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'caeebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1.1.1', 'Device Distribution', 'Deploy laptops/tablets to all students', 2, 1),
    ('d6eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'caeebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1.1.2', 'Internet Access', 'Ensure home internet for all students', 2, 2),
    ('d7eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'caeebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1.1.3', 'Tech Support', 'Provide technical support for families', 2, 3)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- Goals for College and Career Readiness (Level 1)
INSERT INTO public.spb_goals (id, district_id, parent_id, goal_number, title, description, level, order_position)
VALUES 
    ('cdeebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b7eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2.1', 'Graduation Rate', 'Increase graduation rate to 95%', 1, 1),
    ('ceeebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b7eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2.2', 'College Enrollment', 'Increase post-secondary enrollment', 1, 2),
    ('cfeebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b7eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2.3', 'Career Pathways', 'Expand CTE programs and partnerships', 1, 3)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- Metrics for Austin
INSERT INTO public.spb_metrics (goal_id, name, metric_type, data_source, current_value, target_value, unit, status, chart_type)
VALUES 
    ('caeebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Device Coverage', 'percent', 'it_inventory', 85, 100, '%', 'near-target', 'bar'),
    ('cbeebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Digital Platform Usage', 'percent', 'lms_analytics', 70, 90, '%', 'near-target', 'line'),
    ('cceebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'CS Course Enrollment', 'number', 'enrollment_system', 3200, 5000, 'students', 'on-target', 'bar'),
    ('cdeebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Graduation Rate', 'percent', 'state_reporting', 89, 95, '%', 'near-target', 'line'),
    ('ceeebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'College Enrollment Rate', 'percent', 'national_clearing', 72, 85, '%', 'near-target', 'bar'),
    ('cfeebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'CTE Completions', 'number', 'cte_system', 1800, 2500, 'students', 'on-target', 'bar'),
    ('d5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Devices Deployed', 'number', 'it_inventory', 42000, 48000, 'devices', 'near-target', 'bar'),
    ('d6eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Internet Connectivity', 'percent', 'family_survey', 78, 95, '%', 'off-target', 'line')
ON CONFLICT DO NOTHING;

-- ================================================
-- DISTRICT 4: Portland Public Schools
-- ================================================
INSERT INTO public.spb_districts (id, name, slug, primary_color, secondary_color, is_public)
VALUES (
    'a3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Portland Public Schools',
    'portland',
    '#004B87',
    '#7FB539',
    true
) ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color;

-- Strategic Objectives for Portland (Level 0)
INSERT INTO public.spb_goals (id, district_id, goal_number, title, description, level, order_position)
VALUES 
    ('b9eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1', 'Racial Equity', 'Eliminate racial disparities in education', 0, 1),
    ('baeebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2', 'Arts and Culture', 'Integrate arts education across curriculum', 0, 2)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- Goals for Racial Equity (Level 1)
INSERT INTO public.spb_goals (id, district_id, parent_id, goal_number, title, description, level, order_position)
VALUES 
    ('d8eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b9eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1.1', 'Culturally Responsive Teaching', 'Implement culturally responsive curriculum', 1, 1),
    ('d9eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b9eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1.2', 'Discipline Equity', 'Reduce disciplinary disparities', 1, 2)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- Metrics for Portland
INSERT INTO public.spb_metrics (goal_id, name, metric_type, data_source, current_value, target_value, unit, status, chart_type)
VALUES 
    ('d8eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'CRT Training Completion', 'percent', 'pd_system', 45, 100, '%', 'off-target', 'bar'),
    ('d9eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Discipline Disparity Index', 'ratio', 'discipline_system', 3.2, 1.0, 'ratio', 'off-target', 'line')
ON CONFLICT DO NOTHING;

-- ================================================
-- DISTRICT 5: Sample Test District (for testing)
-- ================================================
INSERT INTO public.spb_districts (id, name, slug, primary_color, secondary_color, is_public)
VALUES (
    'a4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Sample Test District',
    'sample-district',
    '#6B46C1',
    '#10B981',
    true
) ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color;

-- Strategic Objectives for Sample Test (Level 0)
INSERT INTO public.spb_goals (id, district_id, goal_number, title, description, level, order_position)
VALUES 
    ('bbeebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1', 'Test Objective 1', 'First test strategic objective', 0, 1),
    ('bceebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2', 'Test Objective 2', 'Second test strategic objective', 0, 2)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- Goals for Test Objective 1 (Level 1)
INSERT INTO public.spb_goals (id, district_id, parent_id, goal_number, title, description, level, order_position)
VALUES 
    ('daeebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'bbeebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1.1', 'Test Goal 1.1', 'First goal under objective 1', 1, 1),
    ('dbeebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'bbeebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1.2', 'Test Goal 1.2', 'Second goal under objective 1', 1, 2)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- Sub-goals for Test Goal 1.1 (Level 2)
INSERT INTO public.spb_goals (id, district_id, parent_id, goal_number, title, description, level, order_position)
VALUES 
    ('dceebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'daeebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1.1.1', 'Test Sub-goal 1.1.1', 'First sub-goal', 2, 1),
    ('ddeebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'daeebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1.1.2', 'Test Sub-goal 1.1.2', 'Second sub-goal', 2, 2)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- Metrics for Sample Test
INSERT INTO public.spb_metrics (goal_id, name, metric_type, data_source, current_value, target_value, unit, status, chart_type)
VALUES 
    ('daeebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Test Metric 1', 'percent', 'test_system', 50, 75, '%', 'near-target', 'bar'),
    ('dbeebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Test Metric 2', 'number', 'test_system', 100, 200, 'units', 'on-target', 'line'),
    ('dceebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Test Metric 3', 'currency', 'test_system', 50000, 100000, '$', 'off-target', 'bar')
ON CONFLICT DO NOTHING;

-- Summary of seeded data
SELECT 
    'Districts:' as entity,
    COUNT(*) as count 
FROM public.spb_districts
UNION ALL
SELECT 
    'Goals (Level 0):' as entity,
    COUNT(*) as count 
FROM public.spb_goals WHERE level = 0
UNION ALL
SELECT 
    'Goals (Level 1):' as entity,
    COUNT(*) as count 
FROM public.spb_goals WHERE level = 1
UNION ALL
SELECT 
    'Goals (Level 2):' as entity,
    COUNT(*) as count 
FROM public.spb_goals WHERE level = 2
UNION ALL
SELECT 
    'Total Goals:' as entity,
    COUNT(*) as count 
FROM public.spb_goals
UNION ALL
SELECT 
    'Metrics:' as entity,
    COUNT(*) as count 
FROM public.spb_metrics;