import { useState } from 'react'
import { callApi } from '../api'
import { useRole } from '../context/role'

const MAX_HISTORY = 10

const reportTypes = [
  {
    id: 'collection',
    name: 'Collection Inventory',
    columns: [
      { key: 'ArtworkID', label: 'Artwork ID' },
      { key: 'Title', label: 'Title' },
      { key: 'Type', label: 'Type' },
      { key: 'DateCreated', label: 'Date Created' },
      { key: 'ArtistName', label: 'Artist' },
      { key: 'CollectionName', label: 'Collection' },
      { key: 'DateAdded', label: 'Date Added' },
    ],
  },
  {
    id: 'exhibitions',
    name: 'Exhibition Report',
    columns: [
      { key: 'ExhibitionID', label: 'Exhibition ID' },
      { key: 'Name', label: 'Name' },
      { key: 'StartDate', label: 'Start Date' },
      { key: 'EndDate', label: 'End Date' },
      { key: 'Description', label: 'Description' },
      { key: 'Capacity', label: 'Capacity' },
    ],
  },
  {
    id: 'memberships',
    name: 'Membership Report',
    columns: [
      { key: 'MembershipID', label: 'Membership ID' },
      { key: 'MemberName', label: 'Member' },
      { key: 'Email', label: 'Email' },
      { key: 'MembershipType', label: 'Type' },
      { key: 'StartDate', label: 'Start Date' },
      { key: 'EndDate', label: 'End Date' },
      { key: 'Price', label: 'Price' },
      { key: 'DiscountPercent', label: 'Discount %' },
      { key: 'PaymentMethod', label: 'Payment Method' },
    ],
  },
  {
    id: 'sales',
    name: 'Store Sales Report',
    columns: [
      { key: 'Shop', label: 'Shop' },
      { key: 'SaleID', label: 'Sale ID' },
      { key: 'ItemName', label: 'Item' },
      { key: 'Quantity', label: 'Quantity' },
      { key: 'SalePrice', label: 'Unit Price' },
      { key: 'Total', label: 'Total' },
      { key: 'SaleDate', label: 'Sale Date' },
      { key: 'PaymentMethod', label: 'Payment Method' },
    ],
  },
]

function getSavedHistory(storageKey) {
  const saved = localStorage.getItem(storageKey)

  if (saved === null) {
    return []
  }

  try {
    return JSON.parse(saved)
  } catch {
    return []
  }
}

function Reports() {
  const { user } = useRole()
  const today = new Date().toLocaleDateString('en-CA')
  const storageKey = 'reportHistory-' + user.username

  const [reportType, setReportType] = useState('collection')
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
      startDate: startDate || 'All dates',
      endDate: endDate || 'All dates',
      runAt: new Date().toLocaleString(),
      rows: data,
    }

    const newHistory = [newReport, ...history].slice(0, MAX_HISTORY)
    const saved = saveHistory(newHistory)

    setHistory(newHistory)

    if (saved) {
      setMessage(`${report.name} created: ${data.length} rows.`)
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

  const deleteReport = (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return
    }

    const newHistory = history.filter((item) => item.id !== id)
    saveHistory(newHistory)
    setHistory(newHistory)
  }

  const clearHistory = () => {
    if (!window.confirm('Are you sure you want to delete all saved reports?')) {
      return
    }

    localStorage.removeItem(storageKey)
    setHistory([])
  }

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

      {history.length > 0 && (
        <>
          <div className="report-section-header">
            <h2 className="section-label">Reports</h2>

            <button
              type="button"
              className="btn secondary"
              onClick={clearHistory}
            >
              Clear All
            </button>
          </div>

          <div className="card table-wrap report-section">
            <table className="data-table">
              <caption className="sr-only">Saved reports</caption>
              <thead>
                <tr>
                  <th scope="col">Report</th>
                  <th scope="col">Start Date</th>
                  <th scope="col">End Date</th>
                  <th scope="col">Rows</th>
                  <th scope="col">Created At</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>

              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td className="strong">{item.name}</td>
                    <td className="mono">{item.startDate}</td>
                    <td className="mono">{item.endDate}</td>
                    <td className="mono">{item.rows.length}</td>
                    <td>{item.runAt}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="btn secondary"
                          onClick={() => exportReport(item)}
                          aria-label={`Export ${item.name} as CSV`}
                        >
                          Export CSV
                        </button>

                        <button
                          type="button"
                          className="btn danger"
                          onClick={() => deleteReport(item.id)}
                          aria-label={`Delete ${item.name}`}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
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
