import { useState, useEffect } from 'react'
import { Modal, SelectionActions } from '../components/ui'
import { callApi } from '../api'
import { useRole } from '../context/role'
import { useSelection } from '../hooks/useSelection'

function Collections() {
  const { user, canEdit } = useRole()
  const allowEdit = canEdit('/collections')
  const showAudit = user.role === 'Admin'

  const [collections, setCollections] = useState([])
  const [loadError, setLoadError] = useState('')
  const [formError, setFormError] = useState('')
  const [reloadCount, setReloadCount] = useState(0)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [collectionToDelete, setCollectionToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

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
    setFormError('')
  }

  const resetForm = () => {
    setFormData({
      Name: '',
      Description: '',
    })
    setFormError('')
  }

  const openAddModal = () => {
    resetForm()
    setEditingId(null)
    setFormError('')
    setOpen(true)
  }

  const openEditModal = (collection) => {
    setFormData({
      Name: collection.Name || '',
      Description: collection.Description || '',
    })
    setEditingId(collection.CollectionID)
    setFormError('')
    setOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!formData.Name.trim()) {
      setFormError('Collection Name is required.')
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
        await callApi(
          '/api/collections/' + editingId,
          'PUT',
          collectionData
        )
      }
    } catch (err) {
      setFormError(err.message)
      return
    }

    resetForm()
    setEditingId(null)
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
  } = useSelection(filtered, (collection) => collection.CollectionID)

  const handleEditSelected = () => {
    openEditModal(selectedCollections[0])
  }

  const handleDeleteSelected = () => {
    if (selectedCollections.length === 0) return
    setCollectionToDelete(selectedCollections[0])
    setDeleteError('')
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!collectionToDelete) return

    setDeleting(true)
    try {
      await callApi('/api/collections/' + collectionToDelete.CollectionID, 'DELETE')
      setDeleteModalOpen(false)
      setCollectionToDelete(null)
      clear()
      refetchCollections()
    } catch (err) {
      setDeleteError('Could not delete collection: ' + err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="page page-wide">
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

      <div className="toolbar">
        <label htmlFor="collection-search" className="sr-only">
          Search collections
        </label>
        <input
          id="collection-search"
          type="search"
          className="search-input"
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
              <th scope="col">Artworks</th>
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

                <td>{item.ArtworkCount}</td>

                {showAudit && <td>{item.CreatedByName || '-'}</td>}
                {showAudit && <td>{item.UpdatedByName || '-'}</td>}
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={4 + (showAudit ? 2 : 0) + (allowEdit ? 1 : 0)}
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
        onClose={() => {
          resetForm()
          setEditingId(null)
          setOpen(false)
        }}
      >
        <form
          onSubmit={handleSubmit}
          className="form-grid"
        >
          {formError && (
            <p className="form-error form-full" role="alert">
              {formError}
            </p>
          )}

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
                setEditingId(null)
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

      <Modal
        open={deleteModalOpen}
        title="Delete Collection"
        onClose={() => setDeleteModalOpen(false)}
      >
        <div className="form-grid">
          {deleteError && (
            <p className="form-error form-full" role="alert">
              {deleteError}
            </p>
          )}

          <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', margin: '0 0 16px', gridColumn: '1 / -1' }}>
            Are you sure you want to delete <strong>{collectionToDelete?.Name}</strong>? This action cannot be undone.
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
              {deleting ? 'Deleting...' : 'Delete Collection'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Collections