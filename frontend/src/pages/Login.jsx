import { useState } from 'react'
import { useRole } from '../context/role'

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
        <h1 className="page-title">MFA Houston</h1>
        <p className="page-subtitle">Sign in to the Museum Database.</p>

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
            Log in
          </button>

        </form>
      </div>
    </div>
  )
}

export default Login
