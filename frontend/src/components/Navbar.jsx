import { useRole } from '../context/role'

function Navbar() {
  const { user, logout } = useRole()

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="brand-name">MFA Houston</span>
      </div>

      <div className="navbar-right">
        <div className="user">
          <span className="avatar">
            {user.username.slice(0, 2).toUpperCase()}
          </span>

          <div className="user-info">
            <div className="user-name">{user.username}</div>
            <div className="user-role">{user.role}</div>
          </div>
        </div>

        <button className="btn secondary" onClick={logout}>
          Log out
        </button>
      </div>
    </header>
  )
}

export default Navbar