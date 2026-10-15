
import Card from '../components/Card'
import { StatCard } from '../components/ui'
import { useRole } from '../context/role'

const modules = [
  {
    link: '/artists',
    title: 'Artists',
    count: '2,841',
  },
  {
    link: '/artworks',
    title: 'Artworks',
    count: '67,432',
  },
  {
    link: '/collections',
    title: 'Collections',
    count: '184',
  },
  {
    link: '/exhibitions',
    title: 'Exhibitions',
    count: '8 active',
  },
  {
    link: '/tickets',
    title: 'Tickets',
    count: '12,847',
  },
  {
    link: '/memberships',
    title: 'Memberships',
    count: '4,291',
  },
  {
    link: '/gift-shop',
    title: 'Gift Shop & Café',
    count: '1,204 items',
  },
  {
    link: '/donations',
    title: 'Donations',
    count: '$4.2M YTD',
  },
  {
    link: '/staff',
    title: 'Staff',
    count: '312',
  },
]

function Dashboard() {
  const { canView } = useRole()
  const visibleModules = modules.filter((module) => canView(module.link))

  return (
    <div className="page">
      <div className="dashboard-header">
        <h1>Museum of Fine Arts, Houston</h1>
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
