import{ Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Exhibitions from './pages/Exhibitions'
import Tickets from './pages/Tickets'
import Memberships from './pages/Memberships'
import GiftShop from './pages/GiftShop'
import Cafe from './pages/Cafe'
import './App.css'


function ComingSoon({ title }){
  return(
    <div className="page">
      <h1 className="page-title">{title}</h1>
      <p className="page-subtitle">This page is being built.</p>
    </div>
  )
}

function NotFound(){
  return(
    <div className="page">
      <h1 className="page-title">Page not found</h1>
      <p className="page-subtitle">Use the sidebar to choose a section.</p>
    </div>
  )
}

function App(){
  return(
    <>
      <Navbar />

      <div className="app-layout">
        <Sidebar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />

            <Route path="/artists" element={<ComingSoon title="Artists" />} />
            <Route path="/artworks" element={<ComingSoon title="Artworks" />} />
            <Route path="/collections" element={<ComingSoon title="Collections" />} />
            <Route path="/exhibitions" element={<Exhibitions />} />

            <Route path="/tickets" element={<Tickets />} />
            <Route path="/memberships" element={<Memberships />} />
            <Route path="/gift-shop" element={<GiftShop />} />
            <Route path="/cafe" element={<Cafe />} />

            <Route path="/donations" element={<ComingSoon title="Donations" />} />
            <Route path="/staff" element={<ComingSoon title="Staff" />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </>
  )
}

export default App