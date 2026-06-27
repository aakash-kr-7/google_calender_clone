import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser, loginGoogle } from '../api/client'
import toast, { Toaster } from 'react-hot-toast'
import { Calendar, Lock, Mail, ChevronRight, HelpCircle, X, Check, Copy } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [showGoogleHelp, setShowGoogleHelp] = useState(false)
  const [copiedText, setCopiedText] = useState('')
  const navigate = useNavigate()

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
  const isGoogleConfigured = googleClientId && googleClientId !== 'your-google-client-id.apps.googleusercontent.com'

  useEffect(() => {
    // Inject custom animation styles into the document head
    const style = document.createElement('style')
    style.innerHTML = `
      @keyframes blob-float {
        0%, 100% { transform: translate(0px, 0px) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.95); }
      }
      @keyframes float-card {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }
      .animate-blob-1 { animation: blob-float 15s infinite ease-in-out; }
      .animate-blob-2 { animation: blob-float 20s infinite ease-in-out 2s; }
      .animate-float { animation: float-card 6s infinite ease-in-out; }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  useEffect(() => {
    // Initialize Google Identity Services if client ID is set
    if (isGoogleConfigured && window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleSuccess,
        })
        window.google.accounts.id.renderButton(
          document.getElementById('google-btn-container'),
          { 
            theme: 'outline', 
            size: 'large', 
            width: '100%', 
            text: 'continue_with',
            shape: 'rectangular'
          }
        )
      } catch (err) {
        console.error("Failed to initialize Google Sign-In:", err)
      }
    }
  }, [isGoogleConfigured])

  const handleGoogleSuccess = async (response) => {
    setLoading(true)
    try {
      const res = await loginGoogle({ credential: response.credential })
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('user', JSON.stringify({ email: email || 'google-user@gmail.com' }))
      toast.success('Successfully signed in with Google!')
      setTimeout(() => navigate('/'), 800)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Google sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await loginUser({ email, password })
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('user', JSON.stringify({ email }))
      toast.success('Welcome back!')
      setTimeout(() => navigate('/'), 800)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text)
    setCopiedText(type)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopiedText(''), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Dynamic Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-100/50 blur-[80px] animate-blob-1 -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-indigo-100/50 blur-[80px] animate-blob-2 -z-10" />

      {/* Main Glassmorphic Container */}
      <div className="bg-white rounded-3xl shadow-2xl flex max-w-4xl w-full overflow-hidden border border-slate-100 z-10 min-h-[600px]">
        
        {/* Left Section: Branding & Features */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-12 text-white flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_60%)]" />
          
          <div>
            <div className="flex items-center space-x-3 mb-8">
              <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md border border-white/20 shadow-md">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <span className="text-xl font-semibold tracking-wide font-sans">Calendar Clone</span>
            </div>
            
            <h2 className="text-3xl font-bold leading-tight mb-4">
              Organize your days. <br />Seamlessly.
            </h2>
            <p className="text-blue-100/90 text-sm leading-relaxed max-w-xs">
              A premium full-stack scheduler featuring smart drag-and-drop, recurrence parsing, and overlap clash notifications.
            </p>
          </div>

          {/* Interactive Mock Event Visual */}
          <div className="my-8 animate-float">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-lg space-y-3">
              <div className="text-[10px] uppercase tracking-wider text-blue-200 font-semibold">Today's Schedule</div>
              <div className="space-y-2">
                <div className="bg-white text-slate-800 rounded-xl p-3 text-xs font-medium shadow-sm flex items-center justify-between border-l-4 border-blue-500">
                  <div>
                    <div className="font-semibold">💡 UI Design Sync</div>
                    <div className="text-slate-400 text-[10px]">10:00 AM - 11:30 AM</div>
                  </div>
                  <span className="bg-blue-50 text-blue-600 text-[9px] px-2 py-0.5 rounded-full font-bold">Soon</span>
                </div>
                <div className="bg-white/5 text-white/90 rounded-xl p-3 text-xs font-medium flex items-center justify-between border-l-4 border-emerald-400">
                  <div>
                    <div className="font-semibold text-white">🍕 Team Lunch</div>
                    <div className="text-white/50 text-[10px]">1:00 PM - 2:00 PM</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-blue-200/60 flex items-center space-x-2">
            <span>Powered by FastAPI & React</span>
          </div>
        </div>

        {/* Right Section: Interactive Auth Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white relative">
          
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Sign in</h1>
            <p className="text-slate-500 text-sm mt-1.5">Welcome back! Please enter your details.</p>
          </div>

          {/* Google Sign In Integration */}
          <div className="mb-6">
            {isGoogleConfigured ? (
              <div id="google-btn-container" className="w-full min-h-[44px] flex justify-center" />
            ) : (
              <button
                type="button"
                onClick={() => setShowGoogleHelp(true)}
                className="w-full flex items-center justify-center bg-white border border-slate-200 text-slate-700 rounded-xl py-2.5 text-sm font-medium hover:bg-slate-50 transition duration-200 shadow-sm relative group"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.79 2.94C6.12 7.07 8.84 5.04 12 5.04z" />
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-1.99 3.43-4.91 3.43-8.6z" />
                  <path fill="#FBBC05" d="M5.18 14.9C4.94 14.21 4.8 13.47 4.8 12s.14-2.21.38-2.9L1.39 6.16C.5 7.93 0 9.91 0 12s.5 4.07 1.39 5.84l3.79-2.94z" />
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.35 1.1-3.96 1.1-3.16 0-5.88-2.03-6.82-5.06l-3.79 2.94C3.37 20.33 7.35 23 12 23z" />
                </svg>
                <span>Continue with Google</span>
                <HelpCircle className="w-4 h-4 ml-1.5 text-slate-400 group-hover:text-blue-500 transition duration-150" />
              </button>
            )}
          </div>

          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <span className="relative bg-white px-4 text-xs text-slate-400 font-medium uppercase tracking-wider">or sign in with email</span>
          </div>

          {/* Core Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition duration-150"
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition duration-150"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-medium hover:bg-blue-700 transition duration-200 flex items-center justify-center group shadow-md shadow-blue-200 disabled:opacity-60"
            >
              <span>{loading ? 'Signing in...' : 'Sign in'}</span>
              {!loading && <ChevronRight className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-8">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-medium">Create account</Link>
          </p>
        </div>
      </div>

      {/* Google Sign-In Setup Guide Modal */}
      {showGoogleHelp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <HelpCircle className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-slate-800">Google OAuth Setup Guide</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleHelp(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <p className="text-sm text-slate-600 leading-relaxed">
                Google Sign-In requires an active Client ID registered with your Google Cloud Console. Follow these steps to set it up:
              </p>

              <div className="space-y-3.5 text-xs text-slate-700">
                <div className="flex items-start">
                  <span className="bg-slate-100 text-slate-700 font-bold rounded-full w-5 h-5 flex items-center justify-center mr-2.5 shrink-0 mt-0.5">1</span>
                  <div>
                    <span className="font-semibold">Create a Google Cloud Project</span>
                    <p className="text-slate-500 mt-0.5">Go to the <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a> and create or select a project.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <span className="bg-slate-100 text-slate-700 font-bold rounded-full w-5 h-5 flex items-center justify-center mr-2.5 shrink-0 mt-0.5">2</span>
                  <div>
                    <span className="font-semibold">Configure OAuth Consent Screen</span>
                    <p className="text-slate-500 mt-0.5">Under APIs & Services &gt; OAuth consent screen, choose External, add your email contact, and save scopes.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <span className="bg-slate-100 text-slate-700 font-bold rounded-full w-5 h-5 flex items-center justify-center mr-2.5 shrink-0 mt-0.5">3</span>
                  <div>
                    <span className="font-semibold">Create Web Client Credentials</span>
                    <p className="text-slate-500 mt-0.5">Go to Credentials &gt; Create Credentials &gt; OAuth client ID. Select Web application. Add authorized origins:</p>
                    <div className="bg-slate-50 border border-slate-150 rounded-lg p-2 mt-2 font-mono flex items-center justify-between text-[11px]">
                      <span>http://localhost:5173</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('http://localhost:5173', 'origin')}
                        className="text-slate-400 hover:text-blue-500 transition"
                      >
                        {copiedText === 'origin' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <span className="bg-slate-100 text-slate-700 font-bold rounded-full w-5 h-5 flex items-center justify-center mr-2.5 shrink-0 mt-0.5">4</span>
                  <div>
                    <span className="font-semibold">Update Environment Variables (.env)</span>
                    <p className="text-slate-500 mt-0.5">Copy the Client ID and add it to your environment files:</p>
                    
                    <div className="mt-2.5 space-y-2">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">In frontend/.env</div>
                        <div className="bg-slate-50 border border-slate-150 rounded-lg p-2 font-mono flex items-center justify-between text-[11px] mt-1 truncate">
                          <span>VITE_GOOGLE_CLIENT_ID=585315707257-t0uifsfh6...</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('VITE_GOOGLE_CLIENT_ID=585315707257-t0uifsfh6dmb51vd6m0tuum7gbgvrh3r.apps.googleusercontent.com', 'fe_env')}
                            className="text-slate-400 hover:text-blue-500 transition ml-2"
                          >
                            {copiedText === 'fe_env' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">In backend/.env</div>
                        <div className="bg-slate-50 border border-slate-150 rounded-lg p-2 font-mono flex items-center justify-between text-[11px] mt-1 truncate">
                          <span>GOOGLE_CLIENT_ID=585315707257-t0uifsfh6...</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('GOOGLE_CLIENT_ID=585315707257-t0uifsfh6dmb51vd6m0tuum7gbgvrh3r.apps.googleusercontent.com', 'be_env')}
                            className="text-slate-400 hover:text-blue-500 transition ml-2"
                          >
                            {copiedText === 'be_env' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGoogleHelp(false)}
                className="bg-blue-600 text-white rounded-lg px-4 py-2 text-xs font-semibold hover:bg-blue-700 transition"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
