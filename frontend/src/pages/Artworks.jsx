import { useState, useEffect } from 'react'
import { Badge, Panel, Modal } from '../components/ui'
import { callApi } from '../api'
import { useRole } from '../context/role'
import { ARTWORK_TYPES } from '../data/constants'

function Artworks() {
  const { canEdit } = useRole()
  const allowEdit = canEdit('/artworks')
  const today = new Date().toISOString().split('T')[0]

  const [artworks, setArtworks] = useState([])
  const [artists, setArtists] = useState([])
  const [collections, setCollections] = useState([])
  const [loadError, setLoadError] = useState('')
  const [reloadCount, setReloadCount] = useState(0)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [formData, setFormData] = useState({
    Title: '',
    Type: '',
    ArtistID: '',
    CollectionID: '',
    DateCreated: '',
    CreatedBy: '',
  })

  useEffect(() => {
    async function loadData() {
      try {
        const artworkData = await callApi('/api/artworks', 'GET')
        const artistData = await callApi('/api/artists', 'GET')
        const collectionData = await callApi('/api/collections', 'GET')

        setArtworks(artworkData)
        setArtists(artistData)
        setCollections(collectionData)
        setLoadError('')
      } catch (err) {
        setLoadError('Could not load artworks: ' + err.message)
      }
    }

    loadData()
  }, [reloadCount])

  const refetchArtworks = () => {
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
      Title: '',
      Type: '',
      ArtistID: '',
      CollectionID: '',
      DateCreated: '',
      CreatedBy: '',
    })
  }

  const openAddModal = () => {
    resetForm()
    setEditingId(null)
    setOpen(true)
  }

  const openEditModal = (artwork) => {
    setFormData({
      Title: artwork.Title || '',
      Type: artwork.Type || '',
      ArtistID: String(artwork.ArtistID ?? ''),
      CollectionID: String(artwork.CollectionID ?? ''),
      DateCreated: artwork.DateCreated
        ? artwork.DateCreated.split('T')[0]
        : '',
      CreatedBy: '',
    })

    setEditingId(artwork.ArtworkID)
    setOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.DateCreated > today) {
      alert('Date Created cannot be in the future.')
      return
    }

    if (formData.CreatedBy && Number(formData.CreatedBy) < 1) {
      alert('Created By must be a positive Staff ID.')
      return
    }

    const artworkData = {
      Title: formData.Title.trim(),
      Type: formData.Type,
      ArtistID: Number(formData.ArtistID),
      CollectionID: Number(formData.CollectionID),
      DateCreated: formData.DateCreated,
    }

    try {
      if (editingId === null) {
        artworkData.CreatedBy = formData.CreatedBy
          ? Number(formData.CreatedBy)
          : null

        await callApi('/api/artworks', 'POST', artworkData)
      } else {
        await callApi(
          '/api/artworks/' + editingId,
          'PUT',
          artworkData
        )
      }
    } catch (err) {
      alert(err.message)
      return
    }

    resetForm()
    setEditingId(null)
    setOpen(false)
    refetchArtworks()
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this artwork?'
    )

    if (!confirmed) return

    try {
      await callApi('/api/artworks/' + id, 'DELETE')
    } catch (err) {
      alert(err.message)
      return
    }

    refetchArtworks()
  }

  const filtered = artworks.filter((artwork) => {
    const searchText = search.toLowerCase()

    return (
      (artwork.Title || '').toLowerCase().includes(searchText) ||
      (artwork.ArtistName || '').toLowerCase().includes(searchText) ||
      (artwork.CollectionName || '').toLowerCase().includes(searchText)
    )
  })

  const artistsRepresented = new Set(
    artworks.map((artwork) => artwork.ArtistID)
  )

  const collectionsUsed = new Set(
    artworks.map((artwork) => artwork.CollectionID)
  )

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Artworks</h1>
        </div>

        {allowEdit && (
          <button
            type="button"
            className="btn primary"
            onClick={openAddModal}
          >
            Add Artwork
          </button>
        )}
      </div>

      <div className="grid-3 section-gap-sm">
        <Panel className="summary-card">
          <div className="summary-value">{artworks.length}</div>
          <div className="summary-label">Total Artworks</div>
        </Panel>

        <Panel className="summary-card">
          <div className="summary-value">
            {artistsRepresented.size}
          </div>
          <div className="summary-label">Artists Represented</div>
        </Panel>

        <Panel className="summary-card">
          <div className="summary-value">
            {collectionsUsed.size}
          </div>
          <div className="summary-label">Collections</div>
        </Panel>
      </div>

      <div className="toolbar">
        <label htmlFor="artwork-search" className="sr-only">
          Search artworks
        </label>
        <input
          id="artwork-search"
          type="search"
          name="artworkSearch"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search artworks..."
        />
      </div>

      {loadError && (
        <p className="empty" role="alert">
          {loadError}
        </p>
      )}

      <div className="card table-wrap">
        <table className="data-table">
          <caption className="sr-only">Museum artworks</caption>

          <thead>
            <tr>
              <th scope="col">Artwork</th>
              <th scope="col">Artist</th>
              <th scope="col">Collection</th>
              <th scope="col">Type</th>
              <th scope="col">Date Created</th>
              <th scope="col">Created By</th>
              {allowEdit && <th scope="col">Actions</th>}
            </tr>
          </thead>

          <tbody>
            {filtered.map((item) => (
              <tr key={item.ArtworkID}>
                <td>
                  <div className="strong">{item.Title}</div>
                  <div className="cell-sub mono">
                    #{String(item.ArtworkID).padStart(5, '0')}
                  </div>
                </td>

                <td>{item.ArtistName}</td>
                <td>{item.CollectionName}</td>

                <td>
                  <Badge
                    variant="active"
                    label={item.Type || 'Unknown'}
                  />
                </td>

                <td className="mono">
                  {item.DateCreated
                    ? item.DateCreated.split('T')[0]
                    : '-'}
                </td>

                <td className="mono">{item.CreatedBy || '-'}</td>

                {allowEdit && (
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="btn secondary"
                        onClick={() => openEditModal(item)}
                        aria-label={`Edit ${item.Title}`}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="btn danger"
                        onClick={() => handleDelete(item.ArtworkID)}
                        aria-label={`Delete ${item.Title}`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={allowEdit ? 7 : 6}
                  className="empty"
                >
                  No artworks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        title={editingId === null ? 'Add Artwork' : 'Edit Artwork'}
        onClose={() => {
          resetForm()
          setEditingId(null)
          setOpen(false)
        }}
      >
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label htmlFor="artwork-title">Title</label>
            <input
              id="artwork-title"
              name="Title"
              autoComplete="off"
              value={formData.Title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="artwork-type">Type</label>
            <select
              id="artwork-type"
              name="Type"
              value={formData.Type}
              onChange={handleChange}
              required
            >
              <option value="">Select a type</option>
              {ARTWORK_TYPES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="artwork-artist">Artist</label>
            <select
              id="artwork-artist"
              name="ArtistID"
              value={formData.ArtistID}
              onChange={handleChange}
              required
            >
              <option value="">Select an artist</option>
              {artists.map((artist) => (
                <option
                  key={artist.ArtistID}
                  value={artist.ArtistID}
                >
                  {artist.FirstName} {artist.LastName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="artwork-collection">Collection</label>
            <select
              id="artwork-collection"
              name="CollectionID"
              value={formData.CollectionID}
              onChange={handleChange}
              required
            >
              <option value="">Select a collection</option>
              {collections.map((collection) => (
                <option
                  key={collection.CollectionID}
                  value={collection.CollectionID}
                >
                  {collection.Name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="artwork-date-created">Date Created</label>
            <input
              id="artwork-date-created"
              name="DateCreated"
              type="date"
              max={today}
              value={formData.DateCreated}
              onChange={handleChange}
              required
            />
          </div>

          {editingId === null && (
            <div className="form-group">
              <label htmlFor="artwork-created-by">Created By</label>
              <input
                id="artwork-created-by"
                name="CreatedBy"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                value={formData.CreatedBy}
                onChange={handleChange}
                placeholder="Staff ID"
              />
            </div>
          )}

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
              {editingId === null ? 'Add Artwork' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Artworks