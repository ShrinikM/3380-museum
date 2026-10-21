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
    name: 'Revenue by Source',
    formats: ['bar', 'pie', 'line'],
    labelKey: 'Source',
    charts: [
      {
        title: 'Revenue by Source',
        series: [{ key: 'Revenue', label: 'Revenue' }],
        prefix: '$',
        suffix: '',
      },
    ],
    columns: [
      { key: 'Source', label: 'Source' },
      { key: 'Revenue', label: 'Revenue' },
      { key: 'PercentOfTotal', label: 'Percent of Total' },
    ],
  },
  {
    id: 'ticket-sales',
    name: 'Ticket Sales by Exhibition',
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
    id: 'membership-types',
    name: 'Membership Breakdown',
    formats: ['bar', 'line'],
    labelKey: 'MembershipType',
    charts: [
      {
        title: 'Members',
        series: [{ key: 'Members', label: 'Members' }],
        prefix: '',
        suffix: '',
      },
      {
        title: 'Revenue',
        series: [{ key: 'Revenue', label: 'Revenue' }],
        prefix: '$',
        suffix: '',
      },
      {
        title: 'Average Discount',
        series: [{ key: 'AverageDiscount', label: 'Average Discount' }],
        prefix: '',
        suffix: '%',
      },
    ],
    columns: [
      { key: 'MembershipType', label: 'Type' },
      { key: 'Members', label: 'Members' },
      { key: 'Revenue', label: 'Revenue' },
      { key: 'AverageDiscount', label: 'Average Discount %' },
    ],
  },
  {
    id: 'giftshop-items',
    name: 'Gift Shop Revenue by Item',
    formats: ['bar', 'pie'],
    labelKey: 'ItemName',
    charts: [
      {
        title: 'Revenue',
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
      { key: 'ItemName', label: 'Item' },
      { key: 'Category', label: 'Category' },
      { key: 'UnitsSold', label: 'Units Sold' },
      { key: 'Revenue', label: 'Revenue' },
      { key: 'PercentOfTotal', label: 'Percent of Total' },
    ],
  },
  {
    id: 'cafe-items',
    name: 'Cafe Revenue by Item',
    formats: ['bar', 'pie'],
    labelKey: 'ItemName',
    charts: [
      {
        title: 'Revenue',
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
      { key: 'ItemName', label: 'Item' },
      { key: 'Category', label: 'Category' },
      { key: 'UnitsSold', label: 'Units Sold' },
      { key: 'Revenue', label: 'Revenue' },
      { key: 'PercentOfTotal', label: 'Percent of Total' },
    ],
  },
]

function getSavedHistory(storageKey) {
  const saved = localStorage.getItem(storageKey)

  if (saved === null) {
    return []
  }

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

    if (newReport.formats) {
      setReportFormat(newReport.formats[0])
    } else {
      setReportFormat('table')
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

    const report = reportTypes.find((item) => item.id === reportType)

    let data
    try {
      data = await callApi(
        '/api/reports/' +
          reportType +
          '?start=' +
          startDate +
          '&end=' +
          endDate,
        'GET'
      )
    } catch (err) {
      setMessage('Could not load report: ' + err.message)
      return
    }

    const newReport = {
      id: Date.now(),
      reportType: reportType,
      name: report.name,
      format: reportFormat,
      startDate: startDate || 'All dates',
      endDate: endDate || 'All dates',
      runAt: new Date().toLocaleString(),
      rows: data,
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

    if (item.rows.length === 0) {
      setMessage('This report has no data to export.')
      return
    }

    const headers = report.columns.map((column) => column.label)

    const csvRows = item.rows.map((row) =>
      report.columns.map((column) => row[column.key])
    )

    const csv = [headers, ...csvRows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n')

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = item.reportType + '-report.csv'
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

    if (!window.confirm(question)) {
      return
    }

    const newHistory = history.filter((item) => !isSelected(item.id))
    saveHistory(newHistory)
    setHistory(newHistory)

    if (selectedReports.some((item) => item.id === viewingId)) {
      setViewingId(null)
    }

    clear()
  }

  const clearHistory = () => {
    if (!window.confirm('Are you sure you want to delete all saved reports?')) {
      return
    }

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

  return (
    <div className="page reports-page">
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
      </div>

      <div className="card report-request-panel">
        <h2 className="module-title">Run a Report</h2>

        <form className="report-form" onSubmit={handleSubmit}>
          <div className="form-group">
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
            <div className="form-group">
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
                setMessage('')
              }}
            >
              Clear Dates
            </button>

            <button type="submit" className="btn primary">
              Run Report
            </button>
          </div>
        </form>

        {message && (
          <p className="report-message" role="status">
            {message}
          </p>
        )}
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

          {viewingReport.charts.map((chart) => (
            <Chart
              key={chart.title}
              type={viewingItem.format}
              title={chart.title}
              data={viewingItem.rows}
              labelKey={viewingReport.labelKey}
              series={chart.series}
              prefix={chart.prefix}
              suffix={chart.suffix}
            />
          ))}

          <table className="data-table">
            <caption className="sr-only">Report data</caption>
            <thead>
              <tr>
                {viewingReport.columns.map((column) => (
                  <th key={column.key} scope="col">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {viewingItem.rows.map((row, index) => (
                <tr key={index}>
                  {viewingReport.columns.map((column) => (
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
