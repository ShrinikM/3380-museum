import { useState } from 'react'
import { callApi } from '../api'
import { useRole } from '../context/role'
import Chart from '../components/Chart'
import { useSelection } from '../hooks/useSelection'

const MAX_HISTORY = 10

const formatNames = {
  table: 'Table',
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
    usesDates: true,
    charts: [
      {
        title: 'Monthly Revenue',
        series: [{ key: 'Revenue', label: 'Monthly Revenue' }],
        prefix: '$',
      },
      {
        title: 'Average Spending per Visitor',
        series: [{ key: 'AvgSpendPerVisitor', label: 'Avg Spend' }],
        prefix: '$',
      },
    ],
    columns: [
      { key: 'Month', label: 'Month' },
      { key: 'Revenue', label: 'Total Revenue', format: 'money' },
      { key: 'TotalVisitors', label: 'Total Visitors' },
      { key: 'AvgSpendPerVisitor', label: 'Avg Spend per Visitor', format: 'money' },
      { key: 'MonthOverMonthGrowth', label: 'Monthly Growth', format: 'percent' },
    ],
  },
  {
    id: 'ticket-sales',
    name: 'Ticket Sales & Exhibition Capacity',
    formats: ['bar', 'line'],
    labelKey: 'Name',
    usesDates: true,
    charts: [
      {
        title: 'Tickets Sold vs Capacity',
        series: [
          { key: 'TicketsSold', label: 'Tickets Sold' },
          { key: 'Capacity', label: 'Capacity' },
        ],
      },
      {
        title: 'Ticket Revenue',
        series: [{ key: 'Revenue', label: 'Revenue' }],
        prefix: '$',
      },
    ],
    columns: [
      { key: 'Name', label: 'Exhibition' },
      { key: 'TicketsSold', label: 'Tickets Sold' },
      { key: 'Capacity', label: 'Capacity' },
      { key: 'PercentFull', label: 'Percent Full', format: 'percent' },
      { key: 'Revenue', label: 'Revenue', format: 'money' },
    ],
  },
  {
    id: 'giftshop-cafe',
    name: 'Gift Shop & Café Sales',
    formats: ['bar', 'pie'],
    labelKey: 'ItemName',
    usesDates: true,
    charts: [
      {
        title: 'Gift Shop - Revenue by Item',
        store: 'Gift Shop',
        series: [{ key: 'Revenue', label: 'Revenue' }],
        prefix: '$',
      },
      {
        title: 'Café - Revenue by Item',
        store: 'Café',
        series: [{ key: 'Revenue', label: 'Revenue' }],
        prefix: '$',
      },
      {
        title: 'Gift Shop - Units Sold',
        store: 'Gift Shop',
        series: [{ key: 'UnitsSold', label: 'Units Sold' }],
      },
      {
        title: 'Café - Units Sold',
        store: 'Café',
        series: [{ key: 'UnitsSold', label: 'Units Sold' }],
      },
    ],
    columns: [
      { key: 'Store', label: 'Store' },
      { key: 'ItemName', label: 'Item' },
      { key: 'Category', label: 'Category' },
      { key: 'UnitsSold', label: 'Units Sold' },
      { key: 'Revenue', label: 'Revenue', format: 'money' },
      { key: 'PercentOfTotal', label: 'Share of Store Revenue', format: 'percent' },
    ],
  },
  {
    id: 'membership-expiration',
    name: 'Active Memberships & Expirations',
    formats: [],
    usesDates: false,
    columns: [
      { key: 'MemberName', label: 'Member' },
      { key: 'Email', label: 'Email' },
      { key: 'MembershipType', label: 'Type' },
      { key: 'StartDate', label: 'Start Date' },
      { key: 'EndDate', label: 'End Date' },
      { key: 'DaysUntilExpiration', label: 'Days Left' },
    ],
  },
]

function findReport(id){
  return reportTypes.find((type)=>type.id === id)
}

function formatCell(value, format){
  if(value === null || value === undefined || value === ''){
    return '-'
  }

  if(format === 'money'){
    return Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  }

  if(format === 'percent'){
    return `${value}%`
  }

  return value
}

function getSavedHistory(storageKey){
  try{
    const saved = JSON.parse(localStorage.getItem(storageKey)) || []
    return saved.filter((item)=>findReport(item.reportType))
  }
  catch{
    return []
  }
}

