import { useState, useEffect } from 'react'
import { Badge, Panel, Modal, SelectionActions } from '../components/ui'
import { useRole } from '../context/role'
import { callApi } from '../api'
import { useSelection } from '../hooks/useSelection'

function Exhibitions() {
  const { canEdit } = useRole()
  const allowEdit = canEdit('/exhibitions')

  const [exhibitions, setExhibitions] = useState([])
  const [collections, setCollections] = useState([])
  const [staffList, setStaffList] = useState([])
  const [staffMenuOpen, setStaffMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All') 
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const [loadError, setLoadError] = useState('')
  const [formError, setFormError] = useState('')
  
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [exhibitionToCancel, setExhibitionToCancel] = useState(null)
  const [cancelError, setCancelError] = useState('')

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [exhibitionToDelete, setExhibitionToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [reloadCount, setReloadCount] = useState(0)

  const [formData, setFormData] = useState({
    Name: '',
    Description: '',
    StartDate: '',
    EndDate: '',
    Capacity: '',
    CollectionID: '',
    StaffIDs: [],
  })

  useEffect(() => {
    let cancelled = false

    async function loadExhibitions() {
      setLoading(true)

      try {
        const [data, collectionsData] = await Promise.all([
          callApi('/api/exhibitions', 'GET'),
          callApi('/api/collections', 'GET'),
        ])

        if (allowEdit) {
          const staffData = await callApi('/api/staff', 'GET')
          setStaffList(staffData.filter((person) => person.Role === 'Staff'))
        }

        if (!Array.isArray(data)) {
          throw new Error(
            'The server returned an invalid exhibitions response.'
          )
        }

        if (!cancelled) {
          setCollections(collectionsData)
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
  }, [reloadCount, allowEdit])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setFormError('')
  }

  const toggleStaff = (staffId) => {
    if (formData.StaffIDs.includes(staffId)) {
      setFormData({
        ...formData,
        StaffIDs: formData.StaffIDs.filter((id) => id !== staffId),
      })
    } else {
      setFormData({
        ...formData,
        StaffIDs: [...formData.StaffIDs, staffId],
      })
    }
    setFormError('')
  }

  const resetForm = () => {
    setFormData({
      Name: '',
      Description: '',
      StartDate: '',
      EndDate: '',
      Capacity: '',
      CollectionID: '',
      StaffIDs: [],
    })
    setFormError('')
  }

  const closeModal = () => {
    resetForm()
    setStaffMenuOpen(false)
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
      Name: exhibition.Name || '',
      Description: exhibition.Description || '',
      StartDate: exhibition.StartDate
        ? exhibition.StartDate.split('T')[0]
        : '',
      EndDate: exhibition.EndDate
        ? exhibition.EndDate.split('T')[0]
        : '',
      Capacity: String(exhibition.Capacity),
      CollectionID: exhibition.CollectionID
        ? String(exhibition.CollectionID)
        : '',
      StaffIDs: exhibition.StaffIDs,
    })

    setEditingId(exhibition.ExhibitionID)
    setFormError('')
    setOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (saving) return

    const name = formData.Name.trim()
    const description = formData.Description.trim()
    const capacity = Number(formData.Capacity)

    const textPattern =
      /^[A-Za-z0-9À-ÖØ-öø-ÿ\s.,:;!?' "()&'-]+$/

    if (!name || !textPattern.test(name)) {
      setFormError('Please enter a valid exhibition name.')
      return
    }

    if (name.length > 255) {
      setFormError('Exhibition name must be 255 characters or fewer.')
      return
    }

    if (description && !textPattern.test(description)) {
      setFormError('Description contains invalid characters.')
      return
    }

    if (description.length > 255) {
      setFormError('Description must be 255 characters or fewer.')
      return
    }

    if (!formData.StartDate || !formData.EndDate) {
      setFormError('Start Date and End Date are required.')
      return
    }

    if (formData.EndDate <= formData.StartDate) {
      setFormError('End Date must be after Start Date.')
      return
    }

    if (
      !Number.isInteger(capacity) ||
      capacity < 1 ||
      capacity > 1400
    ) {
      setFormError('Capacity must be a whole number between 1 and 1400.')
      return
    }

    if (!formData.CollectionID) {
      setFormError('Please select a collection.')
      return
    }

    if (formData.StaffIDs.length === 0) {
      setFormError('Please assign at least one staff member.')
      return
    }

    const duplicate = exhibitions.some(
      (exhibition) =>
        exhibition.Name.toLowerCase() === name.toLowerCase() &&
        exhibition.ExhibitionID !== editingId
    )

    if (duplicate) {
      setFormError('An exhibition with this name already exists.')
      return
    }

    const payload = {
      Name: name,
      Description: description,
      StartDate: formData.StartDate,
      EndDate: formData.EndDate,
      Capacity: capacity,
      CollectionID: Number(formData.CollectionID),
      StaffIDs: formData.StaffIDs,
    }

    setSaving(true)

    try {
      if (editingId === null) {
        await callApi('/api/exhibitions', 'POST', payload)
      } else {
        await callApi(`/api/exhibitions/${editingId}`, 'PUT', payload)
      }

      closeModal()
      clear()
      setReloadCount((count) => count + 1)
    } catch (err) {
      setFormError('Could not save exhibition: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const filtered = exhibitions.filter((exhibition) => {
    const searchText = search.toLowerCase()

    const matchesSearch =
      (exhibition.Name || '').toLowerCase().includes(searchText) ||
      (exhibition.Description || '').toLowerCase().includes(searchText)

    const matchesStatus =
      selectedStatus === 'All' || exhibition.Status === selectedStatus

    return matchesSearch && matchesStatus
  })

  const {
    selectedRows: selectedExhibitions,
    isSelected,
    toggle,
    clear,
  } = useSelection(filtered, (exhibition) => exhibition.ExhibitionID)

  const handleEditSelected = () => {
    if (selectedExhibitions[0].Status === 'cancelled') {
      alert('A cancelled exhibition cannot be edited.')
      return
    }

    openEditModal(selectedExhibitions[0])
  }

  const cancellable =
    selectedExhibitions.length === 1 &&
    (selectedExhibitions[0].Status === 'active' ||
      selectedExhibitions[0].Status === 'upcoming')

  const handleOpenCancelModal = () => {
    const exhibition = selectedExhibitions[0]
    if (!exhibition) return

    setExhibitionToCancel(exhibition)
    setCancelReason('')
    setCancelError('')
    setCancelModalOpen(true)
  }

  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) {
      setCancelError('Please enter a cancellation reason.')
      return
    }

    setSaving(true)
    setCancelError('')

    try {
      await callApi(`/api/exhibitions/${exhibitionToCancel.ExhibitionID}/cancel`, 'POST', {
        Reason: cancelReason.trim(),
      })

      setCancelModalOpen(false)
      clear()
      setReloadCount((count) => count + 1)
    } catch (err) {
      setCancelError('Could not cancel exhibition: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSelected = () => {
    if (selectedExhibitions.length === 0) return
    setExhibitionToDelete(selectedExhibitions[0])
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!exhibitionToDelete) return

    setDeleting(true)
    try {
      await callApi(`/api/exhibitions/${exhibitionToDelete.ExhibitionID}`, 'DELETE')
      setDeleteModalOpen(false)
      setExhibitionToDelete(null)
      clear()
      setReloadCount((count) => count + 1)
    } catch (err) {
      setFormError('Could not delete exhibition: ' + err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="page page-wide">
      <div className="page-header">
        <div>
          <h1 className="page-title">Exhibitions</h1>
        </div>

        {allowEdit && (
          <div className="page-header-actions">
            <SelectionActions
              count={selectedExhibitions.length}
              onEdit={handleEditSelected}
              onDelete={handleDeleteSelected}
              disabled={saving}
            />

            {cancellable && (
              <button
                type="button"
                className="btn danger"
                onClick={handleOpenCancelModal}
                disabled={saving}
              >
                Cancel Exhibition
              </button>
            )}

            <button
              type="button"
              className="btn primary"
              onClick={openAddModal}
              disabled={loading || saving}
            >
              Add Exhibition
            </button>
          </div>
        )}
      </div>

      <div className="grid-4 section-gap-sm">
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

        <Panel className="summary-card">
          <div className="summary-value">
            {exhibitions.filter((e) => e.Status === 'cancelled').length}
          </div>
          <div className="summary-label">Cancelled Exhibitions</div>
        </Panel>
      </div>

      <div className="toolbar" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="exhibition-search" className="sr-only">
            Search exhibitions
          </label>
          <input
            id="exhibition-search"
            name="exhibitionSearch"
            type="search"
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exhibitions..."
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label htmlFor="exhibition-status-filter" className="sr-only">
            Filter by status
          </label>
          <select
            id="exhibition-status-filter"
            className="input"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              height: '40px',
              padding: '0 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#fff',
              fontSize: '14px',
              color: '#1e293b',
              cursor: 'pointer',
            }}
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loadError && (
        <p className="empty" role="alert">
          {loadError}
        </p>
      )}

      <div className="card table-wrap">
        <table
          className={
            'data-table' + (selectedExhibitions.length > 0 ? ' selecting' : '')
          }
        >
          <caption className="sr-only">Museum exhibitions</caption>

          <thead>
            <tr>
              {allowEdit && (
                <th scope="col" className="select-col">
                  <span className="sr-only">Select</span>
                </th>
              )}
              <th scope="col">Exhibition</th>
              <th scope="col">Collection</th>
              <th scope="col">Start Date</th>
              <th scope="col">End Date</th>
              <th scope="col">Tickets / Capacity</th>
              <th scope="col">Staff</th>
              <th scope="col">Artworks</th>
              <th scope="col">Status</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={allowEdit ? 9 : 8} className="empty">
                  Loading exhibitions...
                </td>
              </tr>
            )}

            {!loading &&
              !loadError &&
              filtered.map((exhibition) => (
                <tr
                  key={exhibition.ExhibitionID}
                  className={
                    isSelected(exhibition.ExhibitionID) ? 'selected-row' : ''
                  }
                >
                  {allowEdit && (
                    <td className="select-col">
                      <input
                        type="checkbox"
                        checked={isSelected(exhibition.ExhibitionID)}
                        onChange={() => toggle(exhibition.ExhibitionID)}
                        aria-label={`Select ${exhibition.Name}`}
                      />
                    </td>
                  )}

                  <td>
                    <div className="strong">{exhibition.Name}</div>
                    <div className="cell-sub">
                      {exhibition.Description || '-'}
                    </div>
                  </td>

                  <td>{exhibition.CollectionName || '-'}</td>

                  <td className="mono">
                    {exhibition.StartDate
                      ? exhibition.StartDate.split('T')[0]
                      : '-'}
                  </td>

                  <td className="mono">
                    {exhibition.EndDate
                      ? exhibition.EndDate.split('T')[0]
                      : '-'}
                  </td>

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
                    <Badge
                      variant={exhibition.Status || 'unknown'}
                      label={exhibition.Status || 'Unknown'}
                    />
                  </td>
                </tr>
              ))}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={allowEdit ? 9 : 8} className="empty">
                  No exhibitions found matching this filter.
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
          {formError && (
            <p className="form-error form-full" role="alert">
              {formError}
            </p>
          )}

          <div className="form-group">
            <label htmlFor="exhibition-name">Name</label>
            <input
              id="exhibition-name"
              name="Name"
              value={formData.Name}
              onChange={handleChange}
              maxLength={255}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="exhibition-collection">Collection</label>
            <select
              id="exhibition-collection"
              name="CollectionID"
              value={formData.CollectionID}
              onChange={handleChange}
              required
            >
              <option value="">Select Collection</option>
              {collections.map((item) => (
                <option key={item.CollectionID} value={item.CollectionID}>
                  {item.Name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="exhibition-capacity">Capacity</label>
            <input
              id="exhibition-capacity"
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
            <label htmlFor="exhibition-start-date">Start Date</label>
            <input
              id="exhibition-start-date"
              name="StartDate"
              type="date"
              value={formData.StartDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="exhibition-end-date">End Date</label>
            <input
              id="exhibition-end-date"
              name="EndDate"
              type="date"
              min={formData.StartDate || undefined}
              value={formData.EndDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="exhibition-description">Description</label>
            <textarea
              id="exhibition-description"
              name="Description"
              value={formData.Description}
              onChange={handleChange}
              maxLength={255}
              rows={3}
            />
          </div>

          <div className="form-group form-full">
            <label>Assigned Staff</label>

            <button
              type="button"
              className="dropdown-btn"
              onClick={() => setStaffMenuOpen(!staffMenuOpen)}
            >
              {formData.StaffIDs.length === 0
                ? 'Select staff'
                : formData.StaffIDs.length + ' staff selected'}
              <span>{staffMenuOpen ? '▲' : '▼'}</span>
            </button>

            {staffMenuOpen && (
              <div className="check-list">
                {staffList.length === 0 && (
                  <span className="muted">No staff available.</span>
                )}

                {staffList.map((person) => (
                  <label className="check-item" key={person.StaffID}>
                    <input
                      type="checkbox"
                      checked={formData.StaffIDs.includes(Number(person.StaffID))}
                      onChange={() => toggleStaff(Number(person.StaffID))}
                    />
                    {person.FirstName} {person.LastName}
                  </label>
                ))}
              </div>
            )}
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

      <Modal
        open={cancelModalOpen}
        title="Cancel Exhibition"
        onClose={() => setCancelModalOpen(false)}
      >
        <div className="form-grid">
          {cancelError && (
            <p className="form-error form-full" role="alert">
              {cancelError}
            </p>
          )}

          <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', margin: '0 0 12px', gridColumn: '1 / -1' }}>
            Why is <strong>{exhibitionToCancel?.Name}</strong> being cancelled? Ticket holders will be notified and marked for a refund.
          </p>

          <div className="form-group form-full">
            <label htmlFor="cancel-reason">Cancellation Reason</label>
            <textarea
              id="cancel-reason"
              value={cancelReason}
              onChange={(e) => {
                setCancelReason(e.target.value)
                setCancelError('')
              }}
              rows={3}
              placeholder="Enter reason for cancellation..."
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={() => setCancelModalOpen(false)}
              disabled={saving}
            >
              Close
            </button>
            <button
              type="button"
              className="btn danger"
              onClick={handleConfirmCancel}
              disabled={saving}
            >
              {saving ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={deleteModalOpen}
        title="Delete Exhibition"
        onClose={() => setDeleteModalOpen(false)}
      >
        <div className="form-grid">
          <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', margin: '0 0 16px', gridColumn: '1 / -1' }}>
            Are you sure you want to delete <strong>{exhibitionToDelete?.Name}</strong>? This action cannot be undone.
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
              {deleting ? 'Deleting...' : 'Delete Exhibition'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Exhibitions