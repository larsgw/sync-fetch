#!/usr/bin/env node

const fetch = require('node-fetch')
const chunks = []

process.stdin.resume()
process.stdin.setEncoding('utf8')

process.stdin.on('data', function (chunk) {
  chunks.push(chunk)
})

process.stdin.on('end', function () {
  const [resource, init, options] = JSON.parse(chunks.join())
  if (init.body && !options.bodyIsString) {
    init.body = Buffer.from(init.body)
  }

  fetch(resource, init)
    .then(response => response.buffer()
      .then(buffer => respond([
        buffer.toString(),
        serializeResponse(response)
      ]))
      .catch(error => respond([
        '',
        serializeResponse(response, serializeError(error))
      ]))
    )
    .catch(error => respond(serializeError(error)))
})

function serializeResponse (response, bodyError) {
  return {
    url: response.url,
    headers: Array.from(response.headers),
    status: response.status,
    statusText: response.statusText,
    counter: response.redirected ? 1 : 0, // could be more than one, but no way of telling
    bodyError
  }
}

function serializeError ({ constructor, message, type, code }) {
  return [
    constructor.name,
    [message, type, { code }]
  ]
}

function respond (message) {
  console.log(JSON.stringify(message))
  process.exit(0)
}
