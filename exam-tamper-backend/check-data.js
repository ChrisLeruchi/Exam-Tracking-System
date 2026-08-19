import prisma from './src/lib/prisma.js'

async function main() {
  const users = await prisma.user.findMany()
  const students = await prisma.student.findMany()
  const results = await prisma.result.findMany()

  console.log(`\n👤 Users (${users.length}):`)
  users.forEach(u => console.log(`   ${u.username} — ${u.role}`))

  console.log(`\n🎓 Students (${students.length}):`)
  students.forEach(s => console.log(`   ${s.matNo} — ${s.fullName}`))

  console.log(`\n📊 Results (${results.length}):`)
  results.forEach(r => console.log(`   Score: ${r.currentScore} — Grade: ${r.currentGrade} — Published: ${r.isPublished}`))

  await prisma.$disconnect()
}

main().catch(e => {
  console.error('❌ Error:', e.message)
  process.exit(1)
})
