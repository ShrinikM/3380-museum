import { useEffect, useState } from 'react'

export const PAGE_SIZE = 25

export function pageItems(items, page) {
  const start = (page - 1) * PAGE_SIZE
  return items.slice(start, start + PAGE_SIZE)
}

export function pageCount(total) {
  return Math.max(1, Math.ceil(total / PAGE_SIZE))
}

export function usePagedList(items, resetKey = '') {
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [resetKey])

  const pages = pageCount(items.length)
  const currentPage = Math.min(Math.max(page, 1), pages)

  return {
    visibleRows: pageItems(items, currentPage),
    page: currentPage,
    total: items.length,
    setPage,
  }
}

export function TablePager({ page, total, onChange }) {
  const pages = pageCount(total)

  if (total <= PAGE_SIZE) {
    return null
  }

  const start = (page - 1) * PAGE_SIZE + 1
  const end = Math.min(page * PAGE_SIZE, total)

  return (
    <div className="table-pager">
      <p className="table-pager-meta" aria-live="polite">
        Showing {start}-{end} of {total}
      </p>

      <div className="table-pager-actions">
        <button
          type="button"
          className="btn secondary"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Previous
        </button>
        <span className="table-pager-page">
          Page {page} of {pages}
        </span>
        <button
          type="button"
          className="btn secondary"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  )
}
