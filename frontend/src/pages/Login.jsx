import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRole } from '../context/role'

const HAND = '/images/coog-hand.png'
const HERO_IMAGE = '/images/rumskib.jpeg' 

function Login() {
  const { login } = useRole()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    const success = login(username.trim(), password)

    if (!success) {
      setError('Wrong username or password.')
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

            <div className="form-group">
              <label htmlFor="login-username">Username</label>
              <input
                id="login-username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="btn primary">
              Log In
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