import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRole } from '../context/role'

const HAND = '/images/coog-hand.png'
const HERO_IMAGE = '/images/rumskib.jpeg' 

function Login() {
  const { login, loginCustomer, registerCustomer } = useRole()
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (mode === 'register') {
      setBusy(true)

      try {
        await registerCustomer({
          FirstName: firstName,
          LastName: lastName,
          Email: email,
          Phone: phone,
          Password: password,
        })
      } catch (err) {
        setError(err.message)
        setBusy(false)
      }

      return
    }

    const email = username.trim().toLowerCase()

    if (login(email, password)) {
      return
    }

    setBusy(true)

    try {
      await loginCustomer(email, password)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div 
      className="login-page" 
      style={{ 
        position: 'relative',
        minHeight: '100vh', 
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: '20px'
      }}
    >
      <img 
        src={HERO_IMAGE} 
        alt="Terrace Background" 
        style={{ 
          position: 'absolute',
          inset: 0,
          width: '100%', 
          height: '100%', 
          objectFit: 'cover',
          filter: 'blur(6px) scale(1.05)', 
        }} 
      />

      <div 
        style={{ 
          position: 'absolute', 
          inset: 0, 
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          zIndex: 1
        }} 
      />

      <div 
        className="login-card-wrapper"
        style={{ 
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '400px'
        }}
      >
        <div 
          className="card login-card" 
          style={{ 
            boxShadow: '0 20px 30px rgba(0, 0, 0, 0.3)' 
          }}
        >
          <div className="login-brand">
            <h1 className="page-title">CoogMuseum</h1>
            <img src={HAND} alt="" className="login-hand" />
          </div>

          <form onSubmit={handleSubmit} className="login-form">

            {mode === 'login' && (
              <div className="form-group">
                <label htmlFor="login-username">Email</label>
                <input
                  id="login-username"
                  type="email"
                  autoComplete="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            )}

            {mode === 'register' && (
              <>
                <div className="form-group">
                  <label htmlFor="register-first">First name</label>
                  <input
                    id="register-first"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="register-last">Last name</label>
                  <input
                    id="register-last"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="register-email">Email</label>
                  <input
                    id="register-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="register-phone">Phone</label>
                  <input
                    id="register-phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                minLength={mode === 'register' ? 8 : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="btn primary" disabled={busy}>
              {mode === 'login' ? 'Log In' : 'Create Account'}
            </button>

            <button type="button" className="btn secondary" onClick={switchMode}>
              {mode === 'login' ? 'Create a customer account' : 'I already have an account'}
            </button>

            <Link to="/" className="btn secondary">
              Back to Home
            </Link>

          </form>
        </div>
      </div>
    </div>
  )
}

export default Login