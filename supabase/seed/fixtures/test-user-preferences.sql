-- Test user preferences for Hub dashboard
-- Requires public.members to be seeded first (Platform baseline)

INSERT INTO hub.user_preferences (member_number, preferences)
VALUES
  ('46079', jsonb_build_object(
    'dashboard', jsonb_build_object(
      'pinnedCards', ARRAY['action-needed', 'recent-updates'],
      'theme', 'dark'
    )
  ))
ON CONFLICT (member_number) DO UPDATE
SET preferences = EXCLUDED.preferences;
