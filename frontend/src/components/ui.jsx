
export function Badge({ variant, label }) {
  const text = label ?? variant.charAt(0).toUpperCase() + variant.slice(1)

  return (
    <span className={`badge badge-${variant}`}>
      {text}
    </span>
  )
}

export function Button({
  variant = 'secondary',
  children,
  className = '',
  type = 'button',
  ...rest
}) {
  return (
    <button
      {...rest}
      type={type}
      className={`btn btn-${variant} ${className}`}
    >
      {children}
    </button>
  )
}

export function Panel({ children, className = '', ...rest }) {
  return (
    <div className={`card ${className}`} {...rest}>
      {children}
    </div>
  )
}

export function StatCard({ label, value, delta, deltaLabel }) {
  return (
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

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  label = 'Search',
  id = 'search-input',
}) {
  return (
    <div className="search">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="search"
        name="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
      />
    </div>
  )
}

export function FilterSelect({
  value,
  onChange,
  options,
  label = 'Filter',
  id = 'filter-select',
  name = 'filter',
}) {
  return (
    <div className="filter-select">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function SelectionActions({ count, onEdit, onDelete, disabled = false }) {
  if (count === 0) return null

  return (
    <>
      {count === 1 && (
        <button
          type="button"
          className="btn secondary"
          onClick={onEdit}
          disabled={disabled}
        >
          Edit
        </button>
      )}

      <button
        type="button"
        className="btn danger"
        onClick={onDelete}
        disabled={disabled}
      >
        Delete
      </button>
    </>
  )
}

export function Table({ headers, children, caption = 'Data table' }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} scope="col">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function Modal({ open, title, onClose, children }) {
  if (!open) return null

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            Close
          </button>
        </div>

        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}