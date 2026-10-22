import { useState } from 'react'
import { Panel } from '../components/ui'

const initialArtworks = [
  {
    id: 1,
    title: 'Mona Lisa',
    artist: 'Leonardo da Vinci',
    medium: 'Oil on Poplar',
    year: '1503',
    imageUrl: '/images/mona-lisa.jpeg',
  },
  {
    id: 2,
    title: 'The Starry Night',
    artist: 'Vincent van Gogh',
    medium: 'Oil on Canvas',
    year: '1889',
    imageUrl: '/images/starry-night.jpeg',
  },
  {
    id: 3,
    title: 'The School of Athens',
    artist: 'Raphael',
    medium: 'Fresco',
    year: '1509-1511',
    imageUrl: '/images/athens.jpeg',
  },
  {
    id: 4,
    title: 'The Last Supper',
    artist: 'Leonardo da Vinci',
    medium: 'Tempera and Oil',
    year: '1498',
    imageUrl: '/images/last-supper.jpeg',
  },
  {
    id: 5,
    title: 'Swaying Dancer',
    artist: 'Edgar Degas',
    medium: 'Pastel and Gouache on Paper',
    year: '1877-1879',
    imageUrl: '/images/swaying-dancer.jpeg',
  },
  {
    id: 6,
    title: 'The Kiss',
    artist: 'Gustav Klimt',
    medium: 'Oil and Gold Leaf on Canvas',
    year: '1908',
    imageUrl: '/images/the-kiss.jpeg',
  },
  {
    id: 7,
    title: 'The Scream',
    artist: 'Edvard Munch',
    medium: 'Tempera and Oil on Cardboard',
    year: '1893',
    imageUrl: '/images/the-scream.jpeg',
  },
  {
    id: 8,
    title: 'Las Meninas',
    artist: 'Diego Velázquez',
    medium: 'Oil on Canvas', 
    year: '1656',
    imageUrl: '/images/las-meninas.jpeg',
  },
  {
    id: 9,
    title: 'Girl with a Pearl Earring',
    artist: 'Johannes Vermeer',
    medium: 'Oil on Canvas',
    year: '1665',
    imageUrl: '/images/pearl-earring.jpeg',
  }, 
  {
    id: 10,
    title: 'The Dance Class',
    artist: 'Edgar Degas',
    medium: 'Oil on Canvas',
    year: '1874',
    imageUrl: '/images/dance-class.jpeg',
  },
  {
    id: 11,
    title: 'Almond Blossoms',
    artist: 'Vincent van Gogh',
    medium: 'Oil on Canvas',
    year: '1656',
    imageUrl: '/images/almond-blssm.jpeg',
  },
  {
    id: 12,
    title: 'Marie Antoinette with a Rose',
    artist: 'Élisabeth Louise Vigée Le Brun',
    medium: 'Oil on Canvas',
    year: '1783',
    imageUrl: '/images/rose.jpeg',
  },
]

function GalleryPage() {
  const [artworks] = useState(initialArtworks)
  const [search, setSearch] = useState('')

  const filteredArtworks = artworks.filter((artwork) => {
    const searchText = search.toLowerCase()
    return (
      artwork.title.toLowerCase().includes(searchText) ||
      artwork.artist.toLowerCase().includes(searchText)
    )
  })

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gallery</h1>
        </div>
      </div>

      <div className="toolbar" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="gallery-search" className="sr-only">
            Search gallery artworks
          </label>
          <input
            id="gallery-search"
            name="gallerySearch"
            type="search"
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search gallery by title or artist..."
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '20px', 
          marginTop: '20px'
        }}
      >
        {filteredArtworks.map((artwork) => (
          <Panel 
            key={artwork.id} 
            className="card" 
            style={{ 
              overflow: 'hidden', 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%' 
            }}
          >
            <div style={{ height: '220px', backgroundColor: '#f1f5f9', overflow: 'hidden', flexShrink: 0 }}>
              <img 
                src={artwork.imageUrl} 
                alt={artwork.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
              <div className="strong" style={{ fontSize: '16px', color: '#1e293b' }}>{artwork.title}</div>
              <div className="cell-sub" style={{ color: '#64748b' }}>
                By {artwork.artist} ({artwork.year})
              </div>
              <div 
                style={{ 
                  fontSize: '14px', 
                  color: '#475569', 
                  marginTop: 'auto', 
                  paddingTop: '8px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                title={artwork.medium}
              >
                {artwork.medium}
              </div>
            </div>
          </Panel>
        ))}
      </div>

      {filteredArtworks.length === 0 && (
        <p className="empty" style={{ marginTop: '40px' }}>No artworks found matching your search.</p>
      )}
    </div>
  )
}

export default GalleryPage