import React from 'react'
import ReactDOM from 'react-dom/client'
import{ BrowserRouter } from 'react-router-dom'
import App from './App'
import RoleProvider from './context/RoleProvider'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <RoleProvider>
        <App />
      </RoleProvider>
    </BrowserRouter>
  </React.StrictMode>
)
