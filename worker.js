#!/usr/bin/env node

const fetch = require('node-fetch')
const chunks = []

process.stdin.resume()
process.stdin.setEncoding('utf8')

process.stdin.on('data', function (chunk) {
  chunks.push(chunk)
})

process.stdin.on('end', function () {
  const input = JSON.parse(chunks.join())
  if (input[1].body) {
    input[1].body = Buffer.from(input[1].body)
  }

  fetch(...input)
    .then(response => response.buffer().then(buffer => respond([
      buffer.toString(),
      {
        url: response.url,
        headers: Array.from(response.headers),
        status: response.status,
        statusText: response.statusText,
        counter: response.redirected ? 1 : 0 // could be more than one, but no way of telling
      }
    ])))
    .catch(error => {
      const { message, type, code } = error
      respond([error.constructor.name, [message, type, { code }]])
    })
})

function respond (message) {
  console.log(JSON.stringify(message))
  process.exit(0)
}
