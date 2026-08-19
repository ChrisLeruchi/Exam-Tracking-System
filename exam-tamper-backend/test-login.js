async function testLogin() {
  const response = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'lecturer_okoro',
      password: 'lecturer123',
    }),
  })

  const data = await response.json()

  if (response.ok) {
    console.log('✅ Login successful!\n')
    console.log('Token:', data.token)
    console.log('\nUser:', JSON.stringify(data.user, null, 2))
  } else {
    console.log('❌ Login failed:', data.error)
  }
}

testLogin().catch(console.error)
