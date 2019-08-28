const exec = require('child_process').execFileSync
const path = require('path')
const Stream = require('stream')
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
  request.push({})

  if (request[1].headers instanceof _fetch.Headers) {
    request[1].headers = Array.from(request[1].headers)
  }

  if (request[1].body) {
    const bodyType = parseBodyType(init.body)
    request[1].body = parseBody(init.body, bodyType).toString()
    request[2].bodyIsString = bodyType === 'String'
  }

  // TODO credentials

  const response = JSON.parse(sendMessage(request))
  if ('headers' in response[1]) {
    return deserializeResponse(...response)
  } else {
    throw deserializeError(...response)
  }
}

function sendMessage (message) {
  return exec(process.execPath, [path.join(__dirname, 'worker.js')], {
    input: JSON.stringify(message),
    shell: false
  })
}

const _body = Symbol('bodyBuffer')
const _bodyError = Symbol('bodyError')
const _checkBody = Symbol('checkBody')

class Request extends _fetch.Request {
  constructor (resource, init, bodyError) {
    let buffer
    if (init) {
      init = { ...init }
      if (init.body) {
        buffer = parseBody(init.body)
        init.body = createStream(buffer)
      }
    }

    super(resource, init)

    defineBuffer(this, buffer)
    if (bodyError) defineBodyError(this, bodyError)
  }

  clone () {
    checkBody(this)
    return new Request(this.url, {
      method: this.method,
      headers: this.headers,
      body: Buffer.from(this[_body]),
      mode: this.mode,
      credentials: this.credentials,
      cache: this.cache,
      redirect: this.redirect,
      referrer: this.referrer,
      referrerPolicy: this.referrerPolicy,
      integrity: this.integrity,
      keepalive: this.keepalive,
      // signal: this.signal
    })
  }
}

class Response extends _fetch.Response {
  constructor (body, init, bodyError) {
    const buffer = parseBody(body)
    super(body ? createStream(buffer) : null, init)
    defineBuffer(this, buffer)
    if (bodyError) defineBodyError(this, bodyError)
  }

  clone () {
    checkBody(this)
    return new Response(Buffer.from(this[_body]), {
      url: this.url,
      headers: Array.from(this.headers),
      status: this.status,
      statusText: this.statusText,
      counter: this.redirected ? 1 : 0
    }, this[_bodyError])
  }
}

class Body {
  static mixin (proto) {
    for (const name of Object.getOwnPropertyNames(Body.prototype)) {
      const desc = Object.getOwnPropertyDescriptor(Body.prototype, name)
      Object.defineProperty(proto, name, desc)
    }
  }

  arrayBuffer () {
    checkBody(this)
    const buf = consumeBody(this)
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  }

  text () {
    checkBody(this)
    return consumeBody(this).toString()
  }

  json () {
    checkBody(this)
		try {
			return JSON.parse(consumeBody(this).toString())
		} catch (err) {
			throw new fetch.FetchError(`invalid json response body at ${this.url} reason: ${err.message}`, 'invalid-json')
		}
	}

  buffer () {
    checkBody(this)
    return Buffer.from(consumeBody(this))
  }
}

function _super (self, method) {
  return Object.getPrototypeOf(Object.getPrototypeOf(self))[method].bind(self)
}

const errors = {
  TypeError
}

function checkBody (body) {
  if (body[_bodyError]) {
    throw body[_bodyError]
  }
  if (body.bodyUsed) {
    throw new TypeError(`body used already for: ${body.url}`)
  }
}

function consumeBody (body) {
  _super(body, 'buffer')().catch(error => console.error(error))
  return body[_body] || Buffer.alloc(0)
}

function deserializeResponse (body, init, bodyError) {
  const headers = new fetch.Headers()
  if (init.headers) {
    for (let name in init.headers) {
      for (let value of init.headers[name]) {
        headers.append(name, value)
      }
    }
  }

  return new fetch.Response(body, {
    ...init,
    headers
  }, bodyError)
}

function deserializeError (name, init) {
  if (name in errors) {
    return new errors[name](...init)
  } else {
    return new fetch.FetchError(...init)
  }
}

function defineBuffer (body, buffer) {
  Object.defineProperty(body, _body, {
    value: buffer,
    enumerable: false
  })
}

function defineBodyError (body, error) {
  Object.defineProperty(body, _bodyError, {
    value: deserializeError(...error),
    enumerable: false
  })
}

function parseBodyType (body) {
  if (body == null) {
    return 'Null'
  } else if (Buffer.isBuffer(body)) {
    return 'Buffer'
  } else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
    return 'ArrayBuffer'
  } else if (ArrayBuffer.isView(body)) {
    return 'ArrayBufferView'
  } else if (body instanceof Stream) {
		return 'Stream'
	} else {
    return 'String'
  }
}

function parseBody (body, type = parseBodyType(body)) {
  switch (type) {
    case 'Null': return null
    case 'Buffer': return body
    case 'ArrayBuffer': return Buffer.from(body)
    case 'ArrayBufferView': return Buffer.from(body.buffer, body.byteOffset, body.byteLength)
    case 'String': return Buffer.from(String(body))
    default: throw new TypeError(`sync-fetch does not support bodies of type: ${type}`)
  }
}

function createStream (buffer) {
  return new Stream.Transform({
    read () {
      this.push(buffer)
      this.push(null)
    }
  })
}

Body.mixin(Request.prototype)
Body.mixin(Response.prototype)

fetch.Headers = _fetch.Headers
fetch.FetchError = _fetch.FetchError
fetch.Request = Request
fetch.Response = Response
module.exports = fetch
