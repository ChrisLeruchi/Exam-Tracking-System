import prisma from './src/lib/prisma.js'
import fs from 'fs'

async function main() {
  const sql = fs.readFileSync('./prisma/add-triggers.sql', 'utf8')
  
  try {
    await prisma.$executeRawUnsafe(sql)
    console.log('✅ Triggers added successfully!')
    console.log('   - result_versions: UPDATE and DELETE blocked')
    console.log('   - audit_log: UPDATE and DELETE blocked')
  } catch (err) {
    console.error('❌ Failed to add triggers:', err.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
