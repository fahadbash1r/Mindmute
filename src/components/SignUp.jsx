import { useState } from 'react'
import { supabase } from '../supabaseClient'
import darkLogo from '../assets/mindmute-dark.png'
import './Auth.css'

export default function SignUp() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)

  const handleSignUp = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }
    try {
      setLoading(true)
      setError(null)
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
      alert('Check your email for the confirmation link!')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
      })
      if (error) throw error
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFacebookSignUp = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook'
      })
      if (error) throw error
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <img src={darkLogo} alt="Mindmute" className="auth-logo" />
        <h1>Sign Up</h1>
        
        <form onSubmit={handleSignUp} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          
          <div className="input-group">
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Repeat Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Loading...' : 'Log in'}
          </button>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <div className="social-buttons">
            <button 
              type="button" 
              onClick={handleGoogleSignUp}
              className="social-button google"
            >
              <img src="/google-icon.svg" alt="Google" />
              <span>Google</span>
            </button>
            
            <button 
              type="button" 
              onClick={handleFacebookSignUp}
              className="social-button facebook"
            >
              <img src="/facebook-icon.svg" alt="Facebook" />
              <span>Facebook</span>
            </button>
          </div>
        </form>

        <div className="auth-footer">
          Already Have An Account? <a href="/login">Log in</a>
        </div>
      </div>
    </div>
  )
} 