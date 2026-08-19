import prisma from './src/lib/prisma.js'

async function check() {
  const cols = await prisma.$queryRaw`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    ORDER BY ordinal_position
  `
  console.log('users table columns:')
  cols.forEach(c => console.log(`  - ${c.column_name}: ${c.data_type}`))
  await prisma.$disconnect()
}

check()