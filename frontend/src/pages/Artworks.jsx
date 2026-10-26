import { useState, useEffect } from 'react'
import { Badge, Modal, SelectionActions } from '../components/ui'
import { callApi } from '../api'
import { useRole } from '../context/role'
import { useSelection } from '../hooks/useSelection'
import { ARTWORK_TYPES } from '../data/constants'

function Artworks() {
  const { user, canEdit } = useRole()
  const allowEdit = canEdit('/artworks')
  const showAudit = user.role === 'Admin'
  const currentYear = new Date().getFullYear()

  const [artworks, setArtworks] = useState([])
  const [artists, setArtists] = useState([])
  const [collections, setCollections] = useState([])
  const [loadError, setLoadError] = useState('')
  const [reloadCount, setReloadCount] = useState(0)
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [formData, setFormData] = useState({
    Title: '',
    Type: '',
    ArtistID: '',
    CollectionID: '',
    YearCreated: '',
  })

  const filteredArtworkTypes = ARTWORK_TYPES.filter(
    (item) => !['Drawing', 'Drawings', 'Print', 'Prints'].includes(item)
  )

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
      YearCreated: '',
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
      YearCreated: String(artwork.YearCreated ?? ''),
    })

    setEditingId(artwork.ArtworkID)
    setOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (Number(formData.YearCreated) > currentYear) {
      alert('Year Created cannot be in the future.')
      return
    }

    const artworkData = {
      Title: formData.Title.trim(),
      Type: formData.Type,
      ArtistID: Number(formData.ArtistID),
      CollectionID: Number(formData.CollectionID),
      YearCreated: Number(formData.YearCreated),
    }

    try {
      if (editingId === null) {
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
    clear()
    refetchArtworks()
  }

  const filtered = artworks.filter((artwork) => {
    const searchText = search.toLowerCase()

    const matchesSearch =
      (artwork.Title || '').toLowerCase().includes(searchText) ||
      (artwork.ArtistName || '').toLowerCase().includes(searchText) ||
      (artwork.CollectionName || '').toLowerCase().includes(searchText)

    const matchesType = selectedType === '' || artwork.Type === selectedType

    return matchesSearch && matchesType
  })

  const {
    selectedRows: selectedArtworks,
    isSelected,
    toggle,
    clear,
    deleteSelected,
  } = useSelection(filtered, (artwork) => artwork.ArtworkID)

  const handleEditSelected = () => {
    openEditModal(selectedArtworks[0])
  }

  const handleDeleteSelected = async () => {
    const deleted = await deleteSelected(
      'artwork',
      (artwork) => artwork.Title,
      (artwork) => callApi('/api/artworks/' + artwork.ArtworkID, 'DELETE')
    )

    if (deleted) refetchArtworks()
  }

  return (
    <div className="page page-wide">
      <div className="page-header">
        <div>
          <h1 className="page-title">Artworks</h1>
        </div>

        {allowEdit && (
          <div className="page-header-actions">
            <SelectionActions
              count={selectedArtworks.length}
              onEdit={handleEditSelected}
              onDelete={handleDeleteSelected}
            />

            <button
              type="button"
              className="btn primary"
              onClick={openAddModal}
            >
              Add Artwork
            </button>
          </div>
        )}
      </div>

      <div className="toolbar" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '220px' }}>
          <label htmlFor="artwork-search" className="sr-only">
            Search artworks
          </label>
          <input
            id="artwork-search"
            type="search"
            className="search-input"
            name="artworkSearch"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search artworks..."
            style={{ width: '100%', height: '40px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ minWidth: '180px' }}>
          <label htmlFor="artwork-type-filter" className="sr-only">
            Filter by type
          </label>
          <select
            id="artwork-type-filter"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={{ 
              width: '100%', 
              height: '40px', 
              padding: '0 12px', 
              boxSizing: 'border-box', 
              cursor: 'pointer',
              backgroundColor: '#fff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              color: '#334155'
            }}
          >
            <option value="">All Types</option>
            {filteredArtworkTypes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
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
            'data-table' + (selectedArtworks.length > 0 ? ' selecting' : '')
          }
        >
          <caption className="sr-only">Museum artworks</caption>

          <thead>
            <tr>
              {allowEdit && (
                <th scope="col" className="select-col">
                  <span className="sr-only">Select</span>
                </th>
              )}
              <th scope="col">Artwork</th>
              <th scope="col">Artist</th>
              <th scope="col">Collection</th>
              <th scope="col">Type</th>
              <th scope="col">Year Created</th>
              {showAudit && <th scope="col">Created By</th>}
              {showAudit && <th scope="col">Last Updated By</th>}
            </tr>
          </thead>

          <tbody>
            {filtered.map((item) => (
              <tr
                key={item.ArtworkID}
                className={isSelected(item.ArtworkID) ? 'selected-row' : ''}
              >
                {allowEdit && (
                  <td className="select-col">
                    <input
                      type="checkbox"
                      checked={isSelected(item.ArtworkID)}
                      onChange={() => toggle(item.ArtworkID)}
                      aria-label={`Select ${item.Title}`}
                    />
                  </td>
                )}

                <td className="strong">{item.Title}</td>

                <td>{item.ArtistName}</td>
                <td>{item.CollectionName}</td>

                <td>
                  <Badge
                    variant="active"
                    label={item.Type || 'Unknown'}
                  />
                </td>

                <td className="mono">
                  {item.YearCreated ?? '-'}
                </td>

                {showAudit && <td>{item.CreatedByName || '-'}</td>}
                {showAudit && <td>{item.UpdatedByName || '-'}</td>}
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5 + (showAudit ? 2 : 0) + (allowEdit ? 1 : 0)}
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
              {filteredArtworkTypes.map((item) => (
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
            <label htmlFor="artwork-year-created">Year Created</label>
            <input
              id="artwork-year-created"
              name="YearCreated"
              type="number"
              min="1000"
              max={currentYear}
              step="1"
              value={formData.YearCreated}
              onChange={handleChange}
              required
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
              {editingId === null ? 'Add Artwork' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Artworks