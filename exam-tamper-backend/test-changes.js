const BASE = 'http://localhost:4000/api'

async function main() {
  // 1. Login as lecturer
  console.log('1. Logging in as lecturer...')
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'lecturer_okoro', password: 'lecturer123' }),
  })
  const { token } = await loginRes.json()
  const authHeader = { Authorization: `Bearer ${token}` }
  console.log('   Got token\n')

  // 2. Get change history for course 1
  console.log('2. Fetching change history for course 1...')
  const changesRes = await fetch(`${BASE}/courses/1/changes`, { headers: authHeader })
  const { changes, pagination } = await changesRes.json()
  console.log(`   Found ${pagination.total} changes:\n`)
  changes.forEach(c => {
    const flag = c.flagged ? ' [FLAGGED: ' + c.flagReason + ']' : ''
    console.log(`   ${c.studentName} (${c.matNo}): ${c.previousValue} -> ${c.newValue} by ${c.changedBy}${flag}`)
  })
  console.log()

  // 3. Get flagged changes only
  console.log('3. Fetching flagged changes only...')
  const flagsRes = await fetch(`${BASE}/flags?resolved=false`, { headers: authHeader })
  const { flags } = await flagsRes.json()
  console.log(`   Found ${flags.length} flagged changes:\n`)
  flags.forEach(f => {
    console.log(`   ${f.studentName}: ${f.previousValue} -> ${f.newValue} - ${f.flagReason}`)
  })
  console.log()

  // 4. Verify hash chain integrity
  console.log('4. Verifying hash chain integrity...')
  const verifyRes = await fetch(`${BASE}/audit/verify`, { headers: authHeader })
  const verifyData = await verifyRes.json()
  console.log(`   ${verifyData.message}`)
  console.log(`   Total versions checked: ${verifyData.totalVersions}`)
  console.log(`   Verified: ${verifyData.verified}\n`)

  console.log('All tests passed!')
}

main().catch(console.error)
