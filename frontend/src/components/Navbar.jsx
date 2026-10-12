import { useEffect, useState } from 'react'
import { BellIcon } from './Icons'
import { useRole } from '../context/role'

const NOTIFICATIONS_KEY = 'museumNotifications'

function Navbar() {
  const { user, logout } = useRole()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(() => {
    return JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]')
  })

  useEffect(() => {
    const updateNotifications = () => {
      setNotifications(
        JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]')
      )
    }

    window.addEventListener('museum-notifications-updated', updateNotifications)
    window.addEventListener('storage', updateNotifications)

    return () => {
      window.removeEventListener('museum-notifications-updated', updateNotifications)
      window.removeEventListener('storage', updateNotifications)
    }
  }, [])

  const unreadCount = notifications.filter((item) => !item.read).length

  function addNotification(action, detail) {
    const next = [
      {
        id: `${Date.now()}-${Math.random()}`,
        action,
        detail,
        time: new Date().toLocaleString(),
        read: false,
      },
      ...notifications,
    ].slice(0, 30)

    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(next))
    setNotifications(next)
    window.dispatchEvent(new Event('museum-notifications-updated'))
  }

  function markAllRead() {
    const next = notifications.map((item) => ({ ...item, read: true }))
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(next))
    setNotifications(next)
    window.dispatchEvent(new Event('museum-notifications-updated'))
  }

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="brand-mark">M</span>
        <span className="brand-name">MFA Houston</span>
        <span className="brand-sub">Museum Database</span>
      </div>

      <div className="navbar-right">
        <div className="notification-wrapper">
          <button
            className="icon-btn"
            type="button"
            aria-label="Notifications"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <BellIcon size={15} />
            {unreadCount > 0 && <span className="notif-dot" />}
          </button>

          {open && (
            <div className="notification-panel">
              <div className="notification-header">
                <strong>Notifications</strong>
                <button
                  className="notification-read"
                  type="button"
                  onClick={markAllRead}
                  disabled={unreadCount === 0}
                >
                  Mark all as read
                </button>
              </div>

              {notifications.length === 0 ? (
                <div className="notification-empty">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    className={`notification-item ${item.read ? 'read' : 'unread'}`}
                    key={item.id}
                  >
                    <div className="notification-title">{item.action}</div>
                    <div className="notification-detail">{item.detail}</div>
                    <div className="notification-time">{item.time}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

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