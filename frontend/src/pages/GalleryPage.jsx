import { useState } from 'react'
import { Panel } from '../components/ui'

const initialArtworks = [
  {
    id: 1,
    title: 'Mona Lisa',
    artist: 'Leonardo da Vinci',
    medium: 'Oil on Poplar',
    category: 'Painting',
    year: '1503',
    imageUrl: '/images/mona-lisa.jpeg',
  },
  {
    id: 18,
    title: 'Nefertiti Bust',
    artist: 'Thutmose',
    medium: 'Limestone',
    category: 'Sculpture',
    year: '1345 BC',
    imageUrl: '/images/nefertiti.jpeg',
  },
  {
    id: 21,
    title: 'The Horse in Motion',
    artist: 'Eadweard Muybridge',
    medium: 'Albumen Silver Print',
    category: 'Photography',
    year: '1878',
    imageUrl: '/images/horse.jpeg',
  },
  {
    id: 26,
    title: 'Canyon',
    artist: 'Robert Rauschenberg',
    medium: 'Oil, Pencil, Paper, Metal, and Wood',
    category: 'Mixed Media',
    year: '1959',
    imageUrl: '/images/canyon.jpeg',
  },
  {
    id: 2,
    title: 'The Starry Night',
    artist: 'Vincent van Gogh',
    medium: 'Oil on Canvas',
    category: 'Painting',
    year: '1889',
    imageUrl: '/images/starry-night.jpeg',
  },
  {
    id: 13,
    title: 'Venus de Milo',
    artist: 'Alexandros of Antioch',
    medium: 'Marble',
    category: 'Sculpture',
    year: '1820',
    imageUrl: '/images/venus.jpeg',
  },
  {
    id: 22,
    title: 'Lunch atop a Skyscraper',
    artist: 'Charles Clyde Ebbets',
    medium: 'Black and White Photograph',
    category: 'Photography',
    year: '1932',
    imageUrl: '/images/lunch.jpeg',
  },
  {
    id: 27,
    title: 'Still Life with Chair Caning',
    artist: 'Pablo Picasso',
    medium: 'Oil, Printed Oilcloth, and Rope',
    category: 'Mixed Media',
    year: '1912',
    imageUrl: '/images/still-life.jpeg',
  },
  {
    id: 3,
    title: 'The School of Athens',
    artist: 'Raphael',
    medium: 'Fresco',
    category: 'Painting',
    year: '1509-1511',
    imageUrl: '/images/athens.jpeg',
  },
  {
    id: 15,
    title: 'Winged Victory of Samothrace',
    artist: 'Unknown',
    medium: 'Marble',
    category: 'Sculpture',
    year: '19 BC',
    imageUrl: '/images/winged.jpeg',
  },
  {
    id: 23,
    title: 'V-J Day in Times Square',
    artist: 'Alfred Eisenstaedt',
    medium: 'Black and White Photograph',
    category: 'Photography',
    year: '1945',
    imageUrl: '/images/kiss.jpeg',
  },
  {
    id: 29,
    title: 'Fruit Dish and Glass',
    artist: 'Georges Braque',
    medium: 'Charcoal, Wallpaper, and Gouache',
    category: 'Mixed Media',
    year: '1912',
    imageUrl: '/images/fruit.jpeg',
  },

  {
    id: 4,
    title: 'The Last Supper',
    artist: 'Leonardo da Vinci',
    medium: 'Tempera and Oil',
    category: 'Painting',
    year: '1498',
    imageUrl: '/images/last-supper.jpeg',
  },
  {
    id: 16,
    title: 'Judith and Holofernes',
    artist: 'Donatello',
    medium: 'Bronze',
    category: 'Sculpture',
    year: '1455-1460',
    imageUrl: '/images/judith.jpeg',
  },
  {
    id: 24,
    title: 'Earthrise',
    artist: 'William Anders',
    medium: 'Color Photography',
    category: 'Photography',
    year: '1945',
    imageUrl: '/images/earth.jpeg',
  },
  {
    id: 30,
    title: 'The Large Glass',
    artist: 'Marcel Duchamp',
    medium: 'Oil, Varnish, Glass Panels, and Wire',
    category: 'Mixed Media',
    year: '1915-1923',
    imageUrl: '/images/large-glass.jpeg',
  },
  {
    id: 5,
    title: 'Swaying Dancer',
    artist: 'Edgar Degas',
    medium: 'Pastel and Gouache on Paper',
    category: 'Painting',
    year: '1877-1879',
    imageUrl: '/images/swaying-dancer.jpeg',
  },
  {
    id: 17,
    title: 'Pietà',
    artist: 'Michelangelo',
    medium: 'Marble',
    category: 'Sculpture',
    year: '1498-1499',
    imageUrl: '/images/pieta.jpeg',
  },
  {
    id: 25,
    title: 'Tartan Ribbon',
    artist: 'James Clerk Maxwell',
    medium: 'Color Photography',
    category: 'Photography',
    year: '1861',
    imageUrl: '/images/tartan.jpeg',
  },
  {
    id: 31,
    title: 'Invisible',
    artist: 'Bertina Lopes',
    medium: 'Oil, Acrylic, and Scrap Pieces',
    category: 'Mixed Media',
    year: '1996',
    imageUrl: '/images/invisible.jpeg',
  },
  {
    id: 6,
    title: 'The Kiss',
    artist: 'Gustav Klimt',
    medium: 'Oil and Gold Leaf on Canvas',
    category: 'Painting',
    year: '1908',
    imageUrl: '/images/the-kiss.jpeg',
  },
  {
    id: 19,
    title: 'Moses',
    artist: 'Michelangelo',
    medium: 'Marble',
    category: 'Sculpture',
    year: '1513-1515',
    imageUrl: '/images/moses.jpeg',
  },
  {
    id: 7,
    title: 'The Scream',
    artist: 'Edvard Munch',
    medium: 'Tempera and Oil on Cardboard',
    category: 'Painting',
    year: '1893',
    imageUrl: '/images/the-scream.jpeg',
  },
  {
    id: 9,
    title: 'Girl with a Pearl Earring',
    artist: 'Johannes Vermeer',
    medium: 'Oil on Canvas',
    category: 'Painting',
    year: '1665',
    imageUrl: '/images/pearl-earring.jpeg',
  },

  {
    id: 8,
    title: 'Las Meninas',
    artist: 'Diego Velázquez',
    medium: 'Oil on Canvas', 
    category: 'Painting',
    year: '1656',
    imageUrl: '/images/las-meninas.jpeg',
  },
  {
    id: 10,
    title: 'The Dance Class',
    artist: 'Edgar Degas',
    medium: 'Oil on Canvas',
    category: 'Painting',
    year: '1874',
    imageUrl: '/images/dance-class.jpeg',
  },
  {
    id: 11,
    title: 'Almond Blossoms',
    artist: 'Vincent van Gogh',
    medium: 'Oil on Canvas',
    category: 'Painting',
    year: '1656',
    imageUrl: '/images/almond-blssm.jpeg',
  },
  {
    id: 12,
    title: 'Marie Antoinette with a Rose',
    artist: 'Élisabeth Louise Vigée Le Brun',
    medium: 'Oil on Canvas',
    category: 'Painting',
    year: '1783',
    imageUrl: '/images/rose.jpeg',
  },
  {
    id: 20,
    title: 'View from the Window at Le Gras',
    artist: 'Nicéphore Niépce',
    medium: 'Black and White Photograph',
    category: 'Photography',
    year: '1827',
    imageUrl: '/images/view-from.jpeg',
  },
  {
    id: 32,
    title: 'The Beginning of Life in the Yellow Jungle',
    artist: 'Thornton Dial',
    medium: 'Plastic Bottles, Doll, Flowers, and Wire',
    category: 'Mixed Media',
    year: '2003',
    imageUrl: '/images/beginning.jpeg',
  },
]

