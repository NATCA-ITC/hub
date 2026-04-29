-- ============================================================================
-- Hub Schema - Baseline Migration
-- ============================================================================
-- User customizations and preferences for the Hub admin dashboard.
--
-- Tables:
-- - hub.user_preferences: Per-user dashboard settings (card visibility, layout)
-- ============================================================================

-- Create Hub schema
CREATE SCHEMA IF NOT EXISTS "hub";

-- ============================================================================
-- Table: hub.user_preferences
-- Per-user dashboard and UI preferences
-- ============================================================================
CREATE TABLE IF NOT EXISTS "hub"."user_preferences" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "member_number" text NOT NULL,
    "preferences" jsonb NOT NULL DEFAULT '{}'::jsonb,
    "created_at" timestamptz DEFAULT now() NOT NULL,
    "updated_at" timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT "user_preferences_member_number_unique" UNIQUE ("member_number")
);

-- Foreign key to public.members
ALTER TABLE "hub"."user_preferences"
    ADD CONSTRAINT "user_preferences_member_fk"
    FOREIGN KEY ("member_number")
    REFERENCES "public"."members"("membernumber");

-- Index for lookups
CREATE INDEX IF NOT EXISTS "idx_user_preferences_member"
    ON "hub"."user_preferences" ("member_number");

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION hub.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "user_preferences_updated_at"
    BEFORE UPDATE ON "hub"."user_preferences"
    FOR EACH ROW
    EXECUTE FUNCTION hub.update_updated_at();

-- ============================================================================
-- RLS Policies
-- ============================================================================
ALTER TABLE "hub"."user_preferences" ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (Hub uses service role key)
CREATE POLICY "service_role_all"
    ON "hub"."user_preferences"
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Grant schema usage
GRANT USAGE ON SCHEMA "hub" TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA "hub" TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA "hub" TO service_role;
