const base = 'http://127.0.0.1:4000/api'

try {
  const loginRes = await fetch(base + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'lecturer_okoro', password: 'lecturer123' }),
  })
  const login = await loginRes.json()
  console.log('login', loginRes.status, login.user)
  const token = login.token

  const coursesRes = await fetch(base + '/courses', { headers: { Authorization: 'Bearer ' + token } })
  console.log('courses status', coursesRes.status)
  const courses = await coursesRes.json()
  console.log('courses sample', courses.courses.length ? courses.courses[0] : null)
  const cid = courses.courses[0].id

  const resultsRes = await fetch(base + '/courses/' + cid + '/results', { headers: { Authorization: 'Bearer ' + token } })
  const results = await resultsRes.json()
  console.log('results status', resultsRes.status, results.results.length)
  const rid = results.results[0].id
  const old = results.results[0].currentScore || 0
  const newScore = (old + 1) % 100

  const upd = await fetch(base + '/courses/' + cid + '/results/' + rid, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ score: newScore }),
  })
  console.log('update status', upd.status, await upd.text())

  const changes = await fetch(base + '/courses/' + cid + '/changes?flagged=true', { headers: { Authorization: 'Bearer ' + token } })
  console.log('changes status', changes.status, await changes.text())
} catch (e) {
  console.error('test error', e)
}
