import { PrismaClient } from '../generated/prisma/client.ts'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // --- 1. Create users ---
  // We hash passwords with bcrypt (never store plain text!)
  const adminPassword = await bcrypt.hash('admin123', 12)
  const lecturerPassword = await bcrypt.hash('lecturer123', 12)

  const admin = await prisma.user.create({
    data: {
      username: 'admin_johnson',
      passwordHash: adminPassword,
      role: 'ADMIN',
      fullName: 'Admin Johnson',
    },
  })

  const lecturer = await prisma.user.create({
    data: {
      username: 'lecturer_okoro',
      passwordHash: lecturerPassword,
      role: 'LECTURER',
      fullName: 'Dr. Okoro',
    },
  })

  console.log('✅ Created 2 users')

  // --- 2. Create a course ---
  const course = await prisma.course.create({
    data: {
      code: 'CEN 552',
      title: 'Digital System Design with VHDL',
      lecturerId: lecturer.id,
      semester: 'Second',
      academicSession: '2025/2026',
    },
  })

  console.log('✅ Created course: CEN 552')

  // --- 3. Create students ---
  const students = await Promise.all(
    [
      { matNo: 'De.2021/6166', fullName: 'Onyeukwu Jonathan' },
      { matNo: 'De.2021/6204', fullName: 'Neitu Mene Joshua' },
      { matNo: 'De.2021/5940', fullName: 'Okam Richard Ukaha' },
      { matNo: 'De.2021/0639', fullName: 'Amanda David' },
      { matNo: 'De.2021/6199', fullName: 'Victor Jack Daereaa' },
    ].map((s) =>
      prisma.student.create({
        data: {
          matNo: s.matNo,
          fullName: s.fullName,
        },
      })
    )
  )

  console.log(`✅ Created ${students.length} students`)

  // --- 4. Enroll students in the course ---
  await Promise.all(
    students.map((student) =>
      prisma.enrollment.create({
        data: {
          studentId: student.id,
          courseId: course.id,
        },
      })
    )
  )

  console.log('✅ Enrolled students in CEN 552')

  // --- 5. Create results (initial scores) ---
  const scores = [89, 64, 49, 78, 65]

  const results = await Promise.all(
    students.map((student, index) => {
      const score = scores[index]
      const grade =
        score >= 70 ? 'A' : score >= 60 ? 'B' : score >= 50 ? 'C' : score >= 45 ? 'D' : 'F'

      return prisma.result.create({
        data: {
          studentId: student.id,
          courseId: course.id,
          currentScore: score,
          currentGrade: grade,
          createdBy: lecturer.id,
        },
      })
    })
  )

  console.log(`✅ Created ${results.length} results`)

  console.log('\n🎉 Seed complete!')
  console.log('\n📋 Login credentials:')
  console.log('   Admin:     admin_johnson / admin123')
  console.log('   Lecturer:  lecturer_okoro / lecturer123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
