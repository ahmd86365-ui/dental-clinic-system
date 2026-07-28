-- Enables Supabase Realtime for the Notification table.
--
-- Prisma connects as the table owner, so enabling RLS here has no effect on
-- any existing Prisma read/write path in this app (RLS never applies to the
-- owner). This is purely so the Supabase Realtime service can authorize
-- pushing change events to signed-in (authenticated) browser clients.
--
-- The policy is intentionally permissive (any authenticated staff member can
-- receive the raw change event over the realtime channel) — role-based
-- visibility filtering happens in the application layer (see
-- src/lib/notifications.ts, getVisibleNotificationTypes) both for the initial
-- fetch and when merging realtime events into the UI. This matches the rest
-- of the app, which enforces all authorization in Next.js server code rather
-- than Postgres RLS.

ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated staff can read notifications"
  ON "Notification"
  FOR SELECT
  TO authenticated
  USING (true);

-- Guarded: Prisma's shadow database (used to validate `migrate dev`) is a
-- plain Postgres instance without Supabase's `supabase_realtime` publication,
-- so this only runs where that publication actually exists (the real
-- Supabase-managed database).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "Notification";
  END IF;
END $$;
