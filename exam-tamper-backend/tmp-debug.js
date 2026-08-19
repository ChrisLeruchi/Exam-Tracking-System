import prisma from './src/lib/prisma.js'
import dotenv from 'dotenv'

dotenv.config()
console.log('DIRECT_URL=', process.env.DIRECT_URL)
console.log('DATABASE_URL=', process.env.DATABASE_URL)
try {
  const user = await prisma.user.findUnique({ where: { username: 'lecturer_okoro' } })
  console.log('user=', user)
} catch (e) {
  console.error('db error=', e)
}
await prisma.$disconnect()
