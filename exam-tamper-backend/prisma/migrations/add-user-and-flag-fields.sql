-- Migration: Add email, lastLogin fields to User table and create FlagResolution table
-- Date: 2026-08-04
-- Description: Adds support for user management features and flag resolution tracking
--
-- IMPORTANT: Run this script against your PostgreSQL database using psql or pgAdmin
-- Command: psql "postgresql://postgres:postgres@localhost:51213/postgres" -f this_file.sql
-- Or paste into pgAdmin's Query Tool

-- ============================================================
-- 1. Add email and lastLogin columns to "User" table
-- ============================================================
ALTER TABLE "User" 
  ADD COLUMN IF NOT EXISTS "email" TEXT,
  ADD COLUMN IF NOT EXISTS "lastLogin" TIMESTAMP(3);

-- ============================================================
-- 2. Create FlagResolution table
-- ============================================================
CREATE TABLE IF NOT EXISTS "FlagResolution" (
  "id" SERIAL PRIMARY KEY,
  "flagId" INTEGER NOT NULL,
  "resolvedById" INTEGER NOT NULL,
  "resolution" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. Add foreign key constraints for FlagResolution
-- ============================================================
ALTER TABLE "FlagResolution" 
  ADD CONSTRAINT IF NOT EXISTS "FlagResolution_flagId_fkey" 
  FOREIGN KEY ("flagId") REFERENCES "ResultVersion"("id") ON DELETE CASCADE;

ALTER TABLE "FlagResolution" 
  ADD CONSTRAINT IF NOT EXISTS "FlagResolution_resolvedById_fkey" 
  FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE RESTRICT;

-- ============================================================
-- 4. Create index on FlagResolution for faster lookups
-- ============================================================
CREATE INDEX IF NOT EXISTS "FlagResolution_flagId_idx" ON "FlagResolution"("flagId");
CREATE INDEX IF NOT EXISTS "FlagResolution_resolvedById_idx" ON "FlagResolution"("resolvedById");

-- ============================================================
-- 5. Update existing users to have a default email (optional)
-- ============================================================
UPDATE "User" SET "email" = username || '@institution.edu' WHERE "email" IS NULL;

-- ============================================================
-- Verification queries (run these to confirm the migration worked)
-- ============================================================
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'User';
-- SELECT * FROM information_schema.tables WHERE table_name = 'FlagResolution';