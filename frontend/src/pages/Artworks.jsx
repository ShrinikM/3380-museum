import { useState, useEffect } from 'react'
import{ Badge, Panel, Modal } from '../components/ui'
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
  const [type, setType] = useState('all')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    Title: '',
    Type: '',
    ArtistID: '',
    CollectionID: '',
    DateCreated: '',
    CreatedBy: ''
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
    setReloadCount(reloadCount + 1)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const resetForm = () => {
    setFormData({
      Title: '',
      Type: '',
      ArtistID: '',
      CollectionID: '',
      DateCreated: '',
      CreatedBy: ''
    })
  }

  const openAddModal = () => {
    resetForm()
    setEditingId(null)
    setOpen(true)
  }

  const openEditModal = (artwork) => {
    setFormData({
      Title: artwork.Title,
      Type: artwork.Type,
      ArtistID: String(artwork.ArtistID),
      CollectionID: String(artwork.CollectionID),
      DateCreated: artwork.DateCreated,
      CreatedBy: ''
    })
    setEditingId(artwork.ArtworkID)
    setOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if(formData.DateCreated > today){
      alert('Date Created cannot be in the future.')
      return
    }

    if(formData.CreatedBy && Number(formData.CreatedBy) < 1){
      alert('Created By must be a positive Staff ID.')
      return
    }

    const artworkData = {
      Title: formData.Title,
      Type: formData.Type,
      ArtistID: Number(formData.ArtistID),
      CollectionID: Number(formData.CollectionID),
      DateCreated: formData.DateCreated
    }

    try {
      if(editingId === null){
        artworkData.CreatedBy = formData.CreatedBy ? Number(formData.CreatedBy) : null
        await callApi('/api/artworks', 'POST', artworkData)
      } else {
        await callApi('/api/artworks/' + editingId, 'PUT', artworkData)
      }
    } catch (err) {
      alert(err.message)
      return
    }

    resetForm()
    setOpen(false)
    refetchArtworks()
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this artwork?')

    if(!confirmed){
      return
    }

    try {
      await callApi('/api/artworks/' + id, 'DELETE')
    } catch (err) {
      alert(err.message)
      return
    }

    refetchArtworks()
  }

  const filtered = artworks.filter((artwork)=>{
    const searchText = search.toLowerCase()

    const matchesSearch =
      artwork.Title.toLowerCase().includes(searchText) ||
      artwork.ArtistName.toLowerCase().includes(searchText) ||
      artwork.CollectionName.toLowerCase().includes(searchText)

    const matchesType =
      type === 'all' || artwork.Type === type

    return matchesSearch && matchesType
  })

  const artistsRepresented = new Set(artworks.map((artwork)=> artwork.ArtistID))
  const collectionsUsed = new Set(artworks.map((artwork)=> artwork.CollectionID))

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Artworks</h1>
          <p className="page-subtitle">
            Manage museum artworks and their information.
          </p>
        </div>

        {allowEdit && (
          <button className="btn primary" onClick={openAddModal}>
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
          <div className="summary-value">{artistsRepresented.size}</div>
          <div className="summary-label">Artists Represented</div>
        </Panel>

        <Panel className="summary-card">
          <div className="summary-value">{collectionsUsed.size}</div>
          <div className="summary-label">Collections</div>
        </Panel>
      </div>

      <div className="toolbar">
        <input
          value={search}
          onChange={(e)=> setSearch(e.target.value)}
          placeholder="Search artworks..."
        />

        <select
          value={type}
          onChange={(e)=> setType(e.target.value)}
        >
          <option value="all">All Types</option>

          {ARTWORK_TYPES.map((item)=>(
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {loadError && <p className="empty">{loadError}</p>}

      <div className="card table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Artwork</th>
              <th>Artist</th>
              <th>Collection</th>
              <th>Type</th>
              <th>Date Created</th>
              <th>Created By</th>
              {allowEdit && <th>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {filtered.map((item)=>(
              <tr key={item.ArtworkID}>
                <td>
                  <div className="strong">
                    {item.Title}
                  </div>
                  <div className="cell-sub mono">
                    #{String(item.ArtworkID).padStart(5, '0')}
                  </div>
                </td>

                <td>
                  {item.ArtistName}
                </td>

                <td>
                  {item.CollectionName}
                </td>

                <td>
                  <Badge
                    variant="active"
                    label={item.Type || 'Unknown'}
                  />
                </td>

                <td className="mono">
                  {item.DateCreated}
                </td>

                <td className="mono">
                  {item.CreatedBy || '-'}
                </td>

                {allowEdit && (
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn secondary"
                        onClick={()=> openEditModal(item)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn danger"
                        onClick={()=> handleDelete(item.ArtworkID)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        title={editingId === null ? 'Add Artwork' : 'Edit Artwork'}
        onClose={()=> setOpen(false)}
      >
        <form onSubmit={handleSubmit} className="form-grid">

          <div className="form-group">
            <label>Title</label>
            <input
              name="Title"
              value={formData.Title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Type</label>
            <select
              name="Type"
              value={formData.Type}
              onChange={handleChange}
              required
            >
              <option value="">Select a type</option>

              {ARTWORK_TYPES.map((item)=>(
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Artist</label>
            <select
              name="ArtistID"
              value={formData.ArtistID}
              onChange={handleChange}
              required
            >
              <option value="">Select an artist</option>

              {artists.map((artist)=>(
                <option key={artist.ArtistID} value={artist.ArtistID}>
                  {artist.FirstName} {artist.LastName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Collection</label>
            <select
              name="CollectionID"
              value={formData.CollectionID}
              onChange={handleChange}
              required
            >
              <option value="">Select a collection</option>

              {collections.map((collection)=>(
                <option key={collection.CollectionID} value={collection.CollectionID}>
                  {collection.Name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Date Created</label>
            <input
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
              <label>Created By</label>
              <input
                name="CreatedBy"
                type="number"
                min="1"
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
              onClick={()=>{
                resetForm()
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
