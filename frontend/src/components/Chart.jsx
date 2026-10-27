const colors = [
  '#1a3c6e', '#c8962e', '#1a7b4e', '#b0271a', '#6b6a78',
  '#3f7cc4', '#e0b04a', '#4fa37a', '#d9604f', '#9a99a6',
]

const width = 640
const left = 70
const right = 16
const top = 24
const plotWidth = width - left - right
const plotHeight = 220

function formatValue(value, prefix, suffix){
  const text = Number(value).toLocaleString('en-US', {
    maximumFractionDigits: 2,
  })

  return prefix + text + suffix
}

function getScale(data, series){
  let max = 0

  for(const row of data){
    for(const item of series){
      max = Math.max(max, Number(row[item.key]) || 0)
    }
  }

  if(max === 0){
    return { max: 1, step: 0.25 }
  }

  const rough = max / 4
  const power = Math.pow(10, Math.floor(Math.log10(rough)))
  const step = [1, 2, 2.5, 5, 10].map((n)=>n * power).find((n)=>n >= rough)

  return { max: step * Math.ceil(max / step), step: step }
}

function shorten(text, length){
  const value = String(text ?? '')
  return value.length > length ? value.slice(0, length - 1) + '…' : value
}

function getLabelLayout(data, labelKey){
  const groupWidth = plotWidth / data.length
  const longest = Math.max(...data.map((row)=>String(row[labelKey] ?? '').length))
  const fitsFlat = longest * 6.2 <= groupWidth - 6

  if(fitsFlat){
    return { tilted: false, maxChars: longest, bottom: 34 }
  }

  return { tilted: true, maxChars: 18, bottom: 96 }
}

function Axes({ data, labelKey, scale, prefix, suffix, layout }){
  const groupWidth = plotWidth / data.length
  const ticks = []

  const count = Math.round(scale.max / scale.step)

  for(let i = 0; i <= count; i++){
    ticks.push(Number((scale.step * i).toFixed(6)))
  }

  return (
    <g>
      {ticks.map((value)=>{
        const y = top + plotHeight - (value / scale.max) * plotHeight

        return (
          <g key={value}>
            <line x1={left} x2={left + plotWidth} y1={y} y2={y} stroke="#e8e5df" />
            <text x={left - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#6b6a78">
              {formatValue(value, prefix, suffix)}
            </text>
          </g>
        )
      })}

      {data.map((row, index)=>{
        const x = left + groupWidth * index + groupWidth / 2
        const y = top + plotHeight + 18
        const label = String(row[labelKey] ?? '')

        return (
          <text
            key={index}
            x={x}
            y={y}
            fontSize="12"
            fill="#1c1c2a"
            textAnchor={layout.tilted ? 'end' : 'middle'}
            transform={layout.tilted ? `rotate(-35 ${x} ${y})` : undefined}
          >
            <title>{label}</title>
            {shorten(label, layout.maxChars)}
          </text>
        )
      })}
    </g>
  )
}

function BarChart({ data, labelKey, series, prefix, suffix }){
  const scale = getScale(data, series)
  const layout = getLabelLayout(data, labelKey)
  const height = top + plotHeight + layout.bottom
  const groupWidth = plotWidth / data.length
  const barWidth = Math.min((groupWidth * 0.7) / series.length, 56)
  const groupPadding = (groupWidth - barWidth * series.length) / 2
  const showValues = data.length <= 8 && series.length === 1

  return (
    <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} role="img">
      <Axes data={data} labelKey={labelKey} scale={scale} prefix={prefix} suffix={suffix} layout={layout} />

      {data.map((row, rowIndex)=>series.map((item, seriesIndex)=>{
        const value = Number(row[item.key]) || 0
        const barHeight = (value / scale.max) * plotHeight
        const x = left + groupWidth * rowIndex + groupPadding + barWidth * seriesIndex
        const y = top + plotHeight - barHeight

        return (
          <g key={rowIndex + '-' + item.key}>
            <rect x={x} y={y} width={barWidth} height={barHeight} rx="3" fill={colors[seriesIndex]}>
              <title>{row[labelKey]} - {item.label}: {formatValue(value, prefix, suffix)}</title>
            </rect>

            {showValues && (
              <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fontSize="11" fill="#1c1c2a">
                {formatValue(value, prefix, suffix)}
              </text>
            )}
          </g>
        )
      }))}
    </svg>
  )
}

function LineChart({ data, labelKey, series, prefix, suffix }){
  const scale = getScale(data, series)
  const layout = getLabelLayout(data, labelKey)
  const height = top + plotHeight + layout.bottom
  const groupWidth = plotWidth / data.length

  return (
    <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} role="img">
      <Axes data={data} labelKey={labelKey} scale={scale} prefix={prefix} suffix={suffix} layout={layout} />

      {series.map((item, seriesIndex)=>{
        const points = data.map((row, rowIndex)=>({
          x: left + groupWidth * rowIndex + groupWidth / 2,
          y: top + plotHeight - ((Number(row[item.key]) || 0) / scale.max) * plotHeight,
          value: Number(row[item.key]) || 0,
          row: row,
        }))

        return (
          <g key={item.key}>
            <polyline
              points={points.map((point)=>point.x + ',' + point.y).join(' ')}
              fill="none"
              stroke={colors[seriesIndex]}
              strokeWidth="2.5"
            />

            {points.map((point, pointIndex)=>(
              <circle key={pointIndex} cx={point.x} cy={point.y} r="4" fill={colors[seriesIndex]}>
                <title>{point.row[labelKey]} - {item.label}: {formatValue(point.value, prefix, suffix)}</title>
              </circle>
            ))}
          </g>
        )
      })}
    </svg>
  )
}

function PieChart({ data, labelKey, series, prefix, suffix }){
  const key = series[0].key
  const center = 150
  const radius = 130
  const total = data.reduce((sum, row)=>sum + (Number(row[key]) || 0), 0)

  let startAngle = -Math.PI / 2

  const slices = data.map((row, index)=>{
    const value = Number(row[key]) || 0
    const angle = (value / total) * Math.PI * 2
    const slice = {
      label: row[labelKey],
      value: value,
      percent: Math.round((value / total) * 1000) / 10,
      color: colors[index % colors.length],
      startAngle: startAngle,
      endAngle: startAngle + angle,
      angle: angle,
    }

    startAngle = startAngle + angle
    return slice
  })

  return (
    <div className="chart-pie">
      <svg className="chart-pie-svg" viewBox="0 0 300 300" role="img">
        {slices.map((slice, index)=>{
          if(slice.value === 0){
            return null
          }

          if(slice.angle > Math.PI * 2 - 0.0001){
            return <circle key={index} cx={center} cy={center} r={radius} fill={slice.color} />
          }

          const x1 = center + radius * Math.cos(slice.startAngle)
          const y1 = center + radius * Math.sin(slice.startAngle)
          const x2 = center + radius * Math.cos(slice.endAngle)
          const y2 = center + radius * Math.sin(slice.endAngle)
          const largeArc = slice.angle > Math.PI ? 1 : 0
          const path = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`

          return (
            <path key={index} d={path} fill={slice.color} stroke="#ffffff" strokeWidth="2">
              <title>{slice.label}: {formatValue(slice.value, prefix, suffix)} ({slice.percent}%)</title>
            </path>
          )
        })}
      </svg>

      <ul className="chart-pie-legend">
        {slices.map((slice, index)=>(
          <li key={index}>
            <span className="chart-swatch" style={{ background: slice.color }} />
            <span className="chart-pie-name" title={slice.label}>{slice.label}</span>
            <span className="chart-pie-value">
              {formatValue(slice.value, prefix, suffix)} · {slice.percent}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Chart({ type, title, data, labelKey, series, prefix = '', suffix = '' }){
  const hasValues = data.some((row)=>series.some((item)=>Number(row[item.key]) > 0))

  return (
    <div className="chart-card">
      {title && <h3 className="chart-title">{title}</h3>}

      {!hasValues && <p className="empty">No data for this date range.</p>}

      {hasValues && type === 'bar' && (
        <BarChart data={data} labelKey={labelKey} series={series} prefix={prefix} suffix={suffix} />
      )}

      {hasValues && type === 'line' && (
        <LineChart data={data} labelKey={labelKey} series={series} prefix={prefix} suffix={suffix} />
      )}

      {hasValues && type === 'pie' && (
        <PieChart data={data} labelKey={labelKey} series={series} prefix={prefix} suffix={suffix} />
      )}

      {hasValues && type !== 'pie' && series.length > 1 && (
        <div className="chart-legend">
          {series.map((item, index)=>(
            <span key={item.key} className="chart-legend-item">
              <span className="chart-swatch" style={{ background: colors[index] }} />
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default Chart