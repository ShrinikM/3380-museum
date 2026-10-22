import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRole } from '../context/role'

const HAND = `${import.meta.env.BASE_URL}images/coog-hand.png`

function Login() {
  const { login } = useRole()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    const success = login(username, password)

    if(!success){
      setError('Wrong username or password.')
    }
  }

  return (
    <div className="login-page">
      <div className="card login-card">
        <div className="login-brand">
          <h1 className="page-title">CoogMuseum</h1>
          <img src={HAND} alt="" className="login-hand" />
        </div>

        <form onSubmit={handleSubmit} className="login-form">

          <div className="form-group">
            <label>Username</label>
            <input
              value={username}
              onChange={(e)=> setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e)=> setPassword(e.target.value)}
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
  )
}

export default Login