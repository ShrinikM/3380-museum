import { useState, useEffect } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { callApi } from '../api'
import { useRole } from '../context/role'

const colors = ['#1a3c6e', '#c8962e', '#1a7b4e', '#b0271a', '#6b6a78']

const numberFormat = new Intl.NumberFormat('en-US')

const moneyFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const priceFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function formatNumber(value) {
  return numberFormat.format(value)
}

function formatMoney(value) {
  return moneyFormat.format(value)
}

function formatDateTime(value) {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function Panel({ title, action, children }) {
  return (
    <section className="dash-panel">
      <div className="dash-panel-heading">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function StatTile({ label, value }) {
  return (
    <article className="dash-stat-card">
      <div className="dash-stat-label">{label}</div>
      <div className="dash-stat-value">{value}</div>
    </article>
  )
}

function Dashboard() {
  const { user } = useRole()
  const today = new Date().toLocaleDateString('en-CA')

  const [startDate, setStartDate] = useState(today.slice(0, 4) + '-01-01')
  const [endDate, setEndDate] = useState(today)
  const [dashboard, setDashboard] = useState(null)
  const [loadError, setLoadError] = useState('')

  const showDates = user?.role !== 'Staff'

  useEffect(() => {
    if (!startDate || !endDate || startDate > endDate) {
      return
    }

    async function loadDashboard() {
      try {
        const data = await callApi(
          '/api/dashboard?start=' + startDate + '&end=' + endDate,
          'GET'
        )
        setDashboard(data)
        setLoadError('')
      } catch (err) {
        setLoadError('Could not load dashboard: ' + err.message)
      }
    }

    loadDashboard()
  }, [startDate, endDate])

  function renderRevenuePanel() {
    let total = 0
    for (const item of dashboard.revenueBySource) {
      total = total + item.Revenue
    }

    return (
      <Panel
        title="Revenue by Source"
        action={<div className="dash-panel-total">{formatMoney(total)}</div>}
      >
        <div className="dash-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dashboard.revenueBySource}
              margin={{ top: 12, right: 12, left: 0, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e3e0da"
              />
              <XAxis
                dataKey="Source"
                tick={{ fill: '#6b6a78', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#6b6a78', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => '$' + numberFormat.format(value)}
              />
              <Tooltip formatter={(value) => [formatMoney(value), 'Revenue']} />
              <Bar
                dataKey="Revenue"
                fill={colors[0]}
                radius={[3, 3, 0, 0]}
                maxBarSize={56}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    )
  }

  function renderCollectionPanel() {
    return (
      <Panel title="Collection Breakdown">
        {dashboard.collection.length === 0 && (
          <p className="dash-empty">No artworks yet.</p>
        )}

        {dashboard.collection.length > 0 && (
          <>
            <div className="dash-donut-wrap">
              <ResponsiveContainer width="100%" height={205}>
                <PieChart>
                  <Pie
                    data={dashboard.collection}
                    dataKey="Artworks"
                    nameKey="Type"
                    innerRadius={55}
                    outerRadius={78}
                    paddingAngle={3}
                  >
                    {dashboard.collection.map((item, index) => (
                      <Cell
                        key={item.Type}
                        fill={colors[index % colors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [numberFormat.format(value), 'Artworks']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="dash-legend">
              {dashboard.collection.map((item, index) => (
                <div className="dash-legend-row" key={item.Type}>
                  <span
                    className="dash-legend-dot"
                    style={{ background: colors[index % colors.length] }}
                  />
                  <span>{item.Type}</span>
                  <strong>{formatNumber(item.Artworks)}</strong>
                </div>
              ))}
            </div>
          </>
        )}
      </Panel>
    )
  }

  function renderCollectionSizesPanel() {
    return (
      <Panel title="Artworks by Collection">
        {dashboard.collectionSizes.length === 0 && (
          <p className="dash-empty">No collections yet.</p>
        )}

        <div className="dash-list">
          {dashboard.collectionSizes.map((item) => (
            <div className="dash-row" key={item.CollectionID}>
              <strong>{item.Name}</strong>
              <div className="dash-row-value">{formatNumber(item.Artworks)}</div>
            </div>
          ))}
        </div>
      </Panel>
    )
  }

  function renderTopExhibitionsPanel() {
    return (
      <Panel title="Top Exhibitions">
        <div className="table-wrap">
          <table className="data-table">
            <caption className="sr-only">Top exhibitions by tickets sold</caption>
            <thead>
              <tr>
                <th scope="col">Exhibition</th>
                <th scope="col">Tickets</th>
                <th scope="col">Revenue</th>
                <th scope="col">Avg. Price</th>
                <th scope="col">Capacity</th>
                <th scope="col">Capacity Used</th>
              </tr>
            </thead>

            <tbody>
              {dashboard.topExhibitions.map((item, index) => (
                <tr key={item.ExhibitionID}>
                  <td className="strong">
                    {index + 1}. {item.Name}
                  </td>
                  <td className="mono">{formatNumber(item.TicketsSold)}</td>
                  <td className="mono">{formatMoney(item.Revenue)}</td>
                  <td className="mono">{priceFormat.format(item.AveragePrice)}</td>
                  <td className="mono">{formatNumber(item.Capacity)}</td>
                  <td className="mono">{item.PercentOfCapacity}%</td>
                </tr>
              ))}

              {dashboard.topExhibitions.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty">
                    No tickets sold in this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    )
  }

  function renderCurrentExhibitionsPanel() {
    return (
      <Panel title="Current Exhibitions">
        {dashboard.currentExhibitions.length === 0 && (
          <p className="dash-empty">No exhibitions are open right now.</p>
        )}

        <div className="dash-list">
          {dashboard.currentExhibitions.map((item) => (
            <div key={item.ExhibitionID}>
              <div className="dash-row">
                <div>
                  <strong>{item.Name}</strong>
                  <p>Ends {item.EndDate}</p>
                </div>
                <div className="dash-row-value">
                  {formatNumber(item.TicketsSold)} / {formatNumber(item.Capacity)}
                  <span>{item.PercentFull}% full</span>
                </div>
              </div>

              <div className="dash-progress">
                <div
                  className="dash-progress-fill"
                  style={{ width: Math.min(item.PercentFull, 100) + '%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </Panel>
    )
  }

  function renderExhibitionArtworksPanel() {
    return (
      <Panel title="Current Exhibitions">
        {dashboard.exhibitionArtworks.length === 0 && (
          <p className="dash-empty">No exhibitions are open right now.</p>
        )}

        <div className="dash-list">
          {dashboard.exhibitionArtworks.map((item) => (
            <div className="dash-row" key={item.ExhibitionID}>
              <div>
                <strong>{item.Name}</strong>
                <p>Ends {item.EndDate}</p>
              </div>
              <div className="dash-row-value">
                {formatNumber(item.ArtworkCount)}
                <span>artworks</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    )
  }

  function renderActivityPanel() {
    return (
      <Panel title="Recent Activity">
        {dashboard.activity.length === 0 && (
          <p className="dash-empty">No activity yet.</p>
        )}

        <div className="dash-activity-scroll">
          {dashboard.activity.map((item, index) => (
            <div className="dash-activity-item" key={index}>
              <div>
                <strong>{item.Description}</strong>
                <p>
                  {item.Kind}
                  {item.StaffName ? ' · by ' + item.StaffName : ''}
                </p>
              </div>

              <span className="dash-activity-time">
                {formatDateTime(item.At)}
              </span>
            </div>
          ))}
        </div>
      </Panel>
    )
  }

  function renderPanels() {
    if (dashboard.role === 'Staff') {
      return (
        <>
          <div className="dash-main-grid">
            {renderCollectionSizesPanel()}
            {renderCollectionPanel()}
          </div>

          {renderExhibitionArtworksPanel()}
          {renderActivityPanel()}
        </>
      )
    }

    if (dashboard.role === 'Operator') {
      return (
        <>
          <div className="dash-main-grid">
            {renderRevenuePanel()}
            {renderCurrentExhibitionsPanel()}
          </div>

          {renderTopExhibitionsPanel()}
          {renderActivityPanel()}
        </>
      )
    }

    return (
      <>
        <div className="dash-main-grid">
          {renderRevenuePanel()}
          {renderCollectionPanel()}
        </div>

        <div className="dash-main-grid">
          {renderTopExhibitionsPanel()}
          {renderCurrentExhibitionsPanel()}
        </div>

        {renderActivityPanel()}
      </>
    )
  }

  return (
    <div className="page dashboard-page">
      <div className="dash-page-header">
        <h1>CoogMuseum Dashboard</h1>

        {showDates && (
          <div className="dash-controls">
            <div className="dash-control">
              <label htmlFor="dash-start">Start Date</label>
              <input
                id="dash-start"
                className="input"
                type="date"
                max={endDate || today}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="dash-control">
              <label htmlFor="dash-end">End Date</label>
              <input
                id="dash-end"
                className="input"
                type="date"
                min={startDate}
                max={today}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {loadError && (
        <div className="dash-error" role="alert">
          <p>{loadError}</p>
        </div>
      )}

      {dashboard && (
        <>
          <div className="dash-stat-grid">
            {dashboard.tiles.map((tile) => (
              <StatTile
                key={tile.label}
                label={tile.label}
                value={
                  tile.format === 'money'
                    ? formatMoney(tile.value)
                    : formatNumber(tile.value)
                }
              />
            ))}
          </div>

          {renderPanels()}
        </>
      )}
    </div>
  )
}

export default Dashboard
