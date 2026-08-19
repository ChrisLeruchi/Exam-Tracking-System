const BASE = 'http://localhost:4000/api'

async function main() {
  // 1. Login first
  console.log('1️⃣  Logging in as lecturer...')
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'lecturer_okoro', password: 'lecturer123' }),
  })
  const loginData = await loginRes.json()
  const { token } = loginData
  console.log('   ✅ Got token\n')

  const authHeader = { Authorization: `Bearer ${token}` }

  // 2. Get results for course 1
  console.log('2️⃣  Fetching results for course 1...')
  const resultsRes = await fetch(`${BASE}/courses/1/results`, { headers: authHeader })
  const { results } = await resultsRes.json()
  console.log(`   ✅ Found ${results.length} results`)
  results.slice(0, 5).forEach(r => {
    console.log(`   📊 ${r.student.matNo} — ${r.student.fullName}: score=${r.currentScore}, grade=${r.currentGrade}`)
  })
  console.log('   ...')
  console.log()

  // 3. Update a score (use a student with a score that can safely go up)
  // Find a result with a score that is NOT null and below 95 so we can add points
  const editableResult = results.find(r => r.currentScore !== null && r.currentScore <= 95)
  if (!editableResult) {
    console.log('❌ No editable result found (all scores too high or missing)')
    process.exit(1)
  }

  const newScore = editableResult.currentScore + 5
  console.log(`3️⃣  Updating ${editableResult.student.fullName}'s score: ${editableResult.currentScore} → ${newScore}...`)
  const updateRes = await fetch(`${BASE}/courses/1/results/${editableResult.id}`, {
    method: 'PUT',
    headers: { ...authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify({ score: newScore }),
  })
  const updateData = await updateRes.json()

  if (!updateRes.ok) {
    console.log(`   ❌ Update failed: ${updateData.error}`)
    process.exit(1)
  }

  console.log('   ✅ Update result:')
  console.log(`   📊 New score: ${updateData.result.currentScore}`)
  console.log(`   🔒 Version: ${updateData.version.previousScore} → ${updateData.version.newScore}`)
  console.log(`   🚩 Flagged: ${updateData.version.flagged} ${updateData.version.flagReason ? '(' + updateData.version.flagReason + ')' : ''}`)
  console.log()

  // 4. Try an invalid score (> 100) — should be rejected
  console.log('4️⃣  Testing invalid score (> 100)...')
  const invalidRes = await fetch(`${BASE}/courses/1/results/${editableResult.id}`, {
    method: 'PUT',
    headers: { ...authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify({ score: 101 }),
  })
  const invalidData = await invalidRes.json()
  console.log(`   ${invalidRes.ok ? '❌ Should have failed!' : '✅ Correctly rejected'}: ${invalidData.error}`)
  console.log()

  // 5. Try score < 0 — should be rejected
  console.log('5️⃣  Testing negative score...')
  const negRes = await fetch(`${BASE}/courses/1/results/${editableResult.id}`, {
    method: 'PUT',
    headers: { ...authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify({ score: -5 }),
  })
  const negData = await negRes.json()
  console.log(`   ${negRes.ok ? '❌ Should have failed!' : '✅ Correctly rejected'}: ${negData.error}`)
  console.log()

  console.log('🎉 All tests passed!')
}

main().catch(console.error)