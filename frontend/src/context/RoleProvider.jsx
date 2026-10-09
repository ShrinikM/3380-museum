import { useState } from 'react'
import { RoleContext } from './role'
import { ROLES, DEMO_LOGINS } from '../data/roles'

function getSavedUser() {
  const saved = localStorage.getItem('user')

  if(saved === null){
    return null
  }

  return JSON.parse(saved)
}

function RoleProvider({ children }) {
  const [user, setUser] = useState(getSavedUser)

  const login = (username, password) => {
    const found = DEMO_LOGINS.find((item)=>
      item.username === username && item.password === password
    )

    if(!found){
      return false
    }

    const loggedInUser = { username: found.username, role: found.role }
    localStorage.setItem('user', JSON.stringify(loggedInUser))
    setUser(loggedInUser)
    return true
  }

  const logout = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  const canView = (path) => {
    if(user === null){
      return false
    }

    if(path === '/'){
      return true
    }

    return ROLES[user.role].pages.includes(path)
  }

  const canEdit = (path) => {
    if(user === null){
      return false
    }

    return ROLES[user.role].edit.includes(path)
  }

  return (
    <RoleContext.Provider value={{ user, login, logout, canView, canEdit }}>
      {children}
    </RoleContext.Provider>
  )
}

export default RoleProvider
