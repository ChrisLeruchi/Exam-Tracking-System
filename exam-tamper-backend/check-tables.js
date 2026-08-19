
import prisma from './src/lib/prisma.js'

async function main() {
  const tables = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  `
  console.log('📋 Tables in your database:')
  tables.forEach(t => console.log('  -', t.tablename))
  await prisma.$disconnect()
}

main().catch(e => {
  console.error('❌ Error:', e.message)
  process.exit(1)
})

