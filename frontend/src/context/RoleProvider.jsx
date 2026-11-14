import { useEffect, useRef, useState } from 'react'
import { RoleContext } from './role'
import { callApi } from '../api'
import { CUSTOMER_PAGES } from '../data/roles'

function getSavedUser(){
  try{
    return JSON.parse(localStorage.getItem('user'))
  }
  catch{
    return null
  }
}

function emptyPermissions(){
  return { pages: [], edit: [] }
}

function RoleProvider({ children }){
  const [user, setUser] = useState(getSavedUser)
  const permissionsLoaded = useRef(false)

  const startStaff = (data)=>{
    const loggedInUser = {
      username: data.Email,
      name: data.FirstName,
      role: data.Role,
      permissions: data.Permissions || emptyPermissions(),
    }

    permissionsLoaded.current = true
    localStorage.setItem('user', JSON.stringify(loggedInUser))
    setUser(loggedInUser)
  }

  const startCustomer = (data)=>{
    const loggedInUser = {
      username: data.customer.Email,
      name: data.customer.FirstName,
      role: 'Customer',
      token: data.token,
    }

    permissionsLoaded.current = true
    localStorage.setItem('user', JSON.stringify(loggedInUser))
    setUser(loggedInUser)
  }

  const loginStaff = async (email, password)=>{
    const data = await callApi('/api/staff/login', 'POST', {
      Email: email,
      Password: password,
    })

    startStaff(data)
  }

  const loginCustomer = async (email, password)=>{
    const data = await callApi('/api/customer/login', 'POST', {
      Email: email,
      Password: password,
    })

    startCustomer(data)
  }

  const registerCustomer = async (details)=>{
    const data = await callApi('/api/customer/register', 'POST', details)

    startCustomer(data)
  }

  const logout = ()=>{
    if(user !== null && user.token){
      callApi('/api/customer/logout', 'POST').catch(()=>{})
    }

    permissionsLoaded.current = false
    localStorage.removeItem('user')
    setUser(null)
  }

  useEffect(()=>{
    if(
      user === null ||
      user.role === 'Customer' ||
      user.token ||
      permissionsLoaded.current ||
      user.permissions?.pages?.length
    ){
      return
    }

    let cancelled = false
    permissionsLoaded.current = true

    callApi('/api/staff/permissions', 'GET')
      .then((data)=>{
        if(cancelled){
          return
        }

        const nextUser = {
          ...user,
          role: data.Role || user.role,
          permissions: data.Permissions || emptyPermissions(),
        }

        localStorage.setItem('user', JSON.stringify(nextUser))
        setUser(nextUser)
      })
      .catch(()=>{
        permissionsLoaded.current = false
      })

    return ()=>{
      cancelled = true
    }
  }, [user])

  const canView = (path)=>{
    if(user === null){
      return false
    }

    if(user.role === 'Customer'){
      return CUSTOMER_PAGES.includes(path)
    }

    return user.permissions?.pages?.includes(path) ?? false
  }

  const canEdit = (path)=>{
    if(user === null || user.role === 'Customer'){
      return false
    }

    return user.permissions?.edit?.includes(path) ?? false
  }

  return (
    <RoleContext.Provider value={{ user, loginStaff, loginCustomer, registerCustomer, logout, canView, canEdit }}>
      {children}
    </RoleContext.Provider>
  )
}

export default RoleProvider

