import { useState } from 'react'
import { RoleContext } from './role'
import { ROLES, DEMO_LOGINS } from '../data/roles'
import { callApi } from '../api'

function getSavedUser() {
  try {
    return JSON.parse(localStorage.getItem('user'))
  } catch {
    return null
  }
}

function RoleProvider({ children }) {
  const [user, setUser] = useState(getSavedUser)

  const saveUser = (loggedInUser) => {
    localStorage.setItem('user', JSON.stringify(loggedInUser))
    setUser(loggedInUser)
  }

  const login = async (username, password) => {
    const staff = DEMO_LOGINS.find((item)=>
      item.username === username && item.password === password
    )

    if(staff){
      saveUser({ username: staff.username, role: staff.role })
      return ''
    }

    try {
      const customer = await callApi('/api/customer/login', 'POST', {
        Username: username,
        Password: password,
      })

      saveUser(customer)
      return ''
    } catch (error) {
      return error.message
    }
  }

  const logout = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  const canView = (path) => {
    if(user === null){
      return false
    }

    return ROLES[user.role]?.pages.includes(path) ?? false
  }

  const canEdit = (path) => {
    if(user === null){
      return false
    }

    return ROLES[user.role]?.edit.includes(path) ?? false
  }

  return (
    <RoleContext.Provider value={{ user, login, logout, canView, canEdit }}>
      {children}
    </RoleContext.Provider>
  )
}

export default RoleProvider