
import { useState, useEffect } from 'react'
import { Badge, Panel, Modal } from '../components/ui'
import { useRole } from '../context/role'
import { addActivity } from './Dashboard'
import { callApi } from '../api'

function Exhibitions() {
  const { canEdit } = useRole()
  const allowEdit = canEdit('/exhibitions')
  const today = new Date().toISOString().split('T')[0]

  const [exhibitions, setExhibitions] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [reloadCount, setReloadCount] = useState(0)

  const [formData, setFormData] = useState({
    Name: '',
    Description: '',
    StartDate: '',
    EndDate: '',
    Capacity: '',
  })

  useEffect(() => {
    let cancelled = false

    async function loadExhibitions() {
      setLoading(true)

      try {
        const data = await callApi('/api/exhibitions', 'GET')

        if (!Array.isArray(data)) {
          throw new Error('The server returned an invalid exhibitions response.')
        }

        if (!cancelled) {
          setExhibitions(
            data.map((exhibition) => ({
              ...exhibition,
              Capacity: Number(exhibition.Capacity),
              Tickets: Number(exhibition.Tickets ?? 0),
              ArtworkCount: Number(exhibition.ArtworkCount ?? 0),
              StaffNames: Array.isArray(exhibition.StaffNames)
                ? exhibition.StaffNames
                : [],
            }))
          )
          setLoadError('')
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError('Could not load exhibitions: ' + err.message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadExhibitions()

    return () => {
      cancelled = true
    }
  }, [reloadCount])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const resetForm = () => {
    setFormData({
      Name: '',
      Description: '',
      StartDate: '',
      EndDate: '',
      Capacity: '',
    })
  }

  const closeModal = () => {
    resetForm()
    setEditingId(null)
    setOpen(false)
  }

  const openAddModal = () => {
    resetForm()
    setEditingId(null)
    setOpen(true)
  }

  const openEditModal = (exhibition) => {
    setFormData({
      Name: exhibition.Name,
      Description: exhibition.Description || '',
      StartDate: exhibition.StartDate,
      EndDate: exhibition.EndDate,
      Capacity: String(exhibition.Capacity),
    })

    setEditingId(exhibition.ExhibitionID)
    setOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (saving) {
      return
    }

    const name = formData.Name.trim()
    const description = formData.Description.trim()
    const capacity = Number(formData.Capacity)

    const textPattern = /^[A-Za-z0-9À-ÖØ-öø-ÿ\s.,:;!?' "()&'-]+$/

    if (!name || !textPattern.test(name)) {
      alert('Please enter a valid exhibition name.')
      return
    }

    if (name.length > 255) {
      alert('Exhibition name must be 255 characters or fewer.')
      return
    }

    if (description && !textPattern.test(description)) {
      alert('Description contains invalid characters.')
      return
    }

    if (description.length > 255) {
      alert('Description must be 255 characters or fewer.')
      return
    }

    if (!formData.StartDate || !formData.EndDate) {
      alert('Start Date and End Date are required.')
      return
    }

    if (formData.EndDate <= formData.StartDate) {
      alert('End Date must be after Start Date.')
      return
    }

    if (
      !Number.isInteger(capacity) ||
      capacity < 1 ||
      capacity > 1400
    ) {
      alert('Capacity must be a whole number between 1 and 1400.')
      return
    }

    const duplicate = exhibitions.some(
      (exhibition) =>
        exhibition.Name.toLowerCase() === name.toLowerCase() &&
        exhibition.ExhibitionID !== editingId
    )

    if (duplicate) {
      alert('An exhibition with this name already exists.')
      return
    }

    if (editingId !== null) {
      const confirmed = window.confirm(
        'Are you sure you want to save these changes to this exhibition?'
      )

      if (!confirmed) {
        return
      }
    }

    const payload = {
      Name: name,
      Description: description,
      StartDate: formData.StartDate,
      EndDate: formData.EndDate,
      Capacity: capacity,
    }

    setSaving(true)

    try {
      if (editingId === null) {
        await callApi('/api/exhibitions', 'POST', payload)
        addActivity('Exhibition added', name)
      } else {
        await callApi(
          `/api/exhibitions/${editingId}`,
          'PUT',
          payload
        )
        addActivity('Exhibition updated', name)
      }

      closeModal()
      setReloadCount((count) => count + 1)
    } catch (err) {
      alert('Could not save exhibition: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    const exhibition = exhibitions.find(
      (item) => item.ExhibitionID === id
    )

    const confirmed = window.confirm(
      'Are you sure you want to delete this exhibition?'
    )

    if (!confirmed) {
      return
    }

    try {
      await callApi(`/api/exhibitions/${id}`, 'DELETE')

      addActivity(
        'Exhibition deleted',
        exhibition?.Name || `Exhibition #${id}`
      )

      setReloadCount((count) => count + 1)
    } catch (err) {
      alert('Could not delete exhibition: ' + err.message)
    }
  }

  const filtered = exhibitions.filter((exhibition) => {
    const matchesSearch =
      (exhibition.Name || '').toLowerCase().includes(search.toLowerCase()) ||
      (exhibition.Description || '')
        .toLowerCase()
        .includes(search.toLowerCase())

    const matchesStatus =
      status === 'all' || exhibition.Status === status

    return matchesSearch && matchesStatus
  })

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Exhibitions</h1>
          <p className="page-subtitle">
            Exhibition schedule, capacity, staff, and displayed artworks.
          </p>
        </div>

        {allowEdit && (
          <button
            className="btn primary"
            onClick={openAddModal}
            disabled={loading || saving}
          >
            Add Exhibition
          </button>
        )}
      </div>

      {loadError && (
        <div className="error-message" role="alert">
          {loadError}
          <button
            className="btn secondary"
            onClick={() => setReloadCount((count) => count + 1)}
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid-3 section-gap-sm">
        <Panel className="summary-card">
          <div className="summary-value">
            {exhibitions.filter((e) => e.Status === 'active').length}
          </div>
          <div className="summary-label">Active Exhibitions</div>
        </Panel>

        <Panel className="summary-card">
          <div className="summary-value">
            {exhibitions.filter((e) => e.Status === 'upcoming').length}
          </div>
          <div className="summary-label">Upcoming Exhibitions</div>
        </Panel>

        <Panel className="summary-card">
          <div className="summary-value">
            {exhibitions.filter((e) => e.Status === 'completed').length}
          </div>
          <div className="summary-label">Completed Exhibitions</div>
        </Panel>
      </div>

      <div className="toolbar">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search exhibitions..."
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="card table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Exhibition</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Tickets / Capacity</th>
              <th>Staff</th>
              <th>Artworks</th>
              <th>Status</th>
              {allowEdit && <th>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={allowEdit ? 8 : 7} className="empty">
                  Loading exhibitions...
                </td>
              </tr>
            )}

            {!loading &&
              !loadError &&
              filtered.map((exhibition) => (
                <tr key={exhibition.ExhibitionID}>
                  <td>
                    <div className="strong">{exhibition.Name}</div>
                    <div className="cell-sub">
                      {exhibition.Description || '-'}
                    </div>
                  </td>

                  <td className="mono">{exhibition.StartDate}</td>
                  <td className="mono">{exhibition.EndDate}</td>

                  <td>
                    {exhibition.Tickets} / {exhibition.Capacity}
                  </td>

                  <td>
                    {exhibition.StaffNames.length > 0
                      ? exhibition.StaffNames.join(', ')
                      : '-'}
                  </td>

                  <td>{exhibition.ArtworkCount}</td>

                  <td>
                    <Badge variant={exhibition.Status} />
                  </td>

                  {allowEdit && (
                    <td>
                      <div className="row-actions">
                        <button
                          className="btn secondary"
                          onClick={() => openEditModal(exhibition)}
                          disabled={saving}
                        >
                          Edit
                        </button>

                        <button
                          className="btn danger"
                          onClick={() =>
                            handleDelete(exhibition.ExhibitionID)
                          }
                          disabled={saving}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}

            {!loading && !loadError && filtered.length === 0 && (
              <tr>
                <td colSpan={allowEdit ? 8 : 7} className="empty">
                  No exhibitions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        title={editingId === null ? 'Add Exhibition' : 'Edit Exhibition'}
        onClose={closeModal}
      >
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              name="Name"
              value={formData.Name}
              onChange={handleChange}
              maxLength={255}
              required
            />
          </div>

          <div className="form-group">
            <label>Capacity</label>
            <input
              name="Capacity"
              type="number"
              min="1"
              max="1400"
              step="1"
              value={formData.Capacity}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Start Date</label>
            <input
              name="StartDate"
              type="date"
              value={formData.StartDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>End Date</label>
            <input
              name="EndDate"
              type="date"
              min={formData.StartDate || undefined}
              value={formData.EndDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              name="Description"
              value={formData.Description}
              onChange={handleChange}
              maxLength={255}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={closeModal}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn primary"
              disabled={saving}
            >
              {saving
                ? 'Saving...'
                : editingId === null
                  ? 'Add Exhibition'
                  : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Exhibitions
