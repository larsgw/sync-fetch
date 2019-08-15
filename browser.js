function syncFetch (...args) {
  const [url, opts] = parseArgs(...args)

  const xhr = new XMLHttpRequest()

  // Request
  xhr.open(opts.method || 'GET', url, false)

  for (const header of opts.headers) {
    xhr.setRequestHeader(...header)
  }

  // if (opts.signal) {
  //   opts.signal.addEventListener('abort', () => xhr.abort())
  // }

  xhr.send(opts.body || null)

  // Response
  let headers = xhr.getAllResponseHeaders()
  headers = headers && headers.split('\r\n').filter(Boolean).map(header => header.split(': ', 2))

  return new syncFetch.Response(xhr.response, {
    status: xhr.status,
    statusText: xhr.statusText,
    headers
  })
}

function parseArgs (resource, init) {
  const request = []

  if (typeof resource === 'object') {
    request.push(resource.url)
    request.push({
      method: resource.method,
      headers: resource.headers,
      body: resource.body,
      // credentials: resource.credentials,
      // signal: resource.signal
    })
  } else {
    request.push(resource, {})
  }

  Object.assign(request[1], init)

  request[1].headers = new syncFetch.Headers(request[1].headers || {})

  return request
}

const _body = Symbol('bodyBuffer')

class SyncResponse extends Response {
  constructor (body, type) {
    super()
  }

  clone ()
}

syncFetch.Headers = Headers
syncFetch.Request = Request
syncFetch.Response = SyncResponse
module.exports = syncFetch
