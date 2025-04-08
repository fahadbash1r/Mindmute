import { useState } from 'react'
import { supabase } from '../supabaseClient'
import darkLogo from '../assets/mindmute-dark.png'
import './Auth.css'

export default function Login({ onSignUpClick }) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
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

  const handleFacebookLogin = async () => {
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
        <h1>Log in</h1>
        
        <form onSubmit={handleLogin} className="auth-form">
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

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Loading...' : 'Log in'}
          </button>

          <a href="#" className="forgot-password">Forgot password?</a>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <div className="social-buttons">
            <button 
              type="button" 
              onClick={handleGoogleLogin}
              className="social-button google"
            >
              <img src="/google-icon.svg" alt="Google" />
              <span>Google</span>
            </button>
            
            <button 
              type="button" 
              onClick={handleFacebookLogin}
              className="social-button facebook"
            >
              <img src="/facebook-icon.svg" alt="Facebook" />
              <span>Facebook</span>
            </button>
          </div>
        </form>

        <div className="auth-footer">
          Don't have an account? <button onClick={onSignUpClick} className="auth-link">Sign Up</button>
        </div>
      </div>
    </div>
  )
} 