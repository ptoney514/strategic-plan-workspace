-- Seed data for local development
-- This will create a sample district with goals and metrics

-- Insert a sample district
INSERT INTO public.spb_districts (id, name, slug, primary_color, secondary_color, is_public)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Sample School District',
    'sample-district',
    '#0099CC',
    '#51d01b',
    true
) ON CONFLICT (slug) DO NOTHING;

-- Insert strategic objectives (level 0)
INSERT INTO public.spb_goals (id, district_id, goal_number, title, description, level, order_position)
VALUES 
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1', 'Academic Excellence', 'Ensure all students achieve academic success', 0, 1),
    ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2', 'Student Wellbeing', 'Support the social-emotional health of all students', 0, 2)
ON CONFLICT (id) DO NOTHING;

-- Insert goals (level 1)
INSERT INTO public.spb_goals (id, district_id, parent_id, goal_number, title, description, level, order_position)
VALUES 
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1.1', 'Improve Reading Proficiency', 'Increase reading scores across all grade levels', 1, 1),
    ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1.2', 'Enhance Math Achievement', 'Improve mathematics performance district-wide', 1, 2)
ON CONFLICT (id) DO NOTHING;

-- Insert sample metrics
INSERT INTO public.spb_metrics (goal_id, name, metric_type, data_source, current_value, target_value, unit, status, chart_type)
VALUES 
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Reading Proficiency Rate', 'percent', 'state_testing', 72, 85, '%', 'near-target', 'bar'),
    ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Math Proficiency Rate', 'percent', 'state_testing', 68, 80, '%', 'off-target', 'line')
ON CONFLICT DO NOTHING;