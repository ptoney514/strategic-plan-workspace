-- Cleanup script to keep only Test District and remove all other data
-- This will cascade delete all goals and metrics associated with other districts

BEGIN;

-- First, let's see what we're about to delete
SELECT 'Districts to be deleted:' as info;
SELECT id, name, slug FROM spb_districts WHERE slug != 'test-district';

SELECT 'Goals to be deleted:' as info;
SELECT g.id, g.title, d.name as district_name 
FROM spb_goals g 
JOIN spb_districts d ON g.district_id = d.id 
WHERE d.slug != 'test-district';

SELECT 'Metrics to be deleted:' as info;
SELECT m.id, m.name, d.name as district_name 
FROM spb_metrics m 
JOIN spb_goals g ON m.goal_id = g.id
JOIN spb_districts d ON g.district_id = d.id 
WHERE d.slug != 'test-district';

-- Delete all metrics for non-test districts (explicit deletion before cascade)
DELETE FROM spb_metrics 
WHERE goal_id IN (
    SELECT g.id 
    FROM spb_goals g 
    JOIN spb_districts d ON g.district_id = d.id 
    WHERE d.slug != 'test-district'
);

-- Delete all goals for non-test districts
DELETE FROM spb_goals 
WHERE district_id IN (
    SELECT id 
    FROM spb_districts 
    WHERE slug != 'test-district'
);

-- Delete all districts except Test District
DELETE FROM spb_districts 
WHERE slug != 'test-district';

-- Verify what remains
SELECT 'Remaining districts:' as info;
SELECT id, name, slug FROM spb_districts;

SELECT 'Remaining goals count:' as info;
SELECT COUNT(*) as goal_count FROM spb_goals;

SELECT 'Remaining metrics count:' as info;
SELECT COUNT(*) as metric_count FROM spb_metrics;

COMMIT;

-- Final verification
SELECT 
    d.name as district_name,
    d.slug,
    COUNT(DISTINCT g.id) as goal_count,
    COUNT(DISTINCT m.id) as metric_count
FROM spb_districts d
LEFT JOIN spb_goals g ON d.id = g.district_id
LEFT JOIN spb_metrics m ON g.id = m.goal_id
GROUP BY d.id, d.name, d.slug;