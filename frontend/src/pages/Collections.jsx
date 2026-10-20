
import { useState, useEffect } from 'react'
import { Panel, Modal, SelectionActions } from '../components/ui'
import { callApi } from '../api'
import { useRole } from '../context/role'
import { useSelection } from '../hooks/useSelection'

function Collections() {
  const { user, canEdit } = useRole()
  const allowEdit = canEdit('/collections')
  const showAudit = user.role === 'Admin' || user.role === 'Supervisor'

  const [collections, setCollections] = useState([])
  const [loadError, setLoadError] = useState('')
  const [reloadCount, setReloadCount] = useState(0)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    Name: '',
    Description: '',
  })

  useEffect(() => {
    async function loadCollections() {
      try {
        const data = await callApi('/api/collections', 'GET')
        setCollections(data)
        setLoadError('')
      } catch (err) {
        setLoadError('Could not load collections: ' + err.message)
      }
    }

    loadCollections()
  }, [reloadCount])

  const refetchCollections = () => {
    setReloadCount((count) => count + 1)
  }

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
    })
  }

  const openAddModal = () => {
    resetForm()
    setEditingId(null)
    setOpen(true)
  }

  const openEditModal = (collection) => {
    setFormData({
      Name: collection.Name || '',
      Description: collection.Description || '',
    })
    setEditingId(collection.CollectionID)
    setOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.Name.trim()) {
      alert('Collection Name is required.')
      return
    }

    const collectionData = {
      Name: formData.Name.trim(),
      Description: formData.Description.trim() || null,
    }

    try {
      if (editingId === null) {
        await callApi('/api/collections', 'POST', collectionData)
      } else {
        const confirmed = window.confirm(
          'Are you sure you want to save these changes to this collection?'
        )

        if (!confirmed) return

        await callApi(
          '/api/collections/' + editingId,
          'PUT',
          collectionData
        )
      }
    } catch (err) {
      alert(err.message)
      return
    }

    resetForm()
    setOpen(false)
    clear()
    refetchCollections()
  }

  const filtered = collections.filter((collection) => {
    const searchText = search.toLowerCase()
    const name = collection.Name?.toLowerCase() || ''
    const description = collection.Description?.toLowerCase() || ''

    return (
      name.includes(searchText) ||
      description.includes(searchText) ||
      String(collection.CollectionID).includes(searchText)
    )
  })

  const {
    selectedRows: selectedCollections,
    isSelected,
    toggle,
    clear,
    deleteSelected,
  } = useSelection(filtered, (collection) => collection.CollectionID)

  const handleEditSelected = () => {
    openEditModal(selectedCollections[0])
  }

  const handleDeleteSelected = async () => {
    const deleted = await deleteSelected(
      'collection',
      (collection) => collection.Name,
      (collection) =>
        callApi('/api/collections/' + collection.CollectionID, 'DELETE')
    )

    if (deleted) refetchCollections()
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Collections</h1>
        </div>

        {allowEdit && (
          <div className="page-header-actions">
            <SelectionActions
              count={selectedCollections.length}
              onEdit={handleEditSelected}
              onDelete={handleDeleteSelected}
            />

            <button
              type="button"
              className="btn primary"
              onClick={openAddModal}
            >
              Add Collection
            </button>
          </div>
        )}
      </div>

      <div className="grid-3 section-gap-sm">
        <Panel className="summary-card">
          <div className="summary-value">
            {collections.length}
          </div>
          <div className="summary-label">Total Collections</div>
        </Panel>

        <Panel className="summary-card">
          <div className="summary-value">
            {collections.filter((item) => item.Description).length}
          </div>
          <div className="summary-label">With Description</div>
        </Panel>

        <Panel className="summary-card">
          <div className="summary-value">
            {collections.filter((item) => !item.Description).length}
          </div>
          <div className="summary-label">Without Description</div>
        </Panel>
      </div>

      <div className="toolbar">
        <label htmlFor="collection-search" className="sr-only">
          Search collections
        </label>
        <input
          id="collection-search"
          type="search"
          name="collectionSearch"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search collections..."
        />
      </div>

      {loadError && (
        <p className="empty" role="alert">
          {loadError}
        </p>
      )}

      <div className="card table-wrap">
        <table
          className={
            'data-table' + (selectedCollections.length > 0 ? ' selecting' : '')
          }
        >
          <caption className="sr-only">Museum collections</caption>
          <thead>
            <tr>
              {allowEdit && (
                <th scope="col" className="select-col">
                  <span className="sr-only">Select</span>
                </th>
              )}
              <th scope="col">Collection</th>
              <th scope="col">Name</th>
              <th scope="col">Description</th>
              {showAudit && <th scope="col">Created By</th>}
              {showAudit && <th scope="col">Last Updated By</th>}
            </tr>
          </thead>

          <tbody>
            {filtered.map((item) => (
              <tr
                key={item.CollectionID}
                className={isSelected(item.CollectionID) ? 'selected-row' : ''}
              >
                {allowEdit && (
                  <td className="select-col">
                    <input
                      type="checkbox"
                      checked={isSelected(item.CollectionID)}
                      onChange={() => toggle(item.CollectionID)}
                      aria-label={`Select ${item.Name}`}
                    />
                  </td>
                )}

                <td className="mono">
                  #{String(item.CollectionID).padStart(5, '0')}
                </td>

                <td>
                  <div className="strong">{item.Name}</div>
                </td>

                <td>{item.Description || '-'}</td>

                {showAudit && <td>{item.CreatedByName || '-'}</td>}
                {showAudit && <td>{item.UpdatedByName || '-'}</td>}
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={3 + (showAudit ? 2 : 0) + (allowEdit ? 1 : 0)}
                  className="empty"
                >
                  No collections found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        title={editingId === null ? 'Add Collection' : 'Edit Collection'}
        onClose={() => setOpen(false)}
      >
        <form
          onSubmit={handleSubmit}
          className="form-grid"
        >
          <div className="form-group">
            <label htmlFor="collection-name">Name</label>
            <input
              id="collection-name"
              name="Name"
              autoComplete="off"
              value={formData.Name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="collection-description">Description</label>
            <textarea
              id="collection-description"
              name="Description"
              value={formData.Description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={() => {
                resetForm()
                setOpen(false)
              }}
            >
              Cancel
            </button>

            <button type="submit" className="btn primary">
              {editingId === null ? 'Add Collection' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Collections
