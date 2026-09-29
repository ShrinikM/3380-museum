import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Exhibitions from './pages/Exhibitions'
import Tickets from './pages/Tickets'
import Memberships from './pages/Memberships'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <div className="app-layout">
        <Sidebar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/exhibitions" element={<Exhibitions />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/memberships" element={<Memberships />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App