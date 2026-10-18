export async function callApi(url, method, body) {
  const options = { method: method, headers: {} }

  const savedUser = localStorage.getItem('user')
  if (savedUser !== null) {
    options.headers['X-Username'] = JSON.parse(savedUser).username
  }

  if (body) {
    options.headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }

  const response = await fetch(url, options)
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || 'Could not reach the server')
  }

  return data
}
