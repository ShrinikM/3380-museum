import { useState } from 'react'
import { callApi } from '../api'
import { useRole } from '../context/role'
import Chart from '../components/Chart'
import { useSelection } from '../hooks/useSelection'

const MAX_HISTORY = 10

const formatNames = {
  table: 'Table (CSV only)',
  bar: 'Bar Chart',
  line: 'Line Chart',
  pie: 'Pie Chart',
}

const reportTypes = [
  {
    id: 'revenue',
    name: 'Revenue & Financial Trends',
    formats: ['bar', 'line', 'pie'],
    labelKey: 'Month',
    charts: [
      {
        title: 'Monthly Revenue Trend',
        series: [{ key: 'Revenue', label: 'Monthly Revenue' }],
        prefix: '$',
        suffix: '',
      },
      {
        title: 'Average Spending Per Visitor',
        series: [{ key: 'AvgSpendPerVisitor', label: 'Avg Spend ($)' }],
        prefix: '$',
        suffix: '',
      },
    ],
    columns: [
      { key: 'Month', label: 'Month' },
      { key: 'Revenue', label: 'Total Revenue' },
      { key: 'TotalVisitors', label: 'Total Visitors' },
      { key: 'AvgSpendPerVisitor', label: 'Avg Spend Per Visitor' },
      { key: 'MonthOverMonthGrowth', label: 'Monthly Growth (%)' },
    ],
  },
  {
    id: 'ticket-sales',
    name: 'Ticket Sales & Exhibition Capacity',
    formats: ['bar', 'line'],
    labelKey: 'Name',
    charts: [
      {
        title: 'Tickets Sold vs Capacity',
        series: [
          { key: 'TicketsSold', label: 'Tickets Sold' },
          { key: 'Capacity', label: 'Capacity' },
        ],
        prefix: '',
        suffix: '',
      },
      {
        title: 'Ticket Revenue',
        series: [{ key: 'Revenue', label: 'Revenue' }],
        prefix: '$',
        suffix: '',
      },
    ],
    columns: [
      { key: 'Name', label: 'Exhibition' },
      { key: 'TicketsSold', label: 'Tickets Sold' },
      { key: 'Capacity', label: 'Capacity' },
      { key: 'PercentFull', label: 'Percent Full' },
      { key: 'Revenue', label: 'Revenue' },
    ],
  },
  {
    id: 'giftshop-cafe',
    name: 'Gift Shop & Café Sales',
    formats: ['bar', 'pie'],
    labelKey: 'ItemName',
    charts: [
      {
        title: 'Revenue by Item',
        series: [{ key: 'Revenue', label: 'Revenue' }],
        prefix: '$',
        suffix: '',
      },
      {
        title: 'Units Sold',
        series: [{ key: 'UnitsSold', label: 'Units Sold' }],
        prefix: '',
        suffix: '',
      },
    ],
    columns: [
      { key: 'ItemName', label: 'Item Name' },
      { key: 'Category', label: 'Category' },
      { key: 'UnitsSold', label: 'Units Sold' },
      { key: 'Revenue', label: 'Revenue' },
      { key: 'PercentOfTotal', label: 'Percent of Total' },
    ],
  },
  {
    id: 'membership-expiration',
    name: 'Active Memberships & Expirations',
    formats: ['table'],
    columns: [
      { key: 'MemberName', label: 'Member Name' },
      { key: 'Email', label: 'Email' },
      { key: 'MembershipType', label: 'Type' },
      { key: 'StartDate', label: 'Start Date' },
      { key: 'EndDate', label: 'End Date' },
      { key: 'DaysUntilExpiration', label: 'Days Until Expiration' },
    ],
  },
]

function getSavedHistory(storageKey) {
  const saved = localStorage.getItem(storageKey)
  if (saved === null) return []
  try {
    const savedReports = JSON.parse(saved)
    return savedReports.filter((item) =>
      reportTypes.some((type) => type.id === item.reportType)
    )
  } catch {
    return []
  }
}

function Reports() {
  const { user } = useRole()
  const today = new Date().toLocaleDateString('en-CA')
  const storageKey = 'reportHistory-' + user.username

  const [reportType, setReportType] = useState(reportTypes[0].id)
  const [reportFormat, setReportFormat] = useState(reportTypes[0].formats[0])
  const [selectedColumns, setSelectedColumns] = useState(
    reportTypes[0].columns.map((col) => col.key)
  )
  const [viewingId, setViewingId] = useState(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [history, setHistory] = useState(() => getSavedHistory(storageKey))
  const [message, setMessage] = useState('')

  const saveHistory = (newHistory) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(newHistory))
    } catch {
      setMessage('Report loaded, but it is too large to save in this browser.')
      return false
    }
    return true
  }

  const selectedReport = reportTypes.find((item) => item.id === reportType)

  const handleTypeChange = (e) => {
    const newType = e.target.value
    const newReport = reportTypes.find((item) => item.id === newType)

    setReportType(newType)
    setSelectedColumns(newReport.columns.map((col) => col.key))

    if (newReport.formats) {
      setReportFormat(newReport.formats[0])
    } else {
      setReportFormat('table')
    }
  }

  const handleColumnToggle = (columnKey) => {
    if (selectedColumns.includes(columnKey)) {
      if (selectedColumns.length === 1) return
      setSelectedColumns(selectedColumns.filter((key) => key !== columnKey))
    } else {
      setSelectedColumns([...selectedColumns, columnKey])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    if (startDate && startDate > today) {
      setMessage('Start date cannot be in the future.')
      return
    }

    if (endDate && endDate > today) {
      setMessage('End date cannot be in the future.')
      return
    }

    if (startDate && endDate && startDate > endDate) {
      setMessage('Start date cannot be after the end date.')
      return
    }

    let data
    try {
      data = await callApi(
        '/api/reports/' + reportType + '?start=' + startDate + '&end=' + endDate,
        'GET'
      )
    } catch (err) {
      setMessage('Could not load report: ' + err.message)
      return
    }

    const newReport = {
      id: Date.now(),
      reportType: reportType,
      name: selectedReport.name,
      format: reportFormat,
      startDate: startDate || 'All dates',
      endDate: endDate || 'All dates',
      runAt: new Date().toLocaleString(),
      rows: data,
      activeColumns: selectedColumns,
    }

    const newHistory = [newReport, ...history].slice(0, MAX_HISTORY)
    saveHistory(newHistory)
    setHistory(newHistory)

    if (reportFormat !== 'table') {
      setViewingId(newReport.id)
    }
  }

  const exportReport = (item) => {
    const report = reportTypes.find((type) => type.id === item.reportType)
    const activeColsKeys = item.activeColumns || report.columns.map((c) => c.key)
    const activeCols = report.columns.filter((c) => activeColsKeys.includes(c.key))

    if (item.rows.length === 0) {
      setMessage('This report has no data to export.')
      return
    }

    const headers = activeCols.map((column) => column.label)
    const csvRows = item.rows.map((row) =>
      activeCols.map((column) => row[column.key])
    )

    const csv = [headers, ...csvRows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = item.reportType + '-custom-report.csv'
    link.click()

    URL.revokeObjectURL(url)
  }

  const {
    selectedRows: selectedReports,
    isSelected,
    toggle,
    clear,
  } = useSelection(history, (item) => item.id)

  const viewSelected = () => {
    setViewingId(selectedReports[0].id)
  }

  const exportSelected = () => {
    for (const item of selectedReports) {
      exportReport(item)
    }
  }

  const deleteSelected = () => {
    let question = 'Are you sure you want to delete this report?'
    if (selectedReports.length > 1) {
      question = `Are you sure you want to delete these ${selectedReports.length} reports?`
    }
    if (!window.confirm(question)) return

    const newHistory = history.filter((item) => !isSelected(item.id))
    saveHistory(newHistory)
    setHistory(newHistory)

    if (selectedReports.some((item) => item.id === viewingId)) {
      setViewingId(null)
    }
    clear()
  }

  const clearHistory = () => {
    if (!window.confirm('Are you sure you want to delete all saved reports?')) return
    localStorage.removeItem(storageKey)
    setHistory([])
    setViewingId(null)
    clear()
  }

  const canViewSelected =
    selectedReports.length === 1 &&
    selectedReports[0].format &&
    selectedReports[0].format !== 'table'

  const viewingItem = history.find((item) => item.id === viewingId)
  const viewingReport = viewingItem
    ? reportTypes.find((type) => type.id === viewingItem.reportType)
    : null

  const viewerRows = viewingItem?.rows || []
  const viewingColsKeys = viewingItem?.activeColumns || viewingReport?.columns.map((c) => c.key) || []
  const viewingColumns = viewingReport?.columns.filter((c) => viewingColsKeys.includes(c.key)) || []

  return (
    <div className="page page-wide reports-page">
      <style>{`
        .report-viewer .card .legend,
        .report-viewer .card .chart-legend,
        .report-viewer .card ul {
          display: grid !important;
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          gap: 0.25rem 1.5rem !important;
          justify-content: flex-start !important;
          text-align: left !important;
          margin-top: -1rem !important;
        }
      `}</style>

      <div className="page-header">
        <h1 className="page-title">Reports</h1>
      </div>

      <div className="card report-request-panel">
        <h2 className="module-title">Run a Report</h2>

        <form className="report-form" onSubmit={handleSubmit}>
          <div className="form-group" style={{ position: 'relative', zIndex: 10 }}>
            <label htmlFor="report-type">Report Type</label>
            <select
              id="report-type"
              className="input"
              value={reportType}
              onChange={handleTypeChange}
            >
              {reportTypes.map((report) => (
                <option key={report.id} value={report.id}>
                  {report.name}
                </option>
              ))}
            </select>
          </div>

          {selectedReport.formats && (
            <div className="form-group" style={{ position: 'relative', zIndex: 10 }}>
              <label htmlFor="report-format">Format</label>
              <select
                id="report-format"
                className="input"
                value={reportFormat}
                onChange={(e) => setReportFormat(e.target.value)}
              >
                {selectedReport.formats.map((format) => (
                  <option key={format} value={format}>
                    {formatNames[format]}
                  </option>
                ))}
                <option value="table">{formatNames.table}</option>
              </select>
            </div>
          )}

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600' }}>
              Select Columns to Include
            </label>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '0.5rem', 
              background: '#ffffff', 
              padding: '0.6rem 0.75rem', 
              borderRadius: '6px', 
              border: '1px solid #e2e8f0',
              alignItems: 'center'
            }}>
              {selectedReport.columns.map((column) => (
                <label 
                  key={column.key} 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.35rem', 
                    cursor: 'pointer', 
                    fontSize: '0.85rem',
                    padding: '0.3rem 0.55rem',
                    background: '#f8fafc',
                    borderRadius: '4px',
                    border: '1px solid #e2e8f0',
                    margin: 0
                  }}
                >
                  <input
                    type="checkbox"
                    style={{ margin: 0, cursor: 'pointer', width: '14px', height: '14px' }}
                    checked={selectedColumns.includes(column.key)}
                    onChange={() => handleColumnToggle(column.key)}
                  />
                  <span style={{ color: '#1e293b', whiteSpace: 'nowrap' }}>
                    {column.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="report-start">Start Date</label>
            <input
              id="report-start"
              className="input"
              type="date"
              max={today}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="report-end">End Date</label>
            <input
              id="report-end"
              className="input"
              type="date"
              max={today}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="report-form-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={() => {
                setStartDate('')
                setEndDate('')
                setSelectedColumns(selectedReport.columns.map((col) => col.key))
                setMessage('')
              }}
            >
              Reset Filters
            </button>

            <button type="submit" className="btn primary">
              Run Report
            </button>
          </div>
        </form>

        {message}
      </div>

      {viewingItem && viewingReport && viewingReport.charts && (
        <div className="card report-viewer">
          <div className="report-viewer-header">
            <h2 className="module-title">
              {viewingItem.name} ({formatNames[viewingItem.format]})
            </h2>

            <button
              type="button"
              className="btn secondary"
              onClick={() => setViewingId(null)}
            >
              Close
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem', marginTop: '0.75rem', alignItems: 'stretch' }}>
            <div className="card dash-stat-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1rem 1.25rem' }}>
              <div className="dash-stat-label">Total Records / Rows</div>
              <div className="dash-stat-value">{viewerRows.length}</div>
            </div>

            <div className="card dash-stat-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1rem 1.25rem' }}>
              <div className="dash-stat-label">Date Range</div>
              <div className="dash-stat-value" style={{ fontSize: '0.95rem' }}>
                {viewingItem.startDate} to {viewingItem.endDate}
              </div>
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', 
            gap: '1.5rem', 
            marginBottom: '1.5rem',
            justifyContent: 'center',
            width: '100%'
          }}>
            {viewingReport.charts.map((chart) => {
              const activeSeries = chart.series.filter((s) =>
                viewingColsKeys.includes(s.key)
              )

              if (activeSeries.length === 0) return null

              const isPie = viewingItem.format === 'pie'

              return (
                <div 
                  key={chart.title} 
                  className="card" 
                  style={{ 
                    width: '100%', 
                    padding: isPie ? '2rem 1.5rem 4.5rem 1.5rem' : '1.5rem 1.5rem 1.75rem 1.5rem', 
                    background: '#ffffff', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center' 
                  }}
                >
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: isPie ? '1.25rem' : '1rem', color: '#0f172a', textAlign: 'center' }}>{chart.title}</h3>
                  <div style={{ width: '100%', height: isPie ? '360px' : '280px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ width: '100%', height: '100%' }}>
                      <Chart
                        type={viewingItem.format}
                        title=""
                        data={viewingItem.rows}
                        labelKey={viewingReport.labelKey}
                        series={activeSeries}
                        prefix={chart.prefix}
                        suffix={chart.suffix}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <table className="data-table">
            <caption className="sr-only">Report data</caption>
            <thead>
              <tr>
                {viewingColumns.map((column) => (
                  <th key={column.key} scope="col">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {viewerRows.map((row, index) => (
                <tr key={index}>
                  {viewingColumns.map((column) => (
                    <td key={column.key}>{row[column.key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {history.length > 0 && (
        <>
          <div className="report-section-header">
            <h2 className="section-label">Reports</h2>

            <div className="page-header-actions">
              {canViewSelected && (
                <button
                  type="button"
                  className="btn secondary"
                  onClick={viewSelected}
                >
                  View
                </button>
              )}

              {selectedReports.length > 0 && (
                <button
                  type="button"
                  className="btn secondary"
                  onClick={exportSelected}
                >
                  Export CSV
                </button>
              )}

              {selectedReports.length > 0 && (
                <button
                  type="button"
                  className="btn danger"
                  onClick={deleteSelected}
                >
                  Delete
                </button>
              )}

              <button
                type="button"
                className="btn secondary"
                onClick={clearHistory}
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="card table-wrap report-section">
            <table
              className={
                'data-table' + (selectedReports.length > 0 ? ' selecting' : '')
              }
            >
              <caption className="sr-only">Saved reports</caption>
              <thead>
                <tr>
                  <th scope="col" className="select-col">
                    <span className="sr-only">Select</span>
                  </th>
                  <th scope="col">Report</th>
                  <th scope="col">Format</th>
                  <th scope="col">Start Date</th>
                  <th scope="col">End Date</th>
                  <th scope="col">Created At</th>
                </tr>
              </thead>

              <tbody>
                {history.map((item) => (
                  <tr
                    key={item.id}
                    className={isSelected(item.id) ? 'selected-row' : ''}
                  >
                    <td className="select-col">
                      <input
                        type="checkbox"
                        checked={isSelected(item.id)}
                        onChange={() => toggle(item.id)}
                        aria-label={`Select ${item.name}`}
                      />
                    </td>
                    <td className="strong">{item.name}</td>
                    <td>{formatNames[item.format || 'table']}</td>
                    <td className="mono">{item.startDate}</td>
                    <td className="mono">{item.endDate}</td>
                    <td>{item.runAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

    </div>
  )
}

export default Reports