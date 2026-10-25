export async function callApi(url, method, body) {
  const options = { method: method, headers: {} }

  const savedUser = localStorage.getItem('user')
  let customerToken = null

  if (savedUser !== null) {
    const user = JSON.parse(savedUser)

    if (user.token) {
      customerToken = user.token
      options.headers['X-Customer-Token'] = user.token
    } else {
      options.headers['X-Username'] = user.username
    }
  }

  if (body) {
    options.headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }

  const response = await fetch(url, options)
  const data = await response.json().catch(() => ({}))

  if (response.status === 401 && customerToken !== null) {
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  if (!response.ok) {
    throw new Error(data.error || 'Could not reach the server')
  }

  if (method !== 'GET') {
    window.dispatchEvent(new Event('refresh-alerts'))
  }

  return data
}
