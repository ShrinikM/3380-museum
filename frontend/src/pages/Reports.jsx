import { useState } from 'react'

const reportTypes = [
  { id: 'collection', name: 'Collection Inventory' },
  { id: 'exhibitions', name: 'Exhibition Report' },
  { id: 'memberships', name: 'Membership Report' },
  { id: 'sales', name: 'Store Sales Report' },
]

function Reports() {
  const today = new Date().toLocaleDateString('en-CA')

  const [reportType, setReportType] = useState('collection')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [format, setFormat] = useState('CSV')
  const [requests, setRequests] = useState([])
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
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

    const newRequest = {
      id: Date.now(),
      name: report.name,
      startDate: startDate || 'All dates',
      endDate: endDate || 'All dates',
      format,
      requestedAt: new Date().toLocaleString(),
      status: 'Requested',
    }

    setRequests((current) => [newRequest, ...current])
    setMessage(`${report.name} request added successfully.`)
  }

  const exportRequests = () => {
    if (requests.length === 0) {
      setMessage('There are no report requests to export.')
      return
    }

    const headers = [
      'Report',
      'Start Date',
      'End Date',
      'Format',
      'Requested At',
      'Status',
    ]

    const rows = requests.map((request) => [
      request.name,
      request.startDate,
      request.endDate,
      request.format,
      request.requestedAt,
      request.status,
    ])

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n')

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'report-requests.csv'
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <div className="page reports-page">
      <div className="page-header">
        <h1 className="page-title">Reports</h1>

        <button
          type="button"
          className="btn primary"
          onClick={exportRequests}
        >
          Export Requests
        </button>
      </div>

      <div className="reports-summary">
        <div className="summary-card">
          <div className="summary-value">{reportTypes.length}</div>
          <div className="summary-label">Available Reports</div>
        </div>

        <div className="summary-card">
          <div className="summary-value">{requests.length}</div>
          <div className="summary-label">Total Requests</div>
        </div>

        <div className="summary-card">
          <div className="summary-value">
            {
              requests.filter(
                (request) => request.status === 'Requested'
              ).length
            }
          </div>
          <div className="summary-label">Pending Requests</div>
        </div>
      </div>

      <div className="card report-request-panel">
        <h2 className="module-title">Request a Report</h2>

        <form className="report-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="report-type">Report Type</label>

            <select
              id="report-type"
              className="input"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              {reportTypes.map((report) => (
                <option key={report.id} value={report.id}>
                  {report.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="report-format">Format</label>

            <select
              id="report-format"
              className="input"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              <option value="CSV">CSV</option>
              <option value="PDF">PDF</option>
            </select>
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
                setMessage('')
              }}
            >
              Clear Dates
            </button>

            <button type="submit" className="btn primary">
              Request Report
            </button>
          </div>
        </form>

        {message && (
          <p className="report-message" role="status">
            {message}
          </p>
        )}
      </div>

      <h2 className="section-label">Recent Report Requests</h2>

      <div className="card table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Report</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Format</th>
              <th>Requested At</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {requests.map((request) => (
              <tr key={request.id}>
                <td>{request.name}</td>
                <td>{request.startDate}</td>
                <td>{request.endDate}</td>
                <td>{request.format}</td>
                <td>{request.requestedAt}</td>
                <td>
                  <span>{request.status}</span>
                </td>
              </tr>
            ))}

            {requests.length === 0 && (
              <tr>
                <td colSpan={6} className="empty">
                  No report requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Reports