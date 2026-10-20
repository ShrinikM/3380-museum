const colors = ['#1a3c6e', '#c8962e', '#1a7b4e', '#b0271a', '#6b6a78']

const width = 640
const height = 320
const left = 64
const right = 20
const top = 20
const bottom = 64
const plotWidth = width - left - right
const plotHeight = height - top - bottom

function formatValue(value, prefix, suffix) {
  const text = Number(value).toLocaleString('en-US', {
    maximumFractionDigits: 2,
  })

  return prefix + text + suffix
}

function shortLabel(label) {
  const text = String(label)

  if (text.length > 14) {
    return text.slice(0, 13) + '…'
  }

  return text
}

function getMax(data, series) {
  let max = 0

  for (const row of data) {
    for (const item of series) {
      if (Number(row[item.key]) > max) {
        max = Number(row[item.key])
      }
    }
  }

  if (max === 0) {
    return 1
  }

  return max * 1.1
}

function Axes({ data, labelKey, max, prefix, suffix }) {
  const ticks = [0, 1, 2, 3, 4]
  const groupWidth = plotWidth / data.length

  return (
    <g>
      {ticks.map((tick) => {
        const value = (max / 4) * tick
        const y = top + plotHeight - (plotHeight / 4) * tick

        return (
          <g key={tick}>
            <line
              x1={left}
              x2={left + plotWidth}
              y1={y}
              y2={y}
              stroke="#e3e0da"
            />
            <text
              x={left - 8}
              y={y + 4}
              textAnchor="end"
              fontSize="11"
              fill="#6b6a78"
            >
              {formatValue(value, prefix, suffix)}
            </text>
          </g>
        )
      })}

      {data.map((row, index) => {
        const x = left + groupWidth * index + groupWidth / 2

        return (
          <text
            key={index}
            x={x}
            y={top + plotHeight + 20}
            textAnchor="middle"
            fontSize="11"
            fill="#1c1c2a"
          >
            {shortLabel(row[labelKey])}
          </text>
        )
      })}
    </g>
  )
}

function BarChart({ data, labelKey, series, prefix, suffix }) {
  const max = getMax(data, series)
  const groupWidth = plotWidth / data.length
  const barWidth = (groupWidth * 0.7) / series.length

  return (
    <svg
      className="chart-svg"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
    >
      <Axes
        data={data}
        labelKey={labelKey}
        max={max}
        prefix={prefix}
        suffix={suffix}
      />

      {data.map((row, rowIndex) => {
        return series.map((item, seriesIndex) => {
          const value = Number(row[item.key])
          const barHeight = (value / max) * plotHeight
          const x =
            left +
            groupWidth * rowIndex +
            groupWidth * 0.15 +
            barWidth * seriesIndex
          const y = top + plotHeight - barHeight

          return (
            <g key={rowIndex + '-' + item.key}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={colors[seriesIndex]}
              >
                <title>
                  {row[labelKey]} - {item.label}:{' '}
                  {formatValue(value, prefix, suffix)}
                </title>
              </rect>

              {data.length <= 8 && series.length === 1 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#1c1c2a"
                >
                  {formatValue(value, prefix, suffix)}
                </text>
              )}
            </g>
          )
        })
      })}
    </svg>
  )
}

function LineChart({ data, labelKey, series, prefix, suffix }) {
  const max = getMax(data, series)
  const groupWidth = plotWidth / data.length

  return (
    <svg
      className="chart-svg"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
    >
      <Axes
        data={data}
        labelKey={labelKey}
        max={max}
        prefix={prefix}
        suffix={suffix}
      />

      {series.map((item, seriesIndex) => {
        const points = data.map((row, rowIndex) => {
          const x = left + groupWidth * rowIndex + groupWidth / 2
          const y = top + plotHeight - (Number(row[item.key]) / max) * plotHeight

          return { x: x, y: y, value: Number(row[item.key]), row: row }
        })

        const pointText = points
          .map((point) => point.x + ',' + point.y)
          .join(' ')

        return (
          <g key={item.key}>
            <polyline
              points={pointText}
              fill="none"
              stroke={colors[seriesIndex]}
              strokeWidth="2.5"
            />

            {points.map((point, pointIndex) => (
              <circle
                key={pointIndex}
                cx={point.x}
                cy={point.y}
                r="4"
                fill={colors[seriesIndex]}
              >
                <title>
                  {point.row[labelKey]} - {item.label}:{' '}
                  {formatValue(point.value, prefix, suffix)}
                </title>
              </circle>
            ))}
          </g>
        )
      })}
    </svg>
  )
}

