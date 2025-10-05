-- Seed data for Westside Community Schools
-- This creates the basic district for testing the Objective Builder

INSERT INTO public.spb_districts (id, name, slug, logo_url, primary_color, secondary_color, admin_email, is_public)
VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'Westside Community Schools',
  'westside',
  NULL,
  '#0099CC',
  '#51d01b',
  'admin@westside.edu',
  true
)
ON CONFLICT (slug) DO NOTHING;

SELECT 'Westside district seeded successfully!' as message;
