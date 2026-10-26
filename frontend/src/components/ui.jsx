
export function Badge({ variant, label }) {
  const text = label ?? variant.charAt(0).toUpperCase() + variant.slice(1)

  return (
    <span className={`badge badge-${variant}`}>
      {text}
    </span>
  )
}

export function Panel({ children, className = '', ...rest }) {
  return (
    <div className={`card ${className}`} {...rest}>
      {children}
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
