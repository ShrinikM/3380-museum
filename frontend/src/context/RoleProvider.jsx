import { useState } from 'react'
import { RoleContext } from './role'
import { callApi } from '../api'
import { ROLES, DEMO_LOGINS } from '../data/roles'

function getSavedUser() {
  try {
    return JSON.parse(localStorage.getItem('user'))
  } catch {
    return null
  }
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

  const startCustomer = (data) => {
    const loggedInUser = {
      username: data.customer.Email,
      name: data.customer.FirstName,
      role: 'Customer',
      token: data.token,
    }

    localStorage.setItem('user', JSON.stringify(loggedInUser))
    setUser(loggedInUser)
  }

  const loginCustomer = async (email, password) => {
    const data = await callApi('/api/customer/login', 'POST', {
      Email: email,
      Password: password,
    })

    startCustomer(data)
  }

  const registerCustomer = async (details) => {
    const data = await callApi('/api/customer/register', 'POST', details)

    startCustomer(data)
  }

  const logout = () => {
    if (user !== null && user.token) {
      callApi('/api/customer/logout', 'POST').catch(() => {})
    }

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
    <RoleContext.Provider value={{ user, login, loginCustomer, registerCustomer, logout, canView, canEdit }}>
      {children}
    </RoleContext.Provider>
  )
}

export default RoleProvider