function Reports(){
  const { user } = useRole()
  const today = new Date().toLocaleDateString('en-CA')
  const storageKey = 'reportHistory-' + user.username

  const [reportType, setReportType] = useState(reportTypes[0].id)
  const [reportFormat, setReportFormat] = useState(reportTypes[0].formats[0])
  const [selectedColumns, setSelectedColumns] = useState(reportTypes[0].columns.map((col)=>col.key))
  const [viewingId, setViewingId] = useState(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [history, setHistory] = useState(()=>getSavedHistory(storageKey))
  const [message, setMessage] = useState('')

  const selectedReport = findReport(reportType)
  const formatOptions = [...selectedReport.formats, 'table']

  const saveHistory = (newHistory)=>{
    try{
      localStorage.setItem(storageKey, JSON.stringify(newHistory))
    }
    catch{
      setMessage('Report loaded, but it is too large to save in this browser.')
    }
  }

  const resetFilters = (report)=>{
    setStartDate('')
    setEndDate('')
    setSelectedColumns(report.columns.map((col)=>col.key))
    setMessage('')
  }

  const handleTypeChange = (e)=>{
    const newReport = findReport(e.target.value)

    setReportType(newReport.id)
    setReportFormat(newReport.formats[0] || 'table')
    resetFilters(newReport)
  }

  const handleColumnToggle = (columnKey)=>{
    if(selectedColumns.includes(columnKey)){
      if(selectedColumns.length > 1){
        setSelectedColumns(selectedColumns.filter((key)=>key !== columnKey))
      }
    }
    else{
      setSelectedColumns([...selectedColumns, columnKey])
    }
  }

  const handleSubmit = async (e)=>{
    e.preventDefault()
    setMessage('')

    if(selectedReport.usesDates){
      if((startDate && startDate > today) || (endDate && endDate > today)){
        setMessage('Dates cannot be in the future.')
        return
      }

      if(startDate && endDate && startDate > endDate){
        setMessage('Start date cannot be after the end date.')
        return
      }
    }

    const query = selectedReport.usesDates ? `?start=${startDate}&end=${endDate}` : ''
    let data

    try{
      data = await callApi('/api/reports/' + reportType + query, 'GET')
    }
    catch(err){
      setMessage('Could not load report: ' + err.message)
      return
    }

    const newReport = {
      id: Date.now(),
      reportType: reportType,
      name: selectedReport.name,
      format: reportFormat,
      startDate: selectedReport.usesDates ? startDate || 'All dates' : '-',
      endDate: selectedReport.usesDates ? endDate || 'All dates' : '-',
      runAt: new Date().toLocaleString(),
      rows: data,
      activeColumns: selectedColumns,
    }

    const newHistory = [newReport, ...history].slice(0, MAX_HISTORY)
    saveHistory(newHistory)
    setHistory(newHistory)
    setViewingId(newReport.id)
  }

  const exportReport = (item)=>{
    const report = findReport(item.reportType)
    const columns = report.columns.filter((col)=>(item.activeColumns || []).includes(col.key))

    if(item.rows.length === 0){
      setMessage('This report has no data to export.')
      return
    }

    const lines = [
      columns.map((col)=>col.label),
      ...item.rows.map((row)=>columns.map((col)=>row[col.key])),
    ]

    const csv = lines
      .map((line)=>line.map((value)=>`"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url
    link.download = item.reportType + '-report.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const { selectedRows: selectedReports, isSelected, toggle, clear } = useSelection(history, (item)=>item.id)

  const deleteSelected = ()=>{
    const question = selectedReports.length > 1
      ? `Are you sure you want to delete these ${selectedReports.length} reports?`
      : 'Are you sure you want to delete this report?'

    if(!window.confirm(question)){
      return
    }

    const newHistory = history.filter((item)=>!isSelected(item.id))
    saveHistory(newHistory)
    setHistory(newHistory)

    if(selectedReports.some((item)=>item.id === viewingId)){
      setViewingId(null)
    }

    clear()
  }

  const clearHistory = ()=>{
    if(!window.confirm('Are you sure you want to delete all saved reports?')){
      return
    }

    localStorage.removeItem(storageKey)
    setHistory([])
    setViewingId(null)
    clear()
  }

  const viewingItem = history.find((item)=>item.id === viewingId)
  const viewingReport = viewingItem ? findReport(viewingItem.reportType) : null
  const viewingKeys = viewingItem?.activeColumns || []
  const viewingColumns = viewingReport ? viewingReport.columns.filter((col)=>viewingKeys.includes(col.key)) : []
  const showCharts = viewingItem && viewingItem.format !== 'table' && viewingReport?.charts

  return (
    <div className="page page-wide reports-page">
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
      </div>

      <div className="card report-request-panel">
        <h2 className="module-title">Run a Report</h2>

        <form className="report-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="report-type">Report Type</label>
            <select id="report-type" className="input" value={reportType} onChange={handleTypeChange}>
              {reportTypes.map((report)=>(
                <option key={report.id} value={report.id}>{report.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="report-format">Format</label>
            <select
              id="report-format"
              className="input"
              value={reportFormat}
              onChange={(e)=>setReportFormat(e.target.value)}
              disabled={formatOptions.length === 1}
            >
              {formatOptions.map((format)=>(
                <option key={format} value={format}>{formatNames[format]}</option>
              ))}
            </select>
          </div>

          <div className="form-group span-2">
            <span className="field-label">Columns to Include</span>
            <div className="report-columns">
              {selectedReport.columns.map((column)=>(
                <label key={column.key} className="report-column">
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(column.key)}
                    onChange={()=>handleColumnToggle(column.key)}
                  />
                  {column.label}
                </label>
              ))}
            </div>
          </div>

          {selectedReport.usesDates && (
            <>
              <div className="form-group">
                <label htmlFor="report-start">Start Date</label>
                <input
                  id="report-start"
                  className="input"
                  type="date"
                  max={today}
                  value={startDate}
                  onChange={(e)=>setStartDate(e.target.value)}
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
                  onChange={(e)=>setEndDate(e.target.value)}
                />
              </div>
            </>
          )}

          {message && <p className="form-error span-2" role="alert">{message}</p>}

          <div className="report-form-actions">
            <button type="button" className="btn secondary" onClick={()=>resetFilters(selectedReport)}>
              Reset
            </button>
            <button type="submit" className="btn primary">
              Run Report
            </button>
          </div>
        </form>
      </div>

      {viewingItem && viewingReport && (
        <div className="card report-viewer">
          <div className="report-viewer-header">
            <div>
              <h2 className="module-title">{viewingItem.name}</h2>
              <p className="report-viewer-meta">
                {formatNames[viewingItem.format]}
                {viewingReport.usesDates && ` · ${viewingItem.startDate} to ${viewingItem.endDate}`}
                {` · ${viewingItem.rows.length} rows`}
              </p>
            </div>

            <div className="page-header-actions">
              <button type="button" className="btn secondary" onClick={()=>exportReport(viewingItem)}>
                Export CSV
              </button>
              <button type="button" className="btn secondary" onClick={()=>setViewingId(null)}>
                Close
              </button>
            </div>
          </div>

          {showCharts && (
            <div className="report-charts">
              {viewingReport.charts.map((chart)=>{
                const series = chart.series.filter((item)=>viewingKeys.includes(item.key))
                const rows = chart.store
                  ? viewingItem.rows.filter((row)=>row.Store === chart.store)
                  : viewingItem.rows

                if(series.length === 0){
                  return null
                }

                return (
                  <section key={chart.title} className="report-chart">
                    <h3>{chart.title}</h3>
                    <Chart
                      type={viewingItem.format}
                      data={rows}
                      labelKey={viewingReport.labelKey}
                      series={series}
                      prefix={chart.prefix || ''}
                      suffix={chart.suffix || ''}
                    />
                  </section>
                )
              })}
            </div>
          )}

          <div className="table-wrap">
            <table className="data-table">
              <caption className="sr-only">Report data</caption>
              <thead>
                <tr>
                  {viewingColumns.map((column)=>(
                    <th key={column.key} scope="col">{column.label}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {viewingItem.rows.map((row, index)=>(
                  <tr key={index}>
                    {viewingColumns.map((column)=>(
                      <td key={column.key} className="report-cell">
                        {formatCell(row[column.key], column.format)}
                      </td>
                    ))}
                  </tr>
                ))}

                {viewingItem.rows.length === 0 && (
                  <tr>
                    <td colSpan={viewingColumns.length} className="empty">No data for this report.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <>
          <div className="report-section-header">
            <h2 className="section-label">Saved Reports</h2>

            <div className="page-header-actions">
              {selectedReports.length === 1 && (
                <button type="button" className="btn secondary" onClick={()=>setViewingId(selectedReports[0].id)}>
                  View
                </button>
              )}

              {selectedReports.length > 0 && (
                <>
                  <button type="button" className="btn secondary" onClick={()=>selectedReports.forEach(exportReport)}>
                    Export CSV
                  </button>
                  <button type="button" className="btn danger" onClick={deleteSelected}>
                    Delete
                  </button>
                </>
              )}

              <button type="button" className="btn secondary" onClick={clearHistory}>
                Clear All
              </button>
            </div>
          </div>

          <div className="card table-wrap report-section">
            <table className={'data-table' + (selectedReports.length > 0 ? ' selecting' : '')}>
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
                  <th scope="col">Created</th>
                </tr>
              </thead>

              <tbody>
                {history.map((item)=>(
                  <tr key={item.id} className={isSelected(item.id) ? 'selected-row' : ''}>
                    <td className="select-col">
                      <input
                        type="checkbox"
                        checked={isSelected(item.id)}
                        onChange={()=>toggle(item.id)}
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