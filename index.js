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
  request.push({})

  if (request[1].headers instanceof _fetch.Headers) {
    request[1].headers = Array.from(request[1].headers)
  }

  if (request[1].body) {
    request[1].body = parseBody(init.body).toString()
    request[2].bodyIsString = parseBodyType(init.body) === 'String'
  }

  // TODO credentials

  const response = JSON.parse(sendMessage(request))
  if ('headers' in response[1]) {
    return new fetch.Response(...response)
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
    if (init) {
      init = { ...init }
      if (init.body) {
        init.body = parseBody(init.body)
      }
    }

    super(resource, init)

    defineBuffer(this, init && init.body)
    if (bodyError) defineBodyError(this, bodyError)
  }

  [_checkBody] () {
    if (this[_bodyError]) {
      throw this[_bodyError]
    }
    super.buffer()
  }

  clone () {
    const clone = super.clone()
    defineBuffer(clone, this.buffer())
    return clone
  }

  arrayBuffer () {
    this[_checkBody]()
    const buf = this[_body]
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  }

  text () {
    this[_checkBody]()
    return this[_body].toString()
  }

  json () {
    this[_checkBody]()
		try {
			return JSON.parse(this[_body].toString())
		} catch (err) {
			throw new fetch.FetchError(`invalid json response body at ${this.url} reason: ${err.message}`, 'invalid-json')
		}
	}

  buffer () {
    this[_checkBody]()
    return Buffer.from(this[_body])
  }
}

class Response extends _fetch.Response {
  constructor (body, init, bodyError) {
    const buffer = parseBody(body)
    super(buffer, init)
    defineBuffer(this, buffer)
    if (bodyError) defineBodyError(this, bodyError)
  }

  [_checkBody] () {
    if (this[_bodyError]) {
      throw this[_bodyError]
    }
    super.buffer()
  }

  clone () {
    const clone = super.clone()
    defineBuffer(clone, this.buffer())
    return clone
  }

  arrayBuffer () {
    this[_checkBody]()
    const buf = this[_body]
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  }

  text () {
    this[_checkBody]()
    return this[_body].toString()
  }

  json () {
    this[_checkBody]()
		try {
			return JSON.parse(this[_body].toString())
		} catch (err) {
			throw new fetch.FetchError(`invalid json response body at ${this.url} reason: ${err.message}`, 'invalid-json')
		}
	}

  buffer () {
    this[_checkBody]()
    return Buffer.from(this[_body])
  }
}

const errors = {
  TypeError
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
  } else {
    return 'String'
  }
}

function parseBody (body) {
  switch (parseBodyType(body)) {
    case 'Null': return null
    case 'Buffer': return body
    case 'ArrayBuffer': return Buffer.from(body)
    case 'ArrayBufferView': return Buffer.from(body.buffer, body.byteOffset, body.byteLength)
    case 'String': return Buffer.from(String(body))
  }
}

fetch.Headers = _fetch.Headers
fetch.FetchError = _fetch.FetchError
fetch.Request = Request
fetch.Response = Response
module.exports = fetch
