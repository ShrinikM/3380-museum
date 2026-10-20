import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  Images,
  Layers3,
  Ticket,
  Users,
} from 'lucide-react'
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useRole } from '../context/role'

const visitorData = [
  { month: 'Jan', visitors: 120 },
  { month: 'Feb', visitors: 180 },
  { month: 'Mar', visitors: 150 },
  { month: 'Apr', visitors: 230 },
  { month: 'May', visitors: 200 },
  { month: 'Jun', visitors: 280 },
]

const artworkData = [
  {
    name: 'Mona Lisa',
    views: 245,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/6/6a/Mona_Lisa.jpg',
  },
  {
    name: 'The Great Wave',
    views: 167,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/0/0a/The_Great_Wave_off_Kanagawa.jpg',
  },
  {
    name: 'Girl with a Pearl Earring',
    views: 143,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/d/d7/Meisje_met_de_parel.jpg',
  },
  {
    name: 'The Persistence of Memory',
    views: 121,
    image:
      'https://upload.wikimedia.org/wikipedia/en/d/dd/The_Persistence_of_Memory.jpg',
  },
]

const collectionData = [
  { name: 'Paintings', value: 45 },
  { name: 'Sculptures', value: 25 },
  { name: 'Photography', value: 20 },
  { name: 'Other', value: 10 },
]

const colors = [
  '#6f5bd3',
  '#6eab91',
  '#e3a45c',
  '#7395cf',
  '#cf8292',
  '#b8a7f2',
]

const numberFormat = new Intl.NumberFormat('en-US')

function formatNumber(value) {
  return numberFormat.format(value)
}

function Panel({ title, subtitle, action, children, className = '' }) {
  return (
    <section className={`dash-panel ${className}`}>
      <div className="dash-panel-heading">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function StatTile({ label, value, detail, icon: Icon, tone = 'blue' }) {
  return (
    <article className="dash-stat-card">
      <div className={`dash-stat-icon ${tone}`}>
        <Icon size={20} strokeWidth={1.8} />
      </div>
      <div className="dash-stat-label">{label}</div>
      <div className="dash-stat-value">{value}</div>
      <div className="dash-stat-detail">{detail}</div>
    </article>
  )
}

function Dashboard() {
  const { user, canView } = useRole()
  const isAdmin = user?.role === 'Admin'

  const quickLinks = [
    { title: 'Artists', path: '/artists', icon: Users },
    { title: 'Artworks', path: '/artworks', icon: Images },
    { title: 'Collections', path: '/collections', icon: Layers3 },
    { title: 'Exhibitions', path: '/exhibitions', icon: CalendarDays },
    { title: 'Tickets', path: '/tickets', icon: Ticket },
    { title: 'Memberships', path: '/memberships', icon: Users },
  ].filter((item) => canView(item.path))

  if (!isAdmin) {
    return (
      <div className="page">
        <h1 className="page-title">No access</h1>
        <p className="page-subtitle">
          Only administrators can view the dashboard.
        </p>
      </div>
    )
  }

  return (
    <div className="page dashboard-page">
      <div className="dash-page-header">
        <div>
          <span className="eyebrow">COOGMUSEUM / OVERVIEW</span>
          <h1>CoogMuseum Dashboard</h1>
          <p>Overview of visitors, exhibitions, and artwork.</p>
        </div>
      </div>

      <div className="dash-stat-grid">
        <StatTile
          label="Total Artworks"
          value={formatNumber(100)}
          detail="Artwork records"
          icon={Images}
          tone="violet"
        />

        <StatTile
          label="Total Visitors"
          value={formatNumber(1200)}
          detail="Recorded museum visitors"
          icon={Users}
          tone="green"
        />

        <StatTile
          label="Current Exhibitions"
          value={formatNumber(8)}
          detail="Currently active"
          icon={CalendarDays}
          tone="orange"
        />

        <StatTile
          label="Total Artworks Viewed"
          value={formatNumber(2450)}
          detail="Recorded artwork views"
          icon={Layers3}
          tone="blue"
        />
      </div>

      <div className="dash-main-grid">
        <Panel
          title="Visitor Insights"
          className="dash-chart-panel"
        >
          <div className="dash-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={visitorData}
                margin={{ top: 12, right: 12, left: -15, bottom: 4 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#ebe8e2"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#777582', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#777582', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(value) => [
                    numberFormat.format(value),
                    'Visitors',
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="visitors"
                  name="Visitors"
                  stroke="#6eabcf"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Art Collection Breakdown">
          <div className="dash-donut-wrap">
            <ResponsiveContainer width="100%" height={205}>
              <PieChart>
                <Pie
                  data={collectionData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={78}
                  paddingAngle={3}
                >
                  {collectionData.map((item, index) => (
                    <Cell
                      key={`${item.name}-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    numberFormat.format(value),
                    'Artworks',
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="dash-legend">
            {collectionData.map((item, index) => (
              <div
                className="dash-legend-row"
                key={`${item.name}-${index}`}
              >
                <span
                  className="dash-legend-dot"
                  style={{
                    background: colors[index % colors.length],
                  }}
                />
                <span>{item.name}</span>
                <strong>{formatNumber(item.value)}</strong>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel
        title="Artwork Insights"
        subtitle="Top artworks by views"
      >
        <div className="dash-activity-list">
          {artworkData.map((item, index) => (
            <div
              className="dash-activity-item"
              key={`${item.name}-${index}`}
            >
              <img
                src={item.image}
                alt={item.name}
                className="dash-artwork-image"
                onError={(event) => {
                  event.currentTarget.style.display = 'none'
                }}
              />

              <div>
                <strong>{item.name}</strong>
                <p>Artwork views</p>
              </div>

              <b>{formatNumber(item.views)}</b>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="Quick Access"
        action={
          <span className="dash-access-count">
            {quickLinks.length} available
          </span>
        }
      >
        <div className="dash-quick-links">
          {quickLinks.map((item) => {
            const Icon = item.icon

            return (
              <Link
                className="dash-quick-link"
                to={item.path}
                key={item.path}
              >
                <span className="dash-quick-icon">
                  <Icon size={19} />
                </span>
                <span>
                  <strong>{item.title}</strong>
                </span>
                <ArrowRight
                  size={16}
                  className="dash-quick-arrow"
                />
              </Link>
            )
          })}
        </div>
      </Panel>
    </div>
  )
}

export default Dashboard