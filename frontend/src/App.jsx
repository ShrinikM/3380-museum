import{ Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Exhibitions from './pages/Exhibitions'
import Tickets from './pages/Tickets'
import Memberships from './pages/Memberships'
import GiftShop from './pages/GiftShop'
import Cafe from './pages/Cafe'
import Artists from './pages/Artists'
import Artworks from './pages/Artworks'
import Login from './pages/Login'
import{ useRole } from './context/role'
import './App.css'


function ComingSoon({ title }){
  return(
    <div className="page">
      <h1 className="page-title">{title}</h1>
      <p className="page-subtitle">This page is being built.</p>
    </div>
  )
}

function NoAccess(){
  return(
    <div className="page">
      <h1 className="page-title">No access</h1>
      <p className="page-subtitle">Your role cannot view this page.</p>
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
  const { user, canView } = useRole()

  if(user === null){
    return <Login />
  }

  const protect = (path, page) => {
    if(canView(path)){
      return page
    }
    return <NoAccess />
  }

  return(
    <>
      <Navbar />

      <div className="app-layout">
        <Sidebar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />

            <Route path="/artists" element={protect('/artists', <Artists />)} />
            <Route path="/artworks" element={protect('/artworks', <Artworks />)} />
            <Route path="/collections" element={protect('/collections', <Collections />)} />
            <Route path="/exhibitions" element={protect('/exhibitions', <Exhibitions />)} />

            <Route path="/tickets" element={protect('/tickets', <Tickets />)} />
            <Route path="/memberships" element={protect('/memberships', <Memberships />)} />
            <Route path="/gift-shop" element={protect('/gift-shop', <GiftShop />)} />
            <Route path="/cafe" element={protect('/cafe', <Cafe />)} />

            <Route path="/donations" element={protect('/donations', <ComingSoon title="Donations" />)} />
            <Route path="/staff" element={protect('/staff', <ComingSoon title="Staff" />)} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </>
  )
}

export default App