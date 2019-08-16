const exec = require('child_process').execFileSync
const path = require('path')
const _fetch = require('node-fetch')

const errors = {
  TypeError
}

function fetch (resource, init) {
  const request = []

  if (typeof resource === 'object') {
    request.push(resource.url)
    request.push({
      method: resource.method,
      headers: resource.headers,
      body: resource.body,
      mode: resource.mode,
      credentials: resource.credentials,
      cache: resource.cache,
      redirect: resource.redirect,
      referrer: resource.referrer,
      referrerPolicy: resource.referrerPolicy,
      integrity: resource.integrity,
      keepalive: resource.keepalive,
      // signal: resource.signal
    })
  } else {
    request.push(resource, {})
  }

  Object.assign(request[1], init)

  if (request[1].headers instanceof _fetch.Headers) {
    request[1].headers = Array.from(request[1].headers)
  }

  if (request[1].body) {
    request[1].body = parseBody(init.body).toString()
  }

  // TODO credentials

  const response = JSON.parse(sendMessage(request))
  if ('headers' in response[1]) {
    return new fetch.Response(...response)
  } else if (response[0] in errors) {
    throw new errors[response[0]](...response[1])
  } else {
    throw new fetch.FetchError(...response[1])
  }
}

function sendMessage (message) {
  return exec(process.execPath, [path.join(__dirname, 'worker.js')], {
    input: JSON.stringify(message),
    shell: false
  })
}

const _body = Symbol('bodyBuffer')

class Request extends _fetch.Request {
  constructor (resource, init) {
    if (init) {
      init = { ...init }
      if (init.body) {
        init.body = parseBody(init.body)
      }
    }

    super(resource, init)

    defineBuffer(this, init && init.body)
  }

  clone () {
    const clone = super.clone()
    defineBuffer(clone, this.buffer())
    return clone
  }

  arrayBuffer () {
    super.arrayBuffer()
    const buf = this[_body]
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  }

  text () {
    super.text()
    return this[_body].toString()
  }

  json () {
    super.json()
		try {
			return JSON.parse(this.text())
		} catch (err) {
			throw new fetch.FetchError(`invalid json response body at ${this.url} reason: ${err.message}`, 'invalid-json')
		}
	}

  buffer () {
    super.buffer()
    return Buffer.from(this[_body])
  }
}

class Response extends _fetch.Response {
  constructor (body, init) {
    const buffer = body == null ? null : Buffer.from(body)
    super(buffer, init)
    defineBuffer(this, buffer)
  }

  clone () {
    const clone = super.clone()
    defineBuffer(clone, this.buffer())
    return clone
  }

  arrayBuffer () {
    super.arrayBuffer()
    const buf = this[_body]
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  }

  text () {
    super.text()
    return this[_body].toString()
  }

  json () {
    super.json()
		try {
			return JSON.parse(this[_body].toString())
		} catch (err) {
			throw new fetch.FetchError(`invalid json response body at ${this.url} reason: ${err.message}`, 'invalid-json')
		}
	}

  buffer () {
    super.buffer()
    return Buffer.from(this[_body])
  }
}

function defineBuffer (body, buffer) {
  Object.defineProperty(body, _body, {
    value: buffer,
    enumerable: false
  })
}

function parseBody (body) {
  // body is undefined or null
  if (body == null) {
    return null

  // body is Buffer
  } else if (Buffer.isBuffer(body)) {
    return body

  // body is ArrayBuffer
  } else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
    return Buffer.from(body)

  // body is ArrayBufferView
  } else if (ArrayBuffer.isView(body)) {
    return Buffer.from(body.buffer, body.byteOffset, body.byteLength)

  // none of the above
  // coerce to string then buffer
  } else {
    return Buffer.from(String(body))
  }
}

fetch.Headers = _fetch.Headers
fetch.FetchError = _fetch.FetchError
fetch.Request = Request
fetch.Response = Response
module.exports = fetch
