const _state = Symbol('headers map')

function appendHeader (headers, name, value) {
  if (!headers[_state]) {
    headers[_state] = {}
  }

  name = name.toLowerCase()
  value = (value + '').trim()

  if (headers[_state][name]) {
    headers[_state][name].push(value)
  } else {
    headers[_state][name] = [value]
  }
}

function deleteHeader (headers, name) {
  delete headers[name]
}

class SyncHeaders extends Headers {
  append (name, value) {
    super.append(name, value)
    appendHeader(this, name, value)
  }

  delete (name) {
    super.delete(name)
    deleteHeader(this, name)
  }

  set (name, value) {
    super.set(name, value)
    deleteHeader(this, name)
    appendHeader(this, name, value)
  }

  raw () {
    const headers = {}
    for (const key in this[_state]) {
      headers[key] = this[_state][key].slice()
    }
    return headers
  }

  get [Symbol.toStringTag] () {
    return 'Headers'
  }
}

Object.defineProperties(SyncHeaders.prototype, {
  append: { enumerable: true },
  delete: { enumerable: true },
  set: { enumerable: true }
})

module.exports = { SyncHeaders }
