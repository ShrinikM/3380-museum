import { useState } from 'react'

export function useSelection(rows, getId) {
  const [selectedIds, setSelectedIds] = useState([])

  const selectedRows = rows.filter((row) =>
    selectedIds.includes(getId(row))
  )

  const isSelected = (id) => selectedIds.includes(id)

  const toggle = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    )
  }

  const clear = () => {
    setSelectedIds([])
  }

  return { selectedRows, isSelected, toggle, clear }
}