const ITEMS_PER_PAGE = 12

function GalleryPage() {
  const [artworks] = useState(initialArtworks)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredArtworks = artworks.filter((artwork) => {
    const searchText = search.toLowerCase()
    const matchesSearch =
      artwork.title.toLowerCase().includes(searchText) ||
      artwork.artist.toLowerCase().includes(searchText)

    const matchesCategory =
      selectedCategory === 'All' || artwork.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const totalPages = Math.ceil(filteredArtworks.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedArtworks = filteredArtworks.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  )

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value)
    setCurrentPage(1)
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', backgroundColor: '#fdfbf7' }}>
      <div style={{ maxWidth: '1180px', width: '100%', padding: '0 20px 40px 20px', boxSizing: 'border-box' }}>
        
        <div style={{ marginTop: '24px', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Gallery</h1>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: '24px',
            width: '100%',
          }}
        >
          <div style={{ flex: 1, minWidth: '240px' }}>
            <label htmlFor="gallery-search" className="sr-only">
              Search gallery artworks
            </label>
            <input
              id="gallery-search"
              name="gallerySearch"
              type="search"
              className="search-input"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search gallery by title or artist..."
              style={{
                width: '100%',
                height: '42px',
                padding: '0 14px 0 38px', 
                boxSizing: 'border-box',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
              }}
            />
          </div>

          <div style={{ minWidth: '180px' }}>
            <label htmlFor="gallery-category-filter" className="sr-only">
              Filter gallery by type
            </label>
            <select
              id="gallery-category-filter"
              value={selectedCategory}
              onChange={handleCategoryChange}
              style={{
                width: '100%',
                height: '42px',
                padding: '0 12px',
                boxSizing: 'border-box',
                cursor: 'pointer',
                backgroundColor: '#fff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                color: '#334155',
              }}
            >
              <option value="All">All Types</option>
              <option value="Painting">Painting</option>
              <option value="Sculpture">Sculpture</option>
              <option value="Photography">Photography</option>
              <option value="Mixed Media">Mixed Media</option>
            </select>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
            width: '100%',
          }}
        >
          {paginatedArtworks.map((artwork) => (
            <Panel
              key={artwork.id}
              className="card"
              style={{
                width: '100%',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  height: '210px',
                  backgroundColor: '#f1f5f9',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <img
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div
                  className="strong"
                  style={{ fontSize: '16px', color: '#1e293b' }}
                >
                  {artwork.title}
                </div>
                <div className="cell-sub" style={{ color: '#64748b' }}>
                  By {artwork.artist} ({artwork.year})
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    color: '#475569',
                    paddingTop: '4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
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
          <p className="empty" style={{ marginTop: '40px', textAlign: 'center' }}>
            No artworks found matching your search.
          </p>
        )}

        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '16px',
              marginTop: '36px',
              marginBottom: '20px',
            }}
          >
            <button
              type="button"
              className="btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              style={{
                backgroundColor: '#C8102E',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontWeight: '500',
                opacity: currentPage === 1 ? 0.5 : 1,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Previous
            </button>

            <span style={{ fontSize: '14px', color: '#475569', fontWeight: '500' }}>
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              className="btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              style={{
                backgroundColor: '#C8102E',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontWeight: '500',
                opacity: currentPage === totalPages ? 0.5 : 1,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Next
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default GalleryPage