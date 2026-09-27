-- Add rejectionReason column to StudentResearchExperience
ALTER TABLE "research_vault"."StudentResearchExperience"
  ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;
