import {PrismaClient} from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'

dotenv.config()

let prisma
let prismaConnected = false

// Try the PrismaPg adapter first (used for prisma+postgres setups).
// If it fails (connection closed or adapter issues), fall back to the default PrismaClient
try {
	const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL })
	prisma = new PrismaClient({ adapter })
	// Test connection; top-level await is supported in Node.js ESM
	await prisma.$connect()
	prismaConnected = true
	console.log('Prisma: connected using PrismaPg adapter')
} catch (err) {
	console.error('Prisma: adapter connection failed, falling back to default PrismaClient:', err && err.message ? err.message : err)
	prisma = new PrismaClient()
	try {
		await prisma.$connect()
		prismaConnected = true
		console.log('Prisma: connected using default PrismaClient')
	} catch (err2) {
		console.error('Prisma: fallback PrismaClient failed to connect:', err2 && err2.message ? err2.message : err2)
		// leave prismaConnected false; set up a periodic reconnect attempt below
	}
}

// Periodic reconnect: if not connected, attempt to reconnect every 5 seconds.
// This helps recover if Postgres starts after the app.
const RECONNECT_INTERVAL_MS = 5000
if (!prismaConnected) {
	setInterval(async () => {
		try {
			if (!prisma || typeof prisma.$connect !== 'function') {
				// reinitialize Prisma client
				try {
					const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL })
					prisma = new PrismaClient({ adapter })
				} catch (e) {
					prisma = new PrismaClient()
				}
			}
			await prisma.$connect()
			prismaConnected = true
			console.log('Prisma: reconnected')
		} catch (e) {
			if (prismaConnected) {
				prismaConnected = false
			}
			console.debug('Prisma: reconnect attempt failed:', e && e.message ? e.message : e)
		}
	}, RECONNECT_INTERVAL_MS)
}

export const isPrismaConnected = () => prismaConnected

export default prisma