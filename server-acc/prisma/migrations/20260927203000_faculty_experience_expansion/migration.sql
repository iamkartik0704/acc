-- AlterTable
ALTER TABLE "research_vault"."FacultyProfile" 
  ADD COLUMN "closingDate" TIMESTAMP(3),
  ADD COLUMN "googleScholarLink" TEXT,
  ADD COLUMN "linkedinLink" TEXT,
  ADD COLUMN "openings" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "otherLinks" JSONB,
  ADD COLUMN "profileInfo" TEXT,
  ADD COLUMN "requirement" TEXT;

-- CreateTable
CREATE TABLE "research_vault"."StudentResearchExperienceComment" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "experienceId" INTEGER NOT NULL,
    "uploadedById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentResearchExperienceComment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "research_vault"."StudentResearchExperienceComment" ADD CONSTRAINT "StudentResearchExperienceComment_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "research_vault"."StudentResearchExperience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_vault"."StudentResearchExperienceComment" ADD CONSTRAINT "StudentResearchExperienceComment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
