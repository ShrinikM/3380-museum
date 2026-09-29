import{ BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import './App.css'

function Home(){
  return (
    <div>
      <h1>Museum Database</h1>
      <p>Museum of Fine Arts, Houston</p>
    </div>
  )
}

function App(){
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App