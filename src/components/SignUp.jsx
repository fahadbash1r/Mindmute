import { useState } from 'react'
import { supabase } from '../supabaseClient'
import darkLogo from '../assets/mindmute-dark.png'
import './Auth.css'

export default function SignUp({ onLoginClick }) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
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
      const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            name: name
          }
        }
      })
      if (error) throw error
      alert(`Welcome ${name}! Please check your email for the confirmation link.`)
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
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
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
        provider: 'facebook',
        options: {
          queryParams: {
            display: 'popup',
            auth_type: 'rerequest',
          }
        }
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
      <div className="auth-left">
        <div className="auth-container">
          <img src={darkLogo} alt="Mindmute" className="auth-logo" />
          <h1>Sign Up</h1>
          
          <form onSubmit={handleSignUp} className="auth-form">
            {error && <div className="auth-error">{error}</div>}
            
            <div className="input-group">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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
              {loading ? 'Loading...' : 'Sign Up'}
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
            Already Have An Account? <button onClick={onLoginClick} className="auth-link">Log in</button>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-right-content">
          <h2>Overthinking? Let's turn it into clarity.</h2>
          <p>Ask a question. Get a summary, reframe, and action plan — instantly.</p>

          <div className="example-message">
            "Im overwhelmed with too many choices and feel stuck. Please Help"
          </div>

          <div className="response-grid">
            <div className="response-box">
              <h3>📌 Summary</h3>
              <p>You're overwhelmed with too many choices and feel stuck.</p>
            </div>

            <div className="response-box">
              <h3>🌀 Reframe</h3>
              <p>It's normal to feel stuck when too many options compete for your attention. It doesn't mean you're incapable — it means you care. You don't need the perfect option, just one good-enough starting point.</p>
            </div>

            <div className="response-box">
              <h3>✅ To-Do List</h3>
              <p>• Pick one small task<br/>• Start a 10-minute timer<br/>• Reflect after progress</p>
            </div>
          </div>

          <div className="testimonial">
            <img 
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=250&h=250&fit=crop&crop=faces&q=80" 
              alt="Sarah" 
            />
            <p>"Mindmute helped me make decisions when my brain was scrambled. I use it daily now."<br/>— Sarah, designer & overthinker 💬</p>
          </div>
        </div>
      </div>
    </div>
  )
} 