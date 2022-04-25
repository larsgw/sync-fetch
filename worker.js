#!/usr/bin/env node

const { MessagePort, parentPort } = require('worker_threads')
const fetch = require('node-fetch')
const shared = require('./shared')

let port = null
let pendingResponse = null

parentPort.on('message', function (message) {
  if (message instanceof MessagePort) {
    port = message
    if (pendingResponse) { respond(pendingResponse) }
    return
  }

  const input = JSON.parse(message)
  const request = shared.deserializeRequest(fetch, ...input)

  fetch(request)
    .then(response => response.buffer()
      .then(buffer => respond([
        buffer.toString('base64'),
        shared.serializeResponse(response)
      ]))
      .catch(error => respond([
        '',
        shared.serializeResponse(response),
        shared.serializeError(error)
      ]))
    )
    .catch(error => respond(shared.serializeError(error)))
})

function respond (message) {
  if (port instanceof MessagePort) {
    port.postMessage(JSON.stringify(message))
  } else {
    pendingResponse = message
  }
}