function PieChart({ data, labelKey, series, prefix, suffix }) {
  const key = series[0].key
  const centerX = 160
  const centerY = 160
  const radius = 130

  let total = 0
  for (const row of data) {
    total = total + Number(row[key])
  }

  const slices = []
  let startAngle = -Math.PI / 2

  data.forEach((row, index) => {
    const value = Number(row[key])
    const angle = (value / total) * Math.PI * 2
    const endAngle = startAngle + angle

    slices.push({
      label: row[labelKey],
      value: value,
      percent: Math.round((value / total) * 1000) / 10,
      color: colors[index % colors.length],
      startAngle: startAngle,
      endAngle: endAngle,
      angle: angle,
    })

    startAngle = endAngle
  })

  return (
    <div className="chart-pie">
      <svg className="chart-pie-svg" viewBox="0 0 320 320" role="img">
        {slices.map((slice, index) => {
          if (slice.value === 0) {
            return null
          }

          if (slice.angle > Math.PI * 2 - 0.0001) {
            return (
              <circle
                key={index}
                cx={centerX}
                cy={centerY}
                r={radius}
                fill={slice.color}
              />
            )
          }

          const x1 = centerX + radius * Math.cos(slice.startAngle)
          const y1 = centerY + radius * Math.sin(slice.startAngle)
          const x2 = centerX + radius * Math.cos(slice.endAngle)
          const y2 = centerY + radius * Math.sin(slice.endAngle)

          let largeArc = 0
          if (slice.angle > Math.PI) {
            largeArc = 1
          }

          const path =
            `M ${centerX} ${centerY} ` +
            `L ${x1} ${y1} ` +
            `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`

          return (
            <path key={index} d={path} fill={slice.color} stroke="#ffffff">
              <title>
                {slice.label}: {formatValue(slice.value, prefix, suffix)} (
                {slice.percent}%)
              </title>
            </path>
          )
        })}
      </svg>

      <ul className="chart-legend chart-legend-list">
        {slices.map((slice, index) => (
          <li key={index}>
            <span
              className="chart-swatch"
              style={{ background: slice.color }}
            />
            {slice.label}: {formatValue(slice.value, prefix, suffix)} (
            {slice.percent}%)
          </li>
        ))}
      </ul>
    </div>
  )
}

function Chart({ type, title, data, labelKey, series, prefix = '', suffix = '' }) {
  let hasValues = false

  for (const row of data) {
    for (const item of series) {
      if (Number(row[item.key]) > 0) {
        hasValues = true
      }
    }
  }

  return (
    <div className="chart-card">
      <h3 className="chart-title">{title}</h3>

      {!hasValues && <p className="empty">No data for this date range.</p>}

      {hasValues && type === 'bar' && (
        <BarChart
          data={data}
          labelKey={labelKey}
          series={series}
          prefix={prefix}
          suffix={suffix}
        />
      )}

      {hasValues && type === 'line' && (
        <LineChart
          data={data}
          labelKey={labelKey}
          series={series}
          prefix={prefix}
          suffix={suffix}
        />
      )}

      {hasValues && type === 'pie' && (
        <PieChart
          data={data}
          labelKey={labelKey}
          series={series}
          prefix={prefix}
          suffix={suffix}
        />
      )}

      {hasValues && type !== 'pie' && series.length > 1 && (
        <div className="chart-legend">
          {series.map((item, index) => (
            <span key={item.key} className="chart-legend-item">
              <span
                className="chart-swatch"
                style={{ background: colors[index] }}
              />
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default Chart
