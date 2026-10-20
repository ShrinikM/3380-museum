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

  const deleteSelected = async (noun, getLabel, deleteOne) => {
    const message =
      selectedRows.length === 1
        ? `Are you sure you want to delete this ${noun}?`
        : `Are you sure you want to delete these ${selectedRows.length} ${noun}s?`

    if (!window.confirm(message)) return false

    const failures = []

    for (const row of selectedRows) {
      try {
        await deleteOne(row)
      } catch (err) {
        failures.push(`${getLabel(row)}: ${err.message}`)
      }
    }

    if (failures.length > 0) {
      alert(failures.join('\n'))
    }

    clear()
    return true
  }

  return { selectedRows, isSelected, toggle, clear, deleteSelected }
}
