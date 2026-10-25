import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'

function AlertBell({ alerts, onMarkAllRead }) {
  const [alertsOpen, setAlertsOpen] = useState(false)

  return (
    <div className="bell-wrap">
      <button
        type="button"
        className="bell-btn"
        onClick={() => setAlertsOpen(!alertsOpen)}
        aria-label="Alerts"
      >
        <Bell size={20} />

        {alerts.length > 0 && (
          <span className="bell-count">{alerts.length}</span>
        )}
      </button>

      {alertsOpen && (
        <div className="bell-menu">
          {alerts.length === 0 && (
            <div className="bell-empty">No new alerts</div>
          )}

          {alerts.length > 0 && (
            <button
              type="button"
              className="bell-read"
              onClick={() => {
                onMarkAllRead()
                setAlertsOpen(false)
              }}
            >
              Mark all as read
            </button>
          )}

          {alerts.map((alert, index) => (
            <Link
              key={index}
              to={alert.Path}
              className="bell-item"
              onClick={() => setAlertsOpen(false)}
            >
              {alert.Message}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default AlertBell
