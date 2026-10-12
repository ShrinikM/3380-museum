import { useEffect, useState } from 'react'
import Card from '../components/Card'
import { StatCard } from '../components/ui'
import {
  ArtistIcon,
  ArtworkIcon,
  CollectionIcon,
  ExhibitionIcon,
  TicketIcon,
  MemberIcon,
  GiftIcon,
  DonationIcon,
  StaffIcon,
} from '../components/Icons'
import { useRole } from '../context/role'

const modules = [
  {
    link: '/artists',
    title: 'Artists',
    Icon: ArtistIcon,
    count: '2,841',
    description: 'Artist profiles, life dates, and nationality records.',
  },
  {
    link: '/artworks',
    title: 'Artworks',
    Icon: ArtworkIcon,
    count: '67,432',
    description: 'Catalog entries with artist, type, year, and collection.',
  },
  {
    link: '/collections',
    title: 'Collections',
    Icon: CollectionIcon,
    count: '184',
    description: 'Thematic groupings of the permanent collection.',
  },
  {
    link: '/exhibitions',
    title: 'Exhibitions',
    Icon: ExhibitionIcon,
    count: '8 active',
    description: 'Exhibition schedule, capacity, staff, and artworks.',
  },
  {
    link: '/tickets',
    title: 'Tickets',
    Icon: TicketIcon,
    count: '12,847',
    description: 'Ticket sales by exhibition, type, and membership.',
  },
  {
    link: '/memberships',
    title: 'Memberships',
    Icon: MemberIcon,
    count: '4,291',
    description: 'Member records, membership periods, and discounts.',
  },
  {
    link: '/gift-shop',
    title: 'Gift Shop & Café',
    Icon: GiftIcon,
    count: '1,204 items',
    description: 'Retail inventory, café menu items, and sales records.',
  },
  {
    link: '/donations',
    title: 'Donations',
    Icon: DonationIcon,
    count: '$4.2M YTD',
    description: 'Donor gifts, amounts, and payment methods.',
  },
  {
    link: '/staff',
    title: 'Staff',
    Icon: StaffIcon,
    count: '312',
    description: 'Staff directory, roles, departments, and contacts.',
  },
]

const STORAGE_KEY = 'museumRecentActivity'

export function addActivity(action, detail) {
  const existing = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || '[]'
  )

  const next = [
    {
      id: `${Date.now()}-${Math.random()}`,
      action,
      detail,
      timestamp: Date.now(),
    },
    ...existing,
  ].slice(0, 30)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event('museum-activity-updated'))
}

function formatActivityTime(item) {
  if (!item.timestamp) return ''

  const elapsed = Date.now() - item.timestamp

  if (elapsed < 60_000) return 'Just now'

  if (elapsed < 3_600_000) {
    return `${Math.floor(elapsed / 60_000)} min ago`
  }

  if (elapsed < 86_400_000) {
    return new Date(item.timestamp).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return new Date(item.timestamp).toLocaleDateString()
}

function Dashboard() {
  const { canView } = useRole()
  const visibleModules = modules.filter((m) => canView(m.link))

  const [activity, setActivity] = useState(() =>
    JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  )

  useEffect(() => {
    const updateActivity = () => {
      setActivity(
        JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      )
    }

    window.addEventListener('museum-activity-updated', updateActivity)
    window.addEventListener('storage', updateActivity)

    return () => {
      window.removeEventListener(
        'museum-activity-updated',
        updateActivity
      )
      window.removeEventListener('storage', updateActivity)
    }
  }, [])

  return (
    <div className="page">
      <div className="dashboard-header">
        <h1>Museum Database</h1>
        <p>
          Welcome to the Museum of Fine Arts, Houston database.
        </p>
      </div>

      <div className="grid-4 section-gap">
        <StatCard
          label="Total Artworks"
          value="67,432"
          delta="↑ 142"
          deltaLabel="this quarter"
        />
        <StatCard
          label="Active Exhibitions"
          value="8"
          delta="↑ 2"
          deltaLabel="since last month"
        />
        <StatCard
          label="Tickets Sold"
          value="12,847"
          delta="↑ 1,204"
          deltaLabel="this month"
        />
        <StatCard
          label="Active Memberships"
          value="4,291"
          delta="↑ 87"
          deltaLabel="this month"
        />
      </div>

      <div className="dashboard-body">
        <section>
          <div className="section-label">Database Modules</div>
          <div className="module-grid">
            {visibleModules.map((m) => (
              <Card key={m.title} {...m} />
            ))}
          </div>
        </section>

        <aside>
          <div className="section-label">Recent Activity</div>

          <div className="card">
            {activity.length === 0 ? (
              <div className="empty">
                No recent activity yet.
              </div>
            ) : (
              activity.slice(0, 5).map((item) => (
                <div className="activity-item" key={item.id}>
                  <span className="activity-dot" />

                  <div className="activity-text">
                    <div className="activity-row">
                      <span className="activity-title">
                        {item.action}
                      </span>
                      <span className="activity-time">
                        {formatActivityTime(item)}
                      </span>
                    </div>

                    <div className="activity-detail">
                      {item.detail}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Dashboard