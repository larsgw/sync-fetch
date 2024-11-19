const Stream = require('stream')
const { FetchError } = require('./error.js')

const _state = Symbol('SyncFetch Internals')

class Body {
  static mixin (proto) {
    for (const name of Object.getOwnPropertyNames(Body.prototype)) {
      if (name === 'constructor') { continue }
      const desc = Object.getOwnPropertyDescriptor(Body.prototype, name)
      Object.defineProperty(proto, name, {
        ...desc,
        enumerable: true
      })
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
      throw new FetchError(`invalid json response body at ${this.url} reason: ${err.message}`, 'invalid-json')
    }
  }

  buffer () {
    checkBody(this)
    return Buffer.from(consumeBody(this))
  }

  textConverted () {
    throw new FetchError('textConverted not implemented')
  }

  blob () {
    throw new FetchError('blob not implemented')
  }

  get body () {
    return this[_state].bodyStream
  }

  get bodyUsed () {
    if (this[_state].bodyStream && this[_state].bodyStream.state === 'closed') {
      return this[_state].bodyUsed = true
    }

    return this[_state].bodyUsed
  }
}

function checkBody (body) {
  if (body[_state].bodyError) {
    throw body[_state].bodyError
  }
  if (body.bodyUsed) {
    throw new TypeError(`body used already for: ${body.url}`)
  }
}

function consumeBody (body) {
  body[_state].bodyUsed = true
  return body[_state].body || Buffer.alloc(0)
}

function parseBodyType (body) {
  if (body == null) {
    return 'Null'
  } else if (body.constructor.name === 'URLSearchParams') {
    return 'URLSearchParams'
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
    case 'URLSearchParams': return Buffer.from(body.toString())
    case 'Buffer': return body
    case 'ArrayBuffer': return Buffer.from(body)
    case 'ArrayBufferView': return Buffer.from(body.buffer, body.byteOffset, body.byteLength)
    case 'String': return Buffer.from(String(body))
    default: throw new TypeError(`sync-fetch does not support bodies of type: ${type}`)
  }
}

function createStream (buffer) {
  return new ReadableStream({
    start (controller) {
      controller.enqueue(buffer)
      controller.close()
    }
  })
}

module.exports = { Body, checkBody, parseBody, createStream, _state }
