/**
 * Database Initialization & Migration Script
 * 
 * This script:
 * 1. Creates the Role enum type
 * 2. Creates all tables if they don't exist
 * 3. Creates indexes and constraints
 * 4. Sets up default data
 * 
 * Usage: node run-migration.js
 */
import prisma from './src/lib/prisma.js'

async function runMigration() {
  console.log('Starting database initialization...\n')

  try {
    // 1. Create Role enum type
    console.log('1. Creating Role enum type...')
    await prisma.$executeRaw`DO $$ BEGIN
      CREATE TYPE "Role" AS ENUM ('ADMIN', 'LECTURER', 'EXAM_OFFICER');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$`
    console.log('   ✓ Role enum created\n')

    // 2. Create users table
    console.log('2. Creating users table...')
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "username" TEXT NOT NULL UNIQUE,
        "passwordHash" TEXT NOT NULL,
        "role" "Role" NOT NULL DEFAULT 'LECTURER',
        "fullName" TEXT NOT NULL,
        "email" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "lastLogin" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('   ✓ users table created\n')

    // 3. Create courses table
    console.log('3. Creating courses table...')
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "courses" (
        "id" SERIAL PRIMARY KEY,
        "code" TEXT NOT NULL UNIQUE,
        "title" TEXT NOT NULL,
        "lecturerId" INTEGER NOT NULL,
        "semester" TEXT NOT NULL DEFAULT 'First',
        "academicSession" TEXT NOT NULL DEFAULT '2025/2026',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "courses_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "users"("id") ON DELETE RESTRICT
      )
    `
    console.log('   ✓ courses table created\n')

    // 4. Create students table
    console.log('4. Creating students table...')
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "students" (
        "id" SERIAL PRIMARY KEY,
        "matNo" TEXT NOT NULL UNIQUE,
        "fullName" TEXT NOT NULL,
        "department" TEXT NOT NULL DEFAULT 'Computer Engineering',
        "level" TEXT NOT NULL DEFAULT '500',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('   ✓ students table created\n')

    // 5. Create enrollments table
    console.log('5. Creating enrollments table...')
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "enrollments" (
        "id" SERIAL PRIMARY KEY,
        "studentId" INTEGER NOT NULL,
        "courseId" INTEGER NOT NULL,
        CONSTRAINT "enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE,
        CONSTRAINT "enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE,
        CONSTRAINT "enrollments_studentId_courseId_key" UNIQUE ("studentId", "courseId")
      )
    `
    console.log('   ✓ enrollments table created\n')

    // 6. Create results table
    console.log('6. Creating results table...')
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "results" (
        "id" SERIAL PRIMARY KEY,
        "studentId" INTEGER NOT NULL,
        "courseId" INTEGER NOT NULL,
        "currentScore" INTEGER,
        "currentGrade" TEXT,
        "isPublished" BOOLEAN NOT NULL DEFAULT false,
        "createdBy" INTEGER NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "results_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE,
        CONSTRAINT "results_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE,
        CONSTRAINT "results_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT,
        CONSTRAINT "results_studentId_courseId_key" UNIQUE ("studentId", "courseId")
      )
    `
    console.log('   ✓ results table created\n')

    // 7. Create result_versions table
    console.log('7. Creating result_versions table...')
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "result_versions" (
        "id" SERIAL PRIMARY KEY,
        "resultId" INTEGER NOT NULL,
        "score" INTEGER,
        "grade" TEXT,
        "previousScore" INTEGER,
        "previousGrade" TEXT,
        "changedBy" INTEGER NOT NULL,
        "changedByRole" "Role" NOT NULL,
        "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "reason" TEXT NOT NULL DEFAULT 'correction',
        "previousHash" TEXT,
        "currentHash" TEXT NOT NULL,
        "flagged" BOOLEAN NOT NULL DEFAULT false,
        "flagReason" TEXT,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        CONSTRAINT "result_versions_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "results"("id") ON DELETE CASCADE,
        CONSTRAINT "result_versions_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "users"("id") ON DELETE RESTRICT
      )
    `
    console.log('   ✓ result_versions table created\n')

    // 8. Create flag_resolutions table
    console.log('8. Creating flag_resolutions table...')
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "flag_resolutions" (
        "id" SERIAL PRIMARY KEY,
        "versionId" INTEGER NOT NULL,
        "resolvedBy" INTEGER NOT NULL,
        "resolution" TEXT NOT NULL,
        "resolvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "flag_resolutions_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "result_versions"("id") ON DELETE CASCADE,
        CONSTRAINT "flag_resolutions_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "users"("id") ON DELETE RESTRICT
      )
    `
    console.log('   ✓ flag_resolutions table created\n')

    // 9. Create publications table
    console.log('9. Creating publications table...')
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "publications" (
        "id" SERIAL PRIMARY KEY,
        "courseId" INTEGER NOT NULL,
        "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "publishedBy" INTEGER NOT NULL,
        CONSTRAINT "publications_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE,
        CONSTRAINT "publications_publishedBy_fkey" FOREIGN KEY ("publishedBy") REFERENCES "users"("id") ON DELETE RESTRICT
      )
    `
    console.log('   ✓ publications table created\n')

    // 10. Create audit_log table
    console.log('10. Creating audit_log table...')
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "audit_log" (
        "id" SERIAL PRIMARY KEY,
        "entityType" TEXT NOT NULL,
        "entityId" INTEGER NOT NULL,
        "action" TEXT NOT NULL,
        "oldValue" JSONB,
        "newValue" JSONB,
        "userId" INTEGER NOT NULL,
        "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "previousHash" TEXT,
        "currentHash" TEXT NOT NULL,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        CONSTRAINT "audit_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT
      )
    `
    console.log('   ✓ audit_log table created\n')

    // 11. Create indexes
    console.log('11. Creating indexes...')
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "result_versions_resultId_idx" ON "result_versions"("resultId")`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "result_versions_changedBy_idx" ON "result_versions"("changedBy")`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "flag_resolutions_versionId_idx" ON "flag_resolutions"("versionId")`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "audit_log_entityType_entityId_idx" ON "audit_log"("entityType", "entityId")`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "audit_log_userId_idx" ON "audit_log"("userId")`
    console.log('   ✓ Indexes created\n')

    // 12. Verification
    console.log('12. Verifying database setup...')
    const tables = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `
    console.log('   Tables created:')
    tables.forEach(t => console.log(`     - ${t.table_name}`))

    console.log('\n✅ Database initialization completed successfully!')
    console.log('\nNext steps:')
    console.log('  1. Run: node prisma/seed.js (to create initial users and data)')
    console.log('  2. Run: node prisma/seed-students.js (to create students)')
    console.log('  3. Start the backend: npm run dev')
    console.log('  4. Start the frontend: cd ../exam-tamper-frontend && npm run dev')
    
  } catch (err) {
    console.error('\n❌ Migration failed:', err)
    console.error('\nFull error:', err.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

runMigration()