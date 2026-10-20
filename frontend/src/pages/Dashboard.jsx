
import { useState, useEffect } from 'react'
import Card from '../components/Card'
import { StatCard } from '../components/ui'
import { callApi } from '../api'
import { useRole } from '../context/role'

const compactMoney = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})

function Dashboard() {
  const { canView } = useRole()

  const [stats, setStats] = useState(null)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await callApi('/api/dashboard', 'GET')
        setStats(data)
        setLoadError('')
      } catch (err) {
        setLoadError('Could not load dashboard: ' + err.message)
      }
    }

    loadStats()
  }, [])

  const show = (key, format) => {
    if (stats === null) return '-'
    return format ? format(stats[key]) : stats[key].toLocaleString()
  }

  const modules = [
    {
      link: '/artists',
      title: 'Artists',
      count: show('Artists'),
    },
    {
      link: '/artworks',
      title: 'Artworks',
      count: show('Artworks'),
    },
    {
      link: '/collections',
      title: 'Collections',
      count: show('Collections'),
    },
    {
      link: '/exhibitions',
      title: 'Exhibitions',
      count: show('ActiveExhibitions', (n) => n.toLocaleString() + ' active'),
    },
    {
      link: '/tickets',
      title: 'Tickets',
      count: show('Tickets'),
    },
    {
      link: '/memberships',
      title: 'Memberships',
      count: show('Memberships'),
    },
    {
      link: '/gift-shop',
      title: 'Gift Shop & Café',
      count:
        stats === null
          ? '-'
          : (stats.GiftShopItems + stats.CafeItems).toLocaleString() +
            ' items',
    },
    {
      link: '/donations',
      title: 'Donations',
      count: show('DonationsYearToDate', (n) => compactMoney.format(n) + ' YTD'),
    },
    {
      link: '/staff',
      title: 'Staff',
      count: show('Staff'),
    },
  ]

  const visibleModules = modules.filter((module) => canView(module.link))

  return (
    <div className="page">
      <div className="dashboard-header">
        <h1>Museum of Fine Arts, Houston</h1>
      </div>

      {loadError && (
        <p className="empty" role="alert">
          {loadError}
        </p>
      )}

      <div className="grid-4 section-gap">
        <StatCard
          label="Total Artworks"
          value={show('Artworks')}
          delta={stats && '↑ ' + stats.ArtworksThisQuarter.toLocaleString()}
          deltaLabel="added this quarter"
        />
        <StatCard
          label="Active Exhibitions"
          value={show('ActiveExhibitions')}
          delta={stats && '↑ ' + stats.ExhibitionsOpenedThisMonth.toLocaleString()}
          deltaLabel="opened this month"
        />
        <StatCard
          label="Tickets Sold"
          value={show('Tickets')}
          delta={stats && '↑ ' + stats.TicketsThisMonth.toLocaleString()}
          deltaLabel="this month"
        />
        <StatCard
          label="Active Memberships"
          value={show('ActiveMemberships')}
          delta={stats && '↑ ' + stats.MembershipsThisMonth.toLocaleString()}
          deltaLabel="started this month"
        />
      </div>

      <section aria-labelledby="database-modules-heading">
        <div className="section-label" id="database-modules-heading">
          Modules
        </div>

        <div className="module-grid">
          {visibleModules.map((module) => (
            <Card key={module.title} {...module} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default Dashboard
