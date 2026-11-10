import { useState } from 'react'
import { callApi } from '../api'
import { useRole } from '../context/role'
import Chart from '../components/Chart'
import { useSelection } from '../hooks/useSelection'
import { Modal } from '../components/ui'

const MAX_HISTORY = 10

const formatNames = {
  table: 'Table',
  bar: 'Bar Chart',
  pie: 'Pie Chart',
}

const reportTypes = [
  {
    id: 'revenue',
    name: 'Revenue & Financial Trends',
    formats: ['bar', 'pie'],
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
    // Month + Total stay in the table; picker only toggles the breakdown columns.
    fixedStartColumns: [{ key: 'Month', label: 'Month', title: 'Month' }],
    fixedEndColumns: [
      { key: 'Revenue', label: 'Total', format: 'money', title: 'Total Revenue' },
    ],
    columns: [
      { key: 'TicketRevenue', label: 'Tickets', format: 'money', title: 'Ticket Revenue' },
      { key: 'GiftShopRevenue', label: 'Gift', format: 'money', title: 'Gift Shop Revenue' },
      { key: 'CafeRevenue', label: 'Café', format: 'money', title: 'Café Revenue' },
      { key: 'MembershipRevenue', label: 'Memb.', format: 'money', title: 'Membership Revenue' },
      { key: 'DonationRevenue', label: 'Donat.', format: 'money', title: 'Donation Revenue' },
      { key: 'TotalVisitors', label: 'Visitors', title: 'Total Visitors' },
      { key: 'AvgSpendPerVisitor', label: 'Avg Spend', format: 'money', title: 'Avg Spend per Visitor' },
      { key: 'MonthOverMonthGrowth', label: 'Growth', format: 'percent', title: 'Monthly Growth' },
    ],
  },
  {
    id: 'ticket-sales',
    name: 'Ticket Sales & Exhibition Capacity',
    formats: ['bar', 'pie'],
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
    fixedStartColumns: [
      { key: 'Name', label: 'Exhibition', title: 'Exhibition' },
    ],
    fixedEndColumns: [
      { key: 'Revenue', label: 'Total', format: 'money', title: 'Total Revenue' },
    ],
    columns: [
      { key: 'AdultTickets', label: 'Adult #', title: 'Adult Tickets' },
      { key: 'AdultRevenue', label: 'Adult $', format: 'money', title: 'Adult Revenue' },
      { key: 'SeniorTickets', label: 'Senior #', title: 'Senior Tickets' },
      { key: 'SeniorRevenue', label: 'Senior $', format: 'money', title: 'Senior Revenue' },
      { key: 'StudentTickets', label: 'Student #', title: 'Student Tickets' },
      { key: 'StudentRevenue', label: 'Student $', format: 'money', title: 'Student Revenue' },
      { key: 'ChildTickets', label: 'Child #', title: 'Child Tickets' },
      { key: 'ChildRevenue', label: 'Child $', format: 'money', title: 'Child Revenue' },
      { key: 'TicketsSold', label: 'Sold', title: 'Tickets Sold' },
      { key: 'Capacity', label: 'Cap.', title: 'Capacity' },
      { key: 'PercentFull', label: 'Full %', format: 'percent', title: 'Percent Full' },
      { key: 'AvgTicketPrice', label: 'Avg Price', format: 'money', title: 'Avg Ticket Price' },
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
    tableGroups: [
      { title: 'Gift Shop', store: 'Gift Shop' },
      { title: 'Café', store: 'Café' },
    ],
    fixedStartColumns: [{ key: 'ItemName', label: 'Item', title: 'Item' }],
    fixedEndColumns: [
      { key: 'Revenue', label: 'Revenue', format: 'money', title: 'Revenue' },
    ],
    columns: [
      { key: 'Category', label: 'Category', title: 'Category' },
      { key: 'ListPrice', label: 'List $', format: 'money', title: 'List Price' },
      { key: 'SaleCount', label: 'Sales', title: 'Sales' },
      { key: 'UnitsSold', label: 'Units', title: 'Units Sold' },
      { key: 'AvgSalePrice', label: 'Avg $', format: 'money', title: 'Avg Sale Price' },
      { key: 'PercentOfTotal', label: 'Share %', format: 'percent', title: 'Share of Store Revenue' },
    ],
  },
]

function findReport(id){
  return reportTypes.find((type)=>type.id === id)
}

function formatLocalDate(date){
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// First day of the month 11 months ago through today = exactly 12 calendar months.
function getLast12MonthsRange(){
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth() - 11, 1)
  return {
    start: formatLocalDate(start),
    end: formatLocalDate(today),
  }
}

function getTableColumns(report, activeKeys){
  const keys = activeKeys || report.columns.map((col)=>col.key)
  const selected = report.columns.filter((col)=>keys.includes(col.key))
  const start = report.fixedStartColumns || []
  const end = report.fixedEndColumns || []

  return start.concat(selected, end)
}

const revenueSources = [
  'TicketRevenue',
  'GiftShopRevenue',
  'CafeRevenue',
  'MembershipRevenue',
  'DonationRevenue',
]

const ticketTypeRevenues = [
  'AdultRevenue',
  'SeniorRevenue',
  'StudentRevenue',
  'ChildRevenue',
]

const ticketTypeCounts = [
  'AdultTickets',
  'SeniorTickets',
  'StudentTickets',
  'ChildTickets',
]

function roundMoney(value){
  return Math.round(Number(value || 0) * 100) / 100
}

function sumSelectedFields(row, keys){
  let total = 0

  for(const key of keys){
    total = total + Number(row[key] || 0)
  }

  return total
}

// Recalculate totals / derived metrics from the columns the user included.
function applyActiveColumns(reportType, rows, activeKeys){
  const keys = activeKeys || []

  if(reportType === 'revenue'){
    const selectedSources = revenueSources.filter((key)=>keys.includes(key))
    const adjusted = rows.map((row)=>{
      const next = { ...row }

      if(selectedSources.length > 0){
        next.Revenue = roundMoney(sumSelectedFields(row, selectedSources))
      }

      const visitors = Number(row.TotalVisitors || 0)
      next.AvgSpendPerVisitor = visitors > 0
        ? roundMoney(next.Revenue / visitors)
        : 0

      return next
    })

    let prevRevenue = null

    for(const row of adjusted){
      if(prevRevenue === null || prevRevenue === 0){
        row.MonthOverMonthGrowth = null
      }
      else{
        row.MonthOverMonthGrowth =
          Math.round(((row.Revenue - prevRevenue) / prevRevenue) * 1000) / 10
      }

      prevRevenue = row.Revenue
    }

    return adjusted
  }

  if(reportType === 'ticket-sales'){
    const selectedRevenues = ticketTypeRevenues.filter((key)=>keys.includes(key))
    const selectedCounts = ticketTypeCounts.filter((key)=>keys.includes(key))

    return rows.map((row)=>{
      const next = { ...row }

      if(selectedRevenues.length > 0){
        next.Revenue = roundMoney(sumSelectedFields(row, selectedRevenues))
      }

      if(selectedCounts.length > 0){
        next.TicketsSold = sumSelectedFields(row, selectedCounts)
      }

      const capacity = Number(row.Capacity || 0)
      next.PercentFull = capacity > 0
        ? Math.round((next.TicketsSold / capacity) * 1000) / 10
        : 0
      next.AvgTicketPrice = next.TicketsSold > 0
        ? roundMoney(next.Revenue / next.TicketsSold)
        : 0

      return next
    })
  }

  if(reportType === 'giftshop-cafe'){
    // Share % and averages stay row-level; if UnitsSold is hidden, charts/summary omit it.
    return rows
  }

  return rows
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

function moneyText(value){
  return Number(value || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
}

function sumField(rows, key){
  let total = 0

  for(const row of rows){
    total = total + Number(row[key] || 0)
  }

  return total
}

function averageField(rows, key){
  if(rows.length === 0){
    return 0
  }

  return sumField(rows, key) / rows.length
}

function getReportSummary(reportType, rows, activeKeys){
  const keys = activeKeys || []

  if(reportType === 'revenue'){
    const stats = [
      { label: 'Total Revenue', value: moneyText(sumField(rows, 'Revenue')) },
    ]

    if(keys.includes('TotalVisitors')){
      stats.push({
        label: 'Visitors',
        value: Math.round(sumField(rows, 'TotalVisitors')).toLocaleString(),
      })
    }

    if(keys.includes('AvgSpendPerVisitor')){
      stats.push({
        label: 'Avg Spend / Visitor',
        value: moneyText(averageField(rows, 'AvgSpendPerVisitor')),
      })
    }

    stats.push({ label: 'Months', value: String(rows.length) })
    return stats
  }

  if(reportType === 'ticket-sales'){
    const ticketsSold = sumField(rows, 'TicketsSold')
    const capacity = sumField(rows, 'Capacity')
    const stats = []

    if(keys.includes('TicketsSold') || ticketTypeCounts.some((key)=>keys.includes(key))){
      stats.push({
        label: 'Tickets Sold',
        value: Math.round(ticketsSold).toLocaleString(),
      })
    }

    stats.push({
      label: 'Ticket Revenue',
      value: moneyText(sumField(rows, 'Revenue')),
    })

    if(keys.includes('AdultTickets') || keys.includes('StudentTickets')){
      stats.push({
        label: 'Adult / Student',
        value:
          Math.round(sumField(rows, 'AdultTickets')).toLocaleString() +
          ' / ' +
          Math.round(sumField(rows, 'StudentTickets')).toLocaleString(),
      })
    }

    if(keys.includes('Capacity') || keys.includes('PercentFull') || keys.includes('TicketsSold')){
      stats.push({
        label: 'Avg Fill',
        value: capacity > 0
          ? `${Math.round((ticketsSold / capacity) * 1000) / 10}%`
          : '0%',
      })
    }

    return stats
  }

  if(reportType === 'giftshop-cafe'){
    const giftShop = rows.filter((row)=>row.Store === 'Gift Shop')
    const cafe = rows.filter((row)=>row.Store === 'Café' || row.Store === 'Cafe')
    const stats = [
      { label: 'Total Sales', value: moneyText(sumField(rows, 'Revenue')) },
    ]

    if(keys.includes('UnitsSold')){
      stats.push({
        label: 'Units Sold',
        value: Math.round(sumField(rows, 'UnitsSold')).toLocaleString(),
      })
    }

    stats.push(
      { label: 'Gift Shop', value: moneyText(sumField(giftShop, 'Revenue')) },
      { label: 'Café', value: moneyText(sumField(cafe, 'Revenue')) },
    )

    return stats
  }

  return [
    { label: 'Rows', value: String(rows.length) },
  ]
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

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteMode, setDeleteMode] = useState('selected') 
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

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

    let query = ''
    let rangeStart = startDate
    let rangeEnd = endDate

    if(selectedReport.usesDates){
      if(!startDate && !endDate){
        const range = getLast12MonthsRange()
        rangeStart = range.start
        rangeEnd = range.end
      }
      query = `?start=${rangeStart}&end=${rangeEnd}`
    }

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
      startDate: selectedReport.usesDates
        ? startDate || `Last 12 months (${rangeStart})`
        : '-',
      endDate: selectedReport.usesDates ? endDate || rangeEnd : '-',
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
    const columns = getTableColumns(report, item.activeColumns)
    const exportRows = applyActiveColumns(
      item.reportType,
      item.rows,
      item.activeColumns || report.columns.map((col)=>col.key)
    )

    if(exportRows.length === 0){
      setMessage('This report has no data to export.')
      return
    }

    const lines = [
      columns.map((col)=>col.title || col.label),
      ...exportRows.map((row)=>columns.map((col)=>row[col.key])),
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

  const openDeleteSelectedModal = () => {
    if(selectedReports.length === 0) return
    setDeleteMode('selected')
    setDeleteError('')
    setDeleteModalOpen(true)
  }

  const openClearAllModal = () => {
    setDeleteMode('all')
    setDeleteError('')
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    setDeleting(true)
    setDeleteError('')

    try {
      if(deleteMode === 'selected'){
        const newHistory = history.filter((item)=>!isSelected(item.id))
        saveHistory(newHistory)
        setHistory(newHistory)

        if(selectedReports.some((item)=>item.id === viewingId)){
          setViewingId(null)
        }

        clear()
      } else {
        localStorage.removeItem(storageKey)
        setHistory([])
        setViewingId(null)
        clear()
      }
      setDeleteModalOpen(false)
    } catch (err) {
      setDeleteError('Could not delete reports: ' + err.message)
    } finally {
      setDeleting(false)
    }
  }

  const viewingItem = history.find((item)=>item.id === viewingId)
  const viewingReport = viewingItem ? findReport(viewingItem.reportType) : null
  const viewingKeys = viewingItem?.activeColumns || viewingReport?.columns.map((col)=>col.key) || []
  const viewingColumns = viewingReport ? getTableColumns(viewingReport, viewingKeys) : []
  const viewingRows = viewingItem
    ? applyActiveColumns(viewingItem.reportType, viewingItem.rows, viewingKeys)
    : []
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

          <div className="dash-stat-grid report-summary-grid">
            {getReportSummary(viewingItem.reportType, viewingRows, viewingKeys).map((stat)=>(
              <div key={stat.label} className="card dash-stat-card">
                <div className="dash-stat-label">{stat.label}</div>
                <div className="dash-stat-value">{stat.value}</div>
              </div>
            ))}
          </div>

          {showCharts && (
            <div className="report-charts">
              {viewingReport.charts.map((chart)=>{
                const chartKeys = viewingColumns.map((col)=>col.key)
                const series = chart.series.filter((item)=>chartKeys.includes(item.key))
                const rows = chart.store
                  ? viewingRows.filter((row)=>row.Store === chart.store)
                  : viewingRows

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

          {(viewingReport.tableGroups || [{ title: 'Report data', store: null }]).map((group)=>{
            const groupRows = group.store
              ? viewingRows.filter((row)=>row.Store === group.store)
              : viewingRows

            return (
              <div key={group.title} className="report-table-group">
                {viewingReport.tableGroups && (
                  <h3 className="report-table-title">{group.title}</h3>
                )}

                <div className="table-wrap">
                  <table className="data-table report-table-compact">
                    <caption className="sr-only">{group.title}</caption>
                    <thead>
                      <tr>
                        {viewingColumns.map((column)=>(
                          <th
                            key={column.key}
                            scope="col"
                            title={column.title || column.label}
                          >
                            {column.label}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {groupRows.map((row, index)=>(
                        <tr key={index}>
                          {viewingColumns.map((column)=>(
                            <td key={column.key} className="report-cell center-cell">
                              {formatCell(row[column.key], column.format)}
                            </td>
                          ))}
                        </tr>
                      ))}

                      {groupRows.length === 0 && (
                        <tr>
                          <td colSpan={viewingColumns.length} className="empty">
                            No data for this report.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
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
                  <button type="button" className="btn danger" onClick={openDeleteSelectedModal}>
                    Delete
                  </button>
                </>
              )}

              <button type="button" className="btn secondary" onClick={openClearAllModal}>
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

      <Modal
        open={deleteModalOpen}
        title={deleteMode === 'selected' ? (selectedReports.length > 1 ? 'Delete Reports' : 'Delete Report') : 'Clear All Reports'}
        onClose={() => setDeleteModalOpen(false)}
      >
        <div className="form-grid">
          {deleteError && (
            <p className="form-error form-full" role="alert">
              {deleteError}
            </p>
          )}

          <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', margin: '0 0 16px', gridColumn: '1 / -1' }}>
            {deleteMode === 'selected'
              ? (selectedReports.length > 1
                  ? `Are you sure you want to delete these ${selectedReports.length} reports? This action cannot be undone.`
                  : 'Are you sure you want to delete this report? This action cannot be undone.')
              : 'Are you sure you want to delete all saved reports? This action cannot be undone.'}
          </p>

          <div className="form-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn danger"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : (deleteMode === 'selected' ? 'Delete' : 'Clear All')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Reports