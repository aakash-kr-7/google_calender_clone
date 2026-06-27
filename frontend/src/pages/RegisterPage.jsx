import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../api/client'

export default function RegisterPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 6)  { setError('Password must be at least 6 characters'); return }
    setLoading(true); setError('')
    try {
      const res = await registerUser({ email, password })
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('user', JSON.stringify({ email }))
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gcal-bg flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-md p-10 w-full max-w-sm">
        <h1 className="text-2xl font-normal text-gcal-text mb-1">Create account</h1>
        <p className="text-gcal-light text-sm mb-8">to continue to Calendar</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full border border-gcal-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gcal-blue" />
          <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="w-full border border-gcal-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gcal-blue" />
          <input type="password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required
            className="w-full border border-gcal-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gcal-blue" />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-gcal-blue text-white rounded-full py-2.5 text-sm font-medium hover:bg-gcal-blue-hover transition-colors disabled:opacity-60">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-gcal-light mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-gcal-blue hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
