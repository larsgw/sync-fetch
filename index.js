const exec = require('child_process').execFileSync
const path = require('path')
const _fetch = require('node-fetch')

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
    request[1].headers = request[1].headers.entries()
  }

  if (request[1].body) {
    request[1].body = (new Body(init.body)).string()
  }

  // TODO credentials

  const response = JSON.parse(sendMessage(request))
  if (response.length === 3) {
    throw new fetch.FetchError(...response)
  } else {
    return new fetch.Response(...response)
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
        init.body = (new Body(init.body)).buffer()
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
}

function defineBuffer (body, buffer) {
  Object.defineProperty(body, _body, {
    value: buffer,
    enumerable: false
  })
}

class Body {
  // Body methods adapted from node-fetch/src/body.js
  constructor (body) {
    // body is undefined or null
    if (body == null) {
  		this[_body] = null

    // body is Buffer
  	} else if (Buffer.isBuffer(body)) {
      this[_body] = body

    // body is ArrayBuffer
  	} else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
  		this[_body] = Buffer.from(body)

    // body is ArrayBufferView
  	} else if (ArrayBuffer.isView(body)) {
  		this[_body] = Buffer.from(body.buffer, body.byteOffset, body.byteLength)

    // none of the above
    // coerce to string then buffer
  	} else {
  		this[_body] = Buffer.from(String(body))
  	}
  }

  arrayBuffer () {
    const buf = this[_body]
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  }

  text () {
    return this[_body].toString()
  }

  json () {
		try {
			return JSON.parse(this.text())
		} catch (err) {
			throw new fetch.FetchError(`invalid json response body at ${this.url} reason: ${err.message}`, 'invalid-json')
		}
	}

  buffer () {
    return Buffer.from(this[_body])
  }
}

Body.mixIn = function (proto) {
  for (const name of Object.getOwnPropertyNames(Body.prototype)) {
    const desc = Object.getOwnPropertyDescriptor(Body.prototype, name)
    Object.defineProperty(proto, name, desc)
  }
}

Body.mixIn(Request.prototype)
Body.mixIn(Response.prototype)

fetch.Headers = _fetch.Headers
fetch.FetchError = _fetch.FetchError
fetch.Request = Request
fetch.Response = Response
module.exports = fetch
