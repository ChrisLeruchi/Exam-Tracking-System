import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export function EntryPoint() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await login(username, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className='flex flex-col justify-center items-center w-full min-h-screen px-4'>
      <div className='flex flex-col w-full max-w-[400px] gap-4 bg-surface-card py-12 rounded-lg'>
        <div className='flex flex-col gap-2 px-6 items-center'>
          <span className='flex justify-center items-center bg-accent-50 p-1 w-[10%] rounded-sm'>
            <ShieldCheck className='text-accent-200' />
          </span>
          <div className='flex flex-col leading-tight'>
            <h2 className='text-xl font-sans tracking-tight font-medium text-center'>Result tamper tracking system</h2>
            <span className='text-center text-text-muted tracking-tight'>Sign in to continue</span>
          </div>
        </div>

        <div className='px-10'>
          <form onSubmit={handleSubmit} className='flex flex-col gap-2'>
            <div className='flex flex-col'>
              <label className='tracking-tight font-sans text-md text-text-muted'>Username</label>
              <input
                type='text'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className='bg-surface-muted p-1 rounded-sm font-sans text-md border-1 outline-0 border-border tracking-tight'
                placeholder='e.g. lecturer_okoro'
              />
            </div>

            <div className='flex flex-col'>
              <label className='tracking-tight font-sans text-md text-text-muted'>Password</label>
              <input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='bg-surface-muted p-1 rounded-sm font-sans text-md border-1 outline-0 border-border tracking-tight'
                placeholder='Enter your password'
              />
            </div>

            {error && (
              <p className='text-danger-400 text-sm mt-1'>{error}</p>
            )}

            <div>
              <button
                type='submit'
                disabled={loading}
                className='text-center w-full p-1 rounded-sm bg-accent-200 font-sans tracking-tight mt-2 text-white transition-colors duration-200 hover:bg-accent-50 cursor-pointer disabled:opacity-50'
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>

        <span className='text-xs text-center text-text-muted leading-tight font-display px-6'>
          Access is restricted to registered administrators, lecturers, and examination officers
        </span>

        <div className='text-xs text-center text-text-muted px-6'>
          <p className='mt-2'>Test accounts:</p>
          <p>lecturer_okoro / lecturer123</p>
          <p>admin_johnson / admin123</p>
        </div>
      </div>
    </section>
  )
}
