import{ SearchIcon, FilterIcon } from './Icons'

export function Badge({ variant, label }){
  const text = label ?? variant.charAt(0).toUpperCase() + variant.slice(1)
  return <span className={`badge badge-${variant}`}>{text}</span>
}

export function Button({ variant = 'secondary', icon, children, className = '', ...rest }){
  return(
    <button {...rest} className={`btn btn-${variant} ${className}`}>
      {icon}
      {children}
    </button>
  )
}

export function Panel({ children, className = '' }){
  return <div className={`card ${className}`}>{children}</div>
}

export function StatCard({ label, value, delta, deltaLabel }){
  return(
    <div className="card stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {delta && (
        <div className="stat-delta">
          <span>{delta}</span>
          {deltaLabel && <span className="muted">{deltaLabel}</span>}
        </div>
      )}
    </div>
  )
}

export function SearchBar({ value, onChange, placeholder = 'Search...' }){
  return(
    <div className="search">
      <SearchIcon size={13} />
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e)=> onChange(e.target.value)}
      />
    </div>
  )
}

export function FilterSelect({ value, onChange, options }){
  return(
    <div className="filter-select">
      <select value={value} onChange={(e)=> onChange(e.target.value)}>
        {options.map((o)=>(
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <FilterIcon size={11} />
    </div>
  )
}

export function Table({ headers, children }){
  return(
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {headers.map((h)=> <th key={h}>{h}</th>)}
        </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function Modal({ open, title, onClose, children }){
  if(!open) return null

  return(
    <div className="modal-backdrop" onClick={(e)=>{ if(e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}
