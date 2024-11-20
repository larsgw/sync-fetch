/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */

'use strict'

// test tools
const chai = require('chai')
const chaiIterator = require('chai-iterator')
const chaiString = require('chai-string')
const resumer = require('resumer')
const FormData = require('form-data')
const stringToArrayBuffer = require('string-to-arraybuffer')
const URLSearchParamsPolyfill = require('@ungap/url-search-params')
const { URL, URLSearchParams } = require('url')
const zlib = require('zlib')

// test subjects
const fetch = require('../')
const { FetchError, Headers, Request, Response } = fetch

const { spawn } = require('child_process')
const http = require('http')
const fs = require('fs')
const path = require('path')
const stream = require('stream')
const url = require('url')
const vm = require('vm')

const { Uint8Array: VMUint8Array } = vm.runInNewContext('this')

let convert
try { convert = require('encoding').convert } catch (e) { }

chai.use(chaiIterator)
chai.use(chaiString)
const expect = chai.expect

let local
let base

before(done => {
  local = spawn(process.execPath, [path.join(__dirname, 'server.js')])
  local.stdout.on('data', chunk => {
    base = chunk.toString().trim()
    done()
  })
})

after(done => {
  local.on('close', done)
  local.kill()
})

describe('node-fetch', () => {
  /* eslint-disable */
  it.skip('should return a promise', function () {
    const url = `${base}hello`
    const p = fetch(url)
    expect(p).to.be.an.instanceof(fetch.Promise)
    expect(p).to.have.property('then')
  })

  it.skip('should allow custom promise', function () {
    const url = `${base}hello`
    const old = fetch.Promise
    fetch.Promise = then
    expect(fetch(url)).to.be.an.instanceof(then)
    expect(fetch(url)).to.not.be.an.instanceof(old)
    fetch.Promise = old
  })

  it.skip('should throw error when no promise implementation are found', function () {
    const url = `${base}hello`
    const old = fetch.Promise
    fetch.Promise = undefined
    expect(() => {
      fetch(url)
    }).to.throw(Error)
    fetch.Promise = old
  })
  /* eslint-enable */

  it('should expose Headers, Response and Request constructors', function () {
    expect(FetchError).to.be.a('function')
    expect(Headers).to.be.a('function')
    expect(Response).to.be.a('function')
    expect(Request).to.be.a('function')
  })

  it('should support proper toString output for Headers, Response and Request objects', function () {
    expect(new Headers().toString()).to.equal('[object Headers]')
    expect(new Response().toString()).to.equal('[object Response]')
    expect(new Request(base).toString()).to.equal('[object Request]')
  })

  it('should reject with error if url is protocol relative', function () {
    const url = '//example.com/'
    expect(() => fetch(url)).to.throw(TypeError, 'Failed to parse URL from //example.com/')
  })

  it('should reject with error if url is relative path', function () {
    const url = '/some/path'
    expect(() => fetch(url)).to.throw(TypeError, 'Failed to parse URL from /some/path')
  })

  it('should reject with error if protocol is unsupported', function () {
    const url = 'ftp://example.com/'
    expect(() => fetch(url)).to.throw(TypeError, 'node-fetch cannot load [object Request]. URL scheme "ftp" is not supported.')
  })

  it('should reject with error on network failure', function () {
    const url = 'http://localhost:50000/'
    expect(() => fetch(url)).to.throw(FetchError)
      .that.includes({ code: 'ECONNREFUSED' })
  })

  it('should resolve into response', function () {
    const url = `${base}hello`
    const res = fetch(url)
    expect(res).to.be.an.instanceof(Response)
    expect(res.headers).to.be.an.instanceof(Headers)
    expect(res.body).to.be.an.instanceof(ReadableStream)
    expect(res.bodyUsed).to.be.false

    expect(res.url).to.equal(url)
    expect(res.ok).to.be.true
    expect(res.status).to.equal(200)
    expect(res.statusText).to.equal('OK')
  })

  it('should accept plain text response', function () {
    const url = `${base}plain`
    const res = fetch(url)
    expect(res.headers.get('content-type')).to.equal('text/plain')
    const result = res.text()
    expect(res.bodyUsed).to.be.true
    expect(result).to.be.a('string')
    expect(result).to.equal('text')
  })

  it('should accept html response (like plain text)', function () {
    const url = `${base}html`
    const res = fetch(url)
    expect(res.headers.get('content-type')).to.equal('text/html')
    const result = res.text()
    expect(res.bodyUsed).to.be.true
    expect(result).to.be.a('string')
    expect(result).to.equal('<html></html>')
  })

  it('should accept json response', function () {
    const url = `${base}json`
    const res = fetch(url)
    expect(res.headers.get('content-type')).to.equal('application/json')
    const result = res.json()
    expect(res.bodyUsed).to.be.true
    expect(result).to.be.an('object')
    expect(result).to.deep.equal({ name: 'value' })
  })

  it('should send request with custom headers', function () {
    const url = `${base}inspect`
    const opts = {
      headers: { 'x-custom-header': 'abc' }
    }
    const res = fetch(url, opts).json()
    expect(res.headers['x-custom-header']).to.equal('abc')
  })

  it('should accept headers instance', function () {
    const url = `${base}inspect`
    const opts = {
      headers: new Headers({ 'x-custom-header': 'abc' })
    }
    const res = fetch(url, opts).json()
    expect(res.headers['x-custom-header']).to.equal('abc')
  })

  it('should accept custom host header', function () {
    const url = `${base}inspect`
    const opts = {
      headers: {
        host: 'example.com'
      }
    }
    const res = fetch(url, opts).json()
    expect(res.headers.host).to.equal('example.com')
  })

  it('should accept custom HoSt header', function () {
    const url = `${base}inspect`
    const opts = {
      headers: {
        HoSt: 'example.com'
      }
    }
    const res = fetch(url, opts).json()
    expect(res.headers.host).to.equal('example.com')
  })

  it('should follow redirect code 301', function () {
    const url = `${base}redirect/301`
    const res = fetch(url)
    expect(res.url).to.equal(`${base}inspect`)
    expect(res.status).to.equal(200)
    expect(res.ok).to.be.true
  })

  it('should follow redirect code 302', function () {
    const url = `${base}redirect/302`
    const res = fetch(url)
    expect(res.url).to.equal(`${base}inspect`)
    expect(res.status).to.equal(200)
  })

  it('should follow redirect code 303', function () {
    const url = `${base}redirect/303`
    const res = fetch(url)
    expect(res.url).to.equal(`${base}inspect`)
    expect(res.status).to.equal(200)
  })

  it('should follow redirect code 307', function () {
    const url = `${base}redirect/307`
    const res = fetch(url)
    expect(res.url).to.equal(`${base}inspect`)
    expect(res.status).to.equal(200)
  })

  it('should follow redirect code 308', function () {
    const url = `${base}redirect/308`
    const res = fetch(url)
    expect(res.url).to.equal(`${base}inspect`)
    expect(res.status).to.equal(200)
  })

  it('should follow redirect chain', function () {
    const url = `${base}redirect/chain`
    const res = fetch(url)
    expect(res.url).to.equal(`${base}inspect`)
    expect(res.status).to.equal(200)
  })

  it('should follow POST request redirect code 301 with GET', function () {
    const url = `${base}redirect/301`
    const opts = {
      method: 'POST',
      body: 'a=1'
    }
    const res = fetch(url, opts)
    expect(res.url).to.equal(`${base}inspect`)
    expect(res.status).to.equal(200)
    const result = res.json()
    expect(result.method).to.equal('GET')
    expect(result.body).to.equal('')
  })

  it('should follow PATCH request redirect code 301 with PATCH', function () {
    const url = `${base}redirect/301`
    const opts = {
      method: 'PATCH',
      body: 'a=1'
    }
    const res = fetch(url, opts)
    expect(res.url).to.equal(`${base}inspect`)
    expect(res.status).to.equal(200)
    const result = res.json()
    expect(result.method).to.equal('PATCH')
    expect(result.body).to.equal('a=1')
  })

  it('should follow POST request redirect code 302 with GET', function () {
    const url = `${base}redirect/302`
    const opts = {
      method: 'POST',
      body: 'a=1'
    }
    const res = fetch(url, opts)
    expect(res.url).to.equal(`${base}inspect`)
    expect(res.status).to.equal(200)
    const result = res.json()
    expect(result.method).to.equal('GET')
    expect(result.body).to.equal('')
  })

  it('should follow PATCH request redirect code 302 with PATCH', function () {
    const url = `${base}redirect/302`
    const opts = {
      method: 'PATCH',
      body: 'a=1'
    }
    const res = fetch(url, opts)
    expect(res.url).to.equal(`${base}inspect`)
    expect(res.status).to.equal(200)
    const result = res.json()
    expect(result.method).to.equal('PATCH')
    expect(result.body).to.equal('a=1')
  })

  it('should follow redirect code 303 with GET', function () {
    const url = `${base}redirect/303`
    const opts = {
      method: 'PUT',
      body: 'a=1'
    }
    const res = fetch(url, opts)
    expect(res.url).to.equal(`${base}inspect`)
    expect(res.status).to.equal(200)
    const result = res.json()
    expect(result.method).to.equal('GET')
    expect(result.body).to.equal('')
  })

  it('should follow PATCH request redirect code 307 with PATCH', function () {
    const url = `${base}redirect/307`
    const opts = {
      method: 'PATCH',
      body: 'a=1'
    }
    const res = fetch(url, opts)
    expect(res.url).to.equal(`${base}inspect`)
    expect(res.status).to.equal(200)
    const result = res.json()
    expect(result.method).to.equal('PATCH')
    expect(result.body).to.equal('a=1')
  })

  /* eslint-disable */
  it.skip('should not follow non-GET redirect if body is a readable stream', function () {
    const url = `${base}redirect/307`
    const opts = {
      method: 'PATCH',
      body: resumer().queue('a=1').end()
    }
    expect(() => fetch(url, opts)).to.throw(FetchError)
      .that.has.property('type', 'unsupported-redirect')
  })
  /* eslint-enable */

  it('should obey maximum redirect, reject case', function () {
    const url = `${base}redirect/chain`
    const opts = {
      follow: 1
    }
    expect(() => fetch(url, opts)).to.throw(FetchError)
      .that.has.property('type', 'max-redirect')
  })

  it('should obey redirect chain, resolve case', function () {
    const url = `${base}redirect/chain`
    const opts = {
      follow: 2
    }
    const res = fetch(url, opts)
    expect(res.url).to.equal(`${base}inspect`)
    expect(res.status).to.equal(200)
  })

  it('should allow not following redirect', function () {
    const url = `${base}redirect/301`
    const opts = {
      follow: 0
    }
    expect(() => fetch(url, opts)).to.throw(FetchError)
      .that.has.property('type', 'max-redirect')
  })

  it('should support redirect mode, manual flag', function () {
    const url = `${base}redirect/301`
    const opts = {
      redirect: 'manual'
    }
    const res = fetch(url, opts)
    expect(res.url).to.equal(url)
    expect(res.status).to.equal(301)
    expect(res.headers.get('location')).to.equal('/inspect')
  })

  it('should support redirect mode, error flag', function () {
    const url = `${base}redirect/301`
    const opts = {
      redirect: 'error'
    }
    expect(() => fetch(url, opts)).to.throw(FetchError)
      .that.has.property('type', 'no-redirect')
  })

  it('should support redirect mode, manual flag when there is no redirect', function () {
    const url = `${base}hello`
    const opts = {
      redirect: 'manual'
    }
    const res = fetch(url, opts)
    expect(res.url).to.equal(url)
    expect(res.status).to.equal(200)
    expect(res.headers.get('location')).to.be.null
  })

  it('should follow redirect code 301 and keep existing headers', function () {
    const url = `${base}redirect/301`
    const opts = {
      headers: new Headers({ 'x-custom-header': 'abc' })
    }
    const res = fetch(url, opts)
    expect(res.url).to.equal(`${base}inspect`)
    const { headers } = res.json()
    expect(headers['x-custom-header']).to.equal('abc')
  })

  it('should treat broken redirect as ordinary response (follow)', function () {
    const url = `${base}redirect/no-location`
    const res = fetch(url)
    expect(res.url).to.equal(url)
    expect(res.status).to.equal(301)
    expect(res.headers.get('location')).to.be.null
  })

  it('should treat broken redirect as ordinary response (manual)', function () {
    const url = `${base}redirect/no-location`
    const opts = {
      redirect: 'manual'
    }
    const res = fetch(url, opts)
    expect(res.url).to.equal(url)
    expect(res.status).to.equal(301)
    expect(res.headers.get('location')).to.be.null
  })

  it('should set redirected property on response when redirect', function () {
    const url = `${base}redirect/301`
    const res = fetch(url)
    expect(res.redirected).to.be.true
  })

  it('should not set redirected property on response without redirect', function () {
    const url = `${base}hello`
    const res = fetch(url)
    expect(res.redirected).to.be.false
  })

  /* eslint-disable */
  it.skip('should ignore invalid headers', function () {
    var headers = {
      'Invalid-Header ': 'abc\r\n',
      'Invalid-Header-Value': '\x07k\r\n',
      'Set-Cookie': ['\x07k\r\n', '\x07kk\r\n']
    }
    headers = createHeadersLenient(headers)
    expect(headers).to.not.have.property('Invalid-Header ')
    expect(headers).to.not.have.property('Invalid-Header-Value')
    expect(headers).to.not.have.property('Set-Cookie')
  })
  /* eslint-enable */

  it('should handle client-error response', function () {
    const url = `${base}error/400`
    const res = fetch(url)
    expect(res.headers.get('content-type')).to.equal('text/plain')
    expect(res.status).to.equal(400)
    expect(res.statusText).to.equal('Bad Request')
    expect(res.ok).to.be.false
    const result = res.text()
    expect(res.bodyUsed).to.be.true
    expect(result).to.be.a('string')
    expect(result).to.equal('client error')
  })

  it('should handle server-error response', function () {
    const url = `${base}error/500`
    const res = fetch(url)
    expect(res.headers.get('content-type')).to.equal('text/plain')
    expect(res.status).to.equal(500)
    expect(res.statusText).to.equal('Internal Server Error')
    expect(res.ok).to.be.false
    const result = res.text()
    expect(res.bodyUsed).to.be.true
    expect(result).to.be.a('string')
    expect(result).to.equal('server error')
  })

  it('should handle network-error response', function () {
    const url = `${base}error/reset`
    expect(() => fetch(url)).to.throw(FetchError)
      .that.has.property('code', 'ECONNRESET')
  })

  it('should handle DNS-error response', function () {
    const url = 'http://domain.invalid'
    expect(() => fetch(url)).to.throw(FetchError)
      .that.has.property('code').that.matches(/ENOTFOUND|EAI_AGAIN/)
  })

  it('should reject invalid json response', function () {
    const url = `${base}error/json`
    const res = fetch(url)
    expect(res.headers.get('content-type')).to.equal('application/json')
    expect(() => res.json()).to.throw(FetchError)
      .that.includes({ type: 'invalid-json' })
  })

  it('should handle no content response', function () {
    const url = `${base}no-content`
    const res = fetch(url)
    expect(res.status).to.equal(204)
    expect(res.statusText).to.equal('No Content')
    expect(res.ok).to.be.true
    const result = res.text()
    expect(result).to.be.a('string')
    expect(result).to.be.empty
  })

  it('should reject when trying to parse no content response as json', function () {
    const url = `${base}no-content`
    const res = fetch(url)
    expect(res.status).to.equal(204)
    expect(res.statusText).to.equal('No Content')
    expect(res.ok).to.be.true
    expect(() => res.json()).to.throw(FetchError)
      .that.includes({ type: 'invalid-json' })
  })

  it('should handle no content response with gzip encoding', function () {
    const url = `${base}no-content/gzip`
    const res = fetch(url)
    expect(res.status).to.equal(204)
    expect(res.statusText).to.equal('No Content')
    expect(res.headers.get('content-encoding')).to.equal('gzip')
    expect(res.ok).to.be.true
    const result = res.text()
    expect(result).to.be.a('string')
    expect(result).to.be.empty
  })

  it('should handle not modified response', function () {
    const url = `${base}not-modified`
    const res = fetch(url)
    expect(res.status).to.equal(304)
    expect(res.statusText).to.equal('Not Modified')
    expect(res.ok).to.be.false
    const result = res.text()
    expect(result).to.be.a('string')
    expect(result).to.be.empty
  })

  it('should handle not modified response with gzip encoding', function () {
    const url = `${base}not-modified/gzip`
    const res = fetch(url)
    expect(res.status).to.equal(304)
    expect(res.statusText).to.equal('Not Modified')
    expect(res.headers.get('content-encoding')).to.equal('gzip')
    expect(res.ok).to.be.false
    const result = res.text()
    expect(result).to.be.a('string')
    expect(result).to.be.empty
  })

  it('should decompress gzip response', function () {
    const url = `${base}gzip`
    const res = fetch(url)
    expect(res.headers.get('content-type')).to.equal('text/plain')
    const result = res.text()
    expect(result).to.be.a('string')
    expect(result).to.equal('hello world')
  })

  it('should decompress slightly invalid gzip response', function () {
    const url = `${base}gzip-truncated`
    const res = fetch(url)
    expect(res.headers.get('content-type')).to.equal('text/plain')
    const result = res.text()
    expect(result).to.be.a('string')
    expect(result).to.equal('hello world')
  })

  it('should decompress deflate response', function () {
    const url = `${base}deflate`
    const res = fetch(url)
    expect(res.headers.get('content-type')).to.equal('text/plain')
    const result = res.text()
    expect(result).to.be.a('string')
    expect(result).to.equal('hello world')
  })

  it('should decompress deflate raw response from old apache server', function () {
    const url = `${base}deflate-raw`
    const res = fetch(url)
    expect(res.headers.get('content-type')).to.equal('text/plain')
    const result = res.text()
    expect(result).to.be.a('string')
    expect(result).to.equal('hello world')
  })

  it('should decompress brotli response', function () {
    if (typeof zlib.createBrotliDecompress !== 'function') this.skip()
    const url = `${base}brotli`
    const res = fetch(url)
    expect(res.headers.get('content-type')).to.equal('text/plain')
    const result = res.text()
    expect(result).to.be.a('string')
    expect(result).to.equal('hello world')
  })

  it('should handle no content response with brotli encoding', function () {
    if (typeof zlib.createBrotliDecompress !== 'function') this.skip()
    const url = `${base}no-content/brotli`
    const res = fetch(url)
    expect(res.status).to.equal(204)
    expect(res.statusText).to.equal('No Content')
    expect(res.headers.get('content-encoding')).to.equal('br')
    expect(res.ok).to.be.true
    const result = res.text()
    expect(result).to.be.a('string')
    expect(result).to.be.empty
  })

  it('should skip decompression if unsupported', function () {
    const url = `${base}sdch`
    const res = fetch(url)
    expect(res.headers.get('content-type')).to.equal('text/plain')
    const result = res.text()
    expect(result).to.be.a('string')
    expect(result).to.equal('fake sdch string')
  })

  it('should reject if response compression is invalid', function () {
    const url = `${base}invalid-content-encoding`
    const res = fetch(url)
    expect(res.headers.get('content-type')).to.equal('text/plain')
    expect(() => res.text()).to.throw(FetchError)
      .that.has.property('code', 'Z_DATA_ERROR')
  })

  it('should handle errors on the body stream even if it is not used', function (done) {
    const url = `${base}invalid-content-encoding`
    const res = fetch(url)
    expect(res.status).to.equal(200)
    // Wait a few ms to see if a uncaught error occurs
    setTimeout(() => {
      done()
    }, 20)
  })

  it('should collect handled errors on the body stream to reject if the body is used later', function () {
    const url = `${base}invalid-content-encoding`
    const res = fetch(url)
    expect(res.headers.get('content-type')).to.equal('text/plain')
    expect(() => res.text()).to.throw(FetchError)
      .that.has.property('code', 'Z_DATA_ERROR')
  })

  it('should allow disabling auto decompression', function () {
    const url = `${base}gzip`
    const opts = {
      compress: false
    }
    const res = fetch(url, opts)
    expect(res.headers.get('content-type')).to.equal('text/plain')
    const result = res.text()
    expect(result).to.be.a('string')
    expect(result).to.not.equal('hello world')
  })

  it('should not overwrite existing accept-encoding header when auto decompression is true', function () {
    const url = `${base}inspect`
    const opts = {
      compress: true,
      headers: {
        'Accept-Encoding': 'gzip'
      }
    }
    const res = fetch(url, opts).json()
    expect(res.headers['accept-encoding']).to.equal('gzip')
  })

  it('should allow custom timeout', function () {
    const url = `${base}timeout`
    const opts = {
      timeout: 20
    }
    expect(() => fetch(url, opts)).to.throw(FetchError)
      .that.has.property('type', 'request-timeout')
  })

  it('should allow custom timeout on response body', function () {
    const url = `${base}slow`
    const opts = {
      timeout: 20
    }
    const res = fetch(url, opts)
    expect(res.ok).to.be.true
    expect(() => res.text()).to.throw(FetchError)
      .that.has.property('type', 'body-timeout')
  })

  it('should allow custom timeout on redirected requests', function () {
    const url = `${base}redirect/slow-chain`
    const opts = {
      timeout: 20
    }
    expect(() => fetch(url, opts)).to.throw(FetchError)
      .that.has.property('type', 'request-timeout')
  })

  it('should clear internal timeout on fetch response', function (done) {
    this.timeout(2000)
    spawn('node', ['-e', `require('./')('${base}hello', { timeout: 10000 })`])
      .on('exit', () => {
        done()
      })
  })

  it('should clear internal timeout on fetch redirect', function (done) {
    this.timeout(2000)
    spawn('node', ['-e', `require('./')('${base}redirect/301', { timeout: 10000 })`])
      .on('exit', () => {
        done()
      })
  })

  it('should clear internal timeout on fetch error', function (done) {
    this.timeout(2000)
    spawn('node', ['-e', `require('./')('${base}error/reset', { timeout: 10000 })`])
      .on('exit', () => {
        done()
      })
  })

  /* eslint-disable */
  it.skip('should support request cancellation with signal', function () {
    this.timeout(500)
    const controller = new AbortController()
    const controller2 = new AbortController2()

    const fetches = [
      fetch(`${base}timeout`, { signal: controller.signal }),
      fetch(`${base}timeout`, { signal: controller2.signal }),
      fetch(
        `${base}timeout`,
        {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            body: JSON.stringify({ hello: 'world' })
          }
        }
      )
    ]
    setTimeout(() => {
      controller.abort()
      controller2.abort()
    }, 100)

    return Promise.all(fetches.map(fetched => expect(fetched)
      .to.throw()
      .and.be.an.instanceOf(Error)
      .and.include({
        type: 'aborted',
        name: 'AbortError'
      })
    ))
  })

  it.skip('should reject immediately if signal has already been aborted', function () {
    const url = `${base}timeout`
    const controller = new AbortController()
    const opts = {
      signal: controller.signal
    }
    controller.abort()
    const fetched = fetch(url, opts)
    expect(fetched).to.throw()
      .and.be.an.instanceOf(Error)
      .and.include({
        type: 'aborted',
        name: 'AbortError'
      })
  })

  it.skip('should clear internal timeout when request is cancelled with an AbortSignal', function (done) {
    this.timeout(2000)
    const script = `
      var AbortController = require('abortcontroller-polyfill/dist/cjs-ponyfill').AbortController;
      var controller = new AbortController();
      require('./')(
       '${base}timeout',
       { signal: controller.signal, timeout: 10000 }
      );
      setTimeout(function () { controller.abort(); }, 20);
   `
    spawn('node', ['-e', script])
      .on('exit', () => {
        done()
      })
  })

  it.skip('should remove internal AbortSignal event listener after request is aborted', function () {
    const controller = new AbortController()
    const { signal } = controller
    const promise = fetch(
      `${base}timeout`,
      { signal }
    )
    const result = expect(promise).to.throw()
      .and.be.an.instanceof(Error)
      .and.have.property('name', 'AbortError')
      .then(() => {
        expect(signal.listeners.abort.length).to.equal(0)
      })
    controller.abort()
    return result
  })

  it.skip('should allow redirects to be aborted', function () {
    const abortController = new AbortController()
    const request = new Request(`${base}redirect/slow`, {
      signal: abortController.signal
    })
    setTimeout(() => {
      abortController.abort()
    }, 20)
    expect(fetch(request)).to.be.eventually.rejected
      .and.be.an.instanceOf(Error)
      .and.have.property('name', 'AbortError')
  })

  it.skip('should allow redirected response body to be aborted', function () {
    const abortController = new AbortController()
    const request = new Request(`${base}redirect/slow-stream`, {
      signal: abortController.signal
    })
    expect(fetch(request).then(res => {
      expect(res.headers.get('content-type')).to.equal('text/plain')
      const result = res.text()
      abortController.abort()
      return result
    })).to.be.eventually.rejected
      .and.be.an.instanceOf(Error)
      .and.have.property('name', 'AbortError')
  })

  it.skip('should remove internal AbortSignal event listener after request and response complete without aborting', () => {
    const controller = new AbortController()
    const { signal } = controller
    const fetchHtml = fetch(`${base}html`, { signal })
      .then(res => res.text())
    const fetchResponseError = fetch(`${base}error/reset`, { signal })
    const fetchRedirect = fetch(`${base}redirect/301`, { signal }).then(res => res.json())
    return Promise.all([
      expect(fetchHtml).to.eventually.be.fulfilled.and.equal('<html></html>'),
      expect(fetchResponseError).to.be.eventually.rejected,
      expect(fetchRedirect).to.eventually.be.fulfilled
    ]).then(() => {
      expect(signal.listeners.abort.length).to.equal(0)
    })
  })

  it.skip('should reject response body with AbortError when aborted before stream has been read completely', () => {
    const controller = new AbortController()
    expect(fetch(
      `${base}slow`,
      { signal: controller.signal }
    ))
      .to.eventually.be.fulfilled
      .then((res) => {
        const promise = res.text()
        controller.abort()
        expect(promise)
          .to.throw()
          .and.be.an.instanceof(Error)
          .and.have.property('name', 'AbortError')
      })
  })

  it.skip('should reject response body methods immediately with AbortError when aborted before stream is disturbed', () => {
    const controller = new AbortController()
    expect(fetch(
      `${base}slow`,
      { signal: controller.signal }
    ))
      .to.eventually.be.fulfilled
      .then((res) => {
        controller.abort()
        expect(res.text())
          .to.throw()
          .and.be.an.instanceof(Error)
          .and.have.property('name', 'AbortError')
      })
  })

  it.skip('should emit error event to response body with an AbortError when aborted before underlying stream is closed', (done) => {
    const controller = new AbortController()
    expect(fetch(
      `${base}slow`,
      { signal: controller.signal }
    ))
      .to.eventually.be.fulfilled
      .then((res) => {
        res.body.on('error', (err) => {
          expect(err)
            .to.be.an.instanceof(Error)
            .and.have.property('name', 'AbortError')
          done()
        })
        controller.abort()
      })
  })

  it.skip('should cancel request body of type Stream with AbortError when aborted', () => {
    const controller = new AbortController()
    const body = new stream.Readable({ objectMode: true })
    body._read = () => {}
    const promise = fetch(
      `${base}slow`,
      { signal: controller.signal, body, method: 'POST' }
    )

    const result = Promise.all([
      new Promise((resolve, reject) => {
        body.on('error', (error) => {
          try {
            expect(error).to.be.an.instanceof(Error).and.have.property('name', 'AbortError')
            resolve()
          } catch (err) {
            reject(err)
          }
        })
      }),
      expect(promise).to.throw()
        .and.be.an.instanceof(Error)
        .and.have.property('name', 'AbortError')
    ])

    controller.abort()

    return result
  })

  it.skip('should immediately reject when attempting to cancel streamed Requests in node < 8', () => {
    const controller = new AbortController()
    const body = new stream.Readable({ objectMode: true })
    body._read = () => {}
    const promise = fetch(
      `${base}slow`,
      { signal: controller.signal, body, method: 'POST' }
    )

    expect(promise).to.throw()
      .and.be.an.instanceof(Error)
      .and.have.property('message').includes('not supported')
  })

  it.skip('should throw a TypeError if a signal is not of type AbortSignal', () => {
    return Promise.all([
      expect(fetch(`${base}inspect`, { signal: {} }))
        .to.be.eventually.rejected
        .and.be.an.instanceof(TypeError)
        .and.have.property('message').includes('AbortSignal'),
      expect(fetch(`${base}inspect`, { signal: '' }))
        .to.be.eventually.rejected
        .and.be.an.instanceof(TypeError)
        .and.have.property('message').includes('AbortSignal'),
      expect(fetch(`${base}inspect`, { signal: Object.create(null) }))
        .to.be.eventually.rejected
        .and.be.an.instanceof(TypeError)
        .and.have.property('message').includes('AbortSignal')
    ])
  })
  /* eslint-enable */

  it('should set default User-Agent', function () {
    const url = `${base}inspect`
    const res = fetch(url).json()
    expect(res.headers['user-agent']).to.equal('node-fetch')
  })

  it('should allow setting User-Agent', function () {
    const url = `${base}inspect`
    const opts = {
      headers: {
        'user-agent': 'faked'
      }
    }
    const res = fetch(url, opts).json()
    expect(res.headers['user-agent']).to.equal('faked')
  })

  it('should set default Accept header', function () {
    const url = `${base}inspect`
    const res = fetch(url).json()
    expect(res.headers.accept).to.equal('*/*')
  })

  it('should allow setting Accept header', function () {
    const url = `${base}inspect`
    const opts = {
      headers: {
        accept: 'application/json'
      }
    }
    const res = fetch(url, opts).json()
    expect(res.headers.accept).to.equal('application/json')
  })

  it('should allow POST request', function () {
    const url = `${base}inspect`
    const opts = {
      method: 'POST'
    }
    const res = fetch(url, opts).json()
    expect(res.method).to.equal('POST')
    expect(res.headers['transfer-encoding']).to.be.undefined
    expect(res.headers['content-type']).to.be.undefined
    expect(res.headers['content-length']).to.equal('0')
  })

  it('should allow POST request with string body', function () {
    const url = `${base}inspect`
    const opts = {
      method: 'POST',
      body: 'a=1'
    }
    const res = fetch(url, opts).json()
    expect(res.method).to.equal('POST')
    expect(res.body).to.equal('a=1')
    expect(res.headers['transfer-encoding']).to.be.undefined
    expect(res.headers['content-type']).to.equal('text/plain;charset=UTF-8')
    expect(res.headers['content-length']).to.equal('3')
  })

  it('should allow POST request with buffer body', function () {
    const url = `${base}inspect`
    const opts = {
      method: 'POST',
      body: Buffer.from('a=1', 'utf-8')
    }
    const res = fetch(url, opts).json()
    expect(res.method).to.equal('POST')
    expect(res.body).to.equal('a=1')
    expect(res.headers['transfer-encoding']).to.be.undefined
    expect(res.headers['content-type']).to.be.undefined
    expect(res.headers['content-length']).to.equal('3')
  })

  it('should allow POST request with ArrayBuffer body', function () {
    const url = `${base}inspect`
    const opts = {
      method: 'POST',
      body: stringToArrayBuffer('Hello, world!\n')
    }
    const res = fetch(url, opts).json()
    expect(res.method).to.equal('POST')
    expect(res.body).to.equal('Hello, world!\n')
    expect(res.headers['transfer-encoding']).to.be.undefined
    expect(res.headers['content-type']).to.be.undefined
    expect(res.headers['content-length']).to.equal('14')
  })

  it('should allow POST request with ArrayBuffer body from a VM context', function () {
    const url = `${base}inspect`
    const opts = {
      method: 'POST',
      body: new VMUint8Array(Buffer.from('Hello, world!\n')).buffer
    }
    const res = fetch(url, opts).json()
    expect(res.method).to.equal('POST')
    expect(res.body).to.equal('Hello, world!\n')
    expect(res.headers['transfer-encoding']).to.be.undefined
    expect(res.headers['content-type']).to.be.undefined
    expect(res.headers['content-length']).to.equal('14')
  })

  it('should allow POST request with ArrayBufferView (Uint8Array) body', function () {
    const url = `${base}inspect`
    const opts = {
      method: 'POST',
      body: new Uint8Array(stringToArrayBuffer('Hello, world!\n'))
    }
    const res = fetch(url, opts).json()
    expect(res.method).to.equal('POST')
    expect(res.body).to.equal('Hello, world!\n')
    expect(res.headers['transfer-encoding']).to.be.undefined
    expect(res.headers['content-type']).to.be.undefined
    expect(res.headers['content-length']).to.equal('14')
  })

  it('should allow POST request with ArrayBufferView (DataView) body', function () {
    const url = `${base}inspect`
    const opts = {
      method: 'POST',
      body: new DataView(stringToArrayBuffer('Hello, world!\n'))
    }
    const res = fetch(url, opts).json()
    expect(res.method).to.equal('POST')
    expect(res.body).to.equal('Hello, world!\n')
    expect(res.headers['transfer-encoding']).to.be.undefined
    expect(res.headers['content-type']).to.be.undefined
    expect(res.headers['content-length']).to.equal('14')
  })

  it('should allow POST request with ArrayBufferView (Uint8Array) body from a VM context', function () {
    const url = `${base}inspect`
    const opts = {
      method: 'POST',
      body: new VMUint8Array(Buffer.from('Hello, world!\n'))
    }
    const res = fetch(url, opts).json()
    expect(res.method).to.equal('POST')
    expect(res.body).to.equal('Hello, world!\n')
    expect(res.headers['transfer-encoding']).to.be.undefined
    expect(res.headers['content-type']).to.be.undefined
    expect(res.headers['content-length']).to.equal('14')
  })

  it('should allow POST request with ArrayBufferView (Uint8Array, offset, length) body', function () {
    const url = `${base}inspect`
    const opts = {
      method: 'POST',
      body: new Uint8Array(stringToArrayBuffer('Hello, world!\n'), 7, 6)
    }
    const res = fetch(url, opts).json()
    expect(res.method).to.equal('POST')
    expect(res.body).to.equal('world!')
    expect(res.headers['transfer-encoding']).to.be.undefined
    expect(res.headers['content-type']).to.be.undefined
    expect(res.headers['content-length']).to.equal('6')
  })

  /* eslint-disable */
  it.skip('should allow POST request with blob body without type', function () {
    const url = `${base}inspect`
    const opts = {
      method: 'POST',
      body: new Blob(['a=1'])
    }
    const res = fetch(url, opts).json()
      expect(res.method).to.equal('POST')
      expect(res.body).to.equal('a=1')
      expect(res.headers['transfer-encoding']).to.be.undefined
      expect(res.headers['content-type']).to.be.undefined
      expect(res.headers['content-length']).to.equal('3')
  })

  it.skip('should allow POST request with blob body with type', function () {
    const url = `${base}inspect`
    const opts = {
      method: 'POST',
      body: new Blob(['a=1'], {
        type: 'text/plain;charset=UTF-8'
      })
    }
    const res = fetch(url, opts).json()
      expect(res.method).to.equal('POST')
      expect(res.body).to.equal('a=1')
      expect(res.headers['transfer-encoding']).to.be.undefined
      expect(res.headers['content-type']).to.equal('text/plain;charset=utf-8')
      expect(res.headers['content-length']).to.equal('3')
  })

  it.skip('should allow POST request with readable stream as body', function () {
    let body = resumer().queue('a=1').end()
    body = body.pipe(new stream.PassThrough())

    const url = `${base}inspect`
    const opts = {
      method: 'POST',
      body
    }
    const res = fetch(url, opts).json()
    expect(res.method).to.equal('POST')
    expect(res.body).to.equal('a=1')
    expect(res.headers['transfer-encoding']).to.equal('chunked')
    expect(res.headers['content-type']).to.be.undefined
    expect(res.headers['content-length']).to.be.undefined
  })

  it.skip('should allow POST request with form-data as body', function () {
    const form = new FormData()
    form.append('a', '1')

    const url = `${base}multipart`
    const opts = {
      method: 'POST',
      body: form
    }
    const res = fetch(url, opts).json()
    expect(res.method).to.equal('POST')
    expect(res.headers['content-type']).to.startWith('multipart/form-data;boundary=')
    expect(res.headers['content-length']).to.be.a('string')
    expect(res.body).to.equal('a=1')
  })

  it.skip('should allow POST request with form-data using stream as body', function () {
    const form = new FormData()
    form.append('my_field', fs.createReadStream(path.join(__dirname, 'dummy.txt')))

    const url = `${base}multipart`
    const opts = {
      method: 'POST',
      body: form
    }

    const res = fetch(url, opts).json()
    expect(res.method).to.equal('POST')
    expect(res.headers['content-type']).to.startWith('multipart/form-data;boundary=')
    expect(res.headers['content-length']).to.be.undefined
    expect(res.body).to.contain('my_field=')
  })

  it.skip('should allow POST request with form-data as body and custom headers', function () {
    const form = new FormData()
    form.append('a', '1')

    const headers = form.getHeaders()
    headers['b'] = '2'

    const url = `${base}multipart`
    const opts = {
      method: 'POST',
      body: form,
      headers
    }
    const res = fetch(url, opts).json()
    expect(res.method).to.equal('POST')
    expect(res.headers['content-type']).to.startWith('multipart/form-data; boundary=')
    expect(res.headers['content-length']).to.be.a('string')
    expect(res.headers.b).to.equal('2')
    expect(res.body).to.equal('a=1')
  })
  /* eslint-enable */

  it('should allow POST request with object body', function () {
    const url = `${base}inspect`
    // note that fetch simply calls tostring on an object
    const opts = {
      method: 'POST',
      body: { a: 1 }
    }
    const res = fetch(url, opts).json()
    expect(res.method).to.equal('POST')
    expect(res.body).to.equal('[object Object]')
    expect(res.headers['content-type']).to.equal('text/plain;charset=UTF-8')
    expect(res.headers['content-length']).to.equal('15')
  })

  it('constructing a Response with URLSearchParams as body should have a Content-Type', function () {
    const params = new url.URLSearchParams()
    const res = new Response(params)
    res.headers.get('Content-Type')
    expect(res.headers.get('Content-Type')).to.equal('application/x-www-form-urlencoded;charset=UTF-8')
  })

  it('constructing a Request with URLSearchParams as body should have a Content-Type', function () {
    const params = new url.URLSearchParams()
    const req = new Request(base, { method: 'POST', body: params })
    expect(req.headers.get('Content-Type')).to.equal('application/x-www-form-urlencoded;charset=UTF-8')
  })

  it('Reading a body with URLSearchParams should echo back the result', function () {
    const params = new url.URLSearchParams()
    params.append('a', '1')
    const text = new Response(params).text()
    expect(text).to.equal('a=1')
  })

  // Body should been cloned...
  it('constructing a Request/Response with URLSearchParams and mutating it should not affected body', function () {
    const params = new url.URLSearchParams()
    const req = new Request(`${base}inspect`, { method: 'POST', body: params })
    params.append('a', '1')
    const text = req.text()
    expect(text).to.equal('')
  })

  it('should allow POST request with URLSearchParams as body', function () {
    const params = new url.URLSearchParams()
    params.append('a', '1')

    const opts = {
      method: 'POST',
      body: params
    }
    const res = fetch(`${base}inspect`, opts).json()
    expect(res.method).to.equal('POST')
    expect(res.headers['content-type']).to.equal('application/x-www-form-urlencoded;charset=UTF-8')
    expect(res.headers['content-length']).to.equal('3')
    expect(res.body).to.equal('a=1')
  })

  it('should still recognize URLSearchParams when extended', function () {
    class CustomSearchParams extends URLSearchParams {}
    const params = new CustomSearchParams()
    params.append('a', '1')

    const url = `${base}inspect`
    const opts = {
      method: 'POST',
      body: params
    }
    const res = fetch(url, opts).json()
    expect(res.method).to.equal('POST')
    expect(res.headers['content-type']).to.equal('application/x-www-form-urlencoded;charset=UTF-8')
    expect(res.headers['content-length']).to.equal('3')
    expect(res.body).to.equal('a=1')
  })

  // /* for 100% code coverage, checks for duck-typing-only detection
  //  * where both constructor.name and brand tests fail */
  it('should still recognize URLSearchParams when extended from polyfill', function () {
    class CustomPolyfilledSearchParams extends URLSearchParamsPolyfill {}
    const params = new CustomPolyfilledSearchParams()
    params.append('a', '1')

    const url = `${base}inspect`
    const opts = {
      method: 'POST',
      body: params
    }
    const res = fetch(url, opts).json()
    expect(res.method).to.equal('POST')
    expect(res.headers['content-type']).to.equal('application/x-www-form-urlencoded;charset=UTF-8')
    expect(res.headers['content-length']).to.equal('3')
    expect(res.body).to.equal('a=1')
  })

  it('should overwrite Content-Length if possible', function () {
    const url = `${base}inspect`
    // note that fetch simply calls tostring on an object
    const opts = {
      method: 'POST',
      headers: {
        'Content-Length': '1000'
      },
      body: 'a=1'
    }
    const res = fetch(url, opts).json()
    expect(res.method).to.equal('POST')
    expect(res.body).to.equal('a=1')
    expect(res.headers['transfer-encoding']).to.be.undefined
    expect(res.headers['content-type']).to.equal('text/plain;charset=UTF-8')
    expect(res.headers['content-length']).to.equal('3')
  })

  it('should allow PUT request', function () {
    const url = `${base}inspect`
    const opts = {
      method: 'PUT',
      body: 'a=1'
    }
    const res = fetch(url, opts).json()
    expect(res.method).to.equal('PUT')
    expect(res.body).to.equal('a=1')
  })

  it('should allow DELETE request', function () {
    const url = `${base}inspect`
    const opts = {
      method: 'DELETE'
    }
    const res = fetch(url, opts).json()
    expect(res.method).to.equal('DELETE')
  })

  it('should allow DELETE request with string body', function () {
    const url = `${base}inspect`
    const opts = {
      method: 'DELETE',
      body: 'a=1'
    }
    const res = fetch(url, opts).json()
    expect(res.method).to.equal('DELETE')
    expect(res.body).to.equal('a=1')
    expect(res.headers['transfer-encoding']).to.be.undefined
    expect(res.headers['content-length']).to.equal('3')
  })

  it('should allow PATCH request', function () {
    const url = `${base}inspect`
    const opts = {
      method: 'PATCH',
      body: 'a=1'
    }
    const res = fetch(url, opts).json()
    expect(res.method).to.equal('PATCH')
    expect(res.body).to.equal('a=1')
  })

  it('should allow HEAD request', function () {
    const url = `${base}hello`
    const opts = {
      method: 'HEAD'
    }
    const res = fetch(url, opts)
    expect(res.status).to.equal(200)
    expect(res.statusText).to.equal('OK')
    expect(res.headers.get('content-type')).to.equal('text/plain')
    expect(res.body).to.be.an.instanceof(ReadableStream)
    const text = res.text()
    expect(text).to.equal('')
  })

  it('should allow HEAD request with content-encoding header', function () {
    const url = `${base}error/404`
    const opts = {
      method: 'HEAD'
    }
    const res = fetch(url, opts)
    expect(res.status).to.equal(404)
    expect(res.headers.get('content-encoding')).to.equal('gzip')
    const text = res.text()
    expect(text).to.equal('')
  })

  it('should allow OPTIONS request', function () {
    const url = `${base}options`
    const opts = {
      method: 'OPTIONS'
    }
    const res = fetch(url, opts)
    expect(res.status).to.equal(200)
    expect(res.statusText).to.equal('OK')
    expect(res.headers.get('allow')).to.equal('GET, HEAD, OPTIONS')
    expect(res.body).to.be.an.instanceof(ReadableStream)
  })

  it('should reject decoding body twice', function () {
    const url = `${base}plain`
    const res = fetch(url)
    expect(res.headers.get('content-type')).to.equal('text/plain')
    res.text()
    expect(res.bodyUsed).to.be.true
    expect(() => res.text()).to.throw(Error)
  })

  it('should support maximum response size, multiple chunk', function () {
    const url = `${base}size/chunk`
    const opts = {
      size: 5
    }
    const res = fetch(url, opts)
    expect(res.status).to.equal(200)
    expect(res.headers.get('content-type')).to.equal('text/plain')
    expect(() => res.text()).to.throw(FetchError)
      .that.has.property('type', 'max-size')
  })

  it('should support maximum response size, single chunk', function () {
    const url = `${base}size/long`
    const opts = {
      size: 5
    }
    const res = fetch(url, opts)
    expect(res.status).to.equal(200)
    expect(res.headers.get('content-type')).to.equal('text/plain')
    expect(() => res.text()).to.throw(FetchError)
      .that.has.property('type', 'max-size')
  })

  it('should allow piping response body as stream', function () {
    const url = `${base}hello`
    const res = fetch(url)
    expect(res.body).to.be.an.instanceof(ReadableStream)
    return streamToPromise(res.body, chunk => {
      if (chunk === null) {
        return
      }
      expect(chunk.toString()).to.equal('world')
    })
  })

  it('should allow cloning a response, and use both as stream', function () {
    const url = `${base}hello`
    const res = fetch(url)
    const r1 = res.clone()
    expect(res.body).to.be.an.instanceof(ReadableStream)
    expect(r1.body).to.be.an.instanceof(ReadableStream)
    const dataHandler = chunk => {
      if (chunk === null) {
        return
      }
      expect(chunk.toString()).to.equal('world')
    }

    return Promise.all([
      streamToPromise(res.body, dataHandler),
      streamToPromise(r1.body, dataHandler)
    ])
  })

  it('should allow cloning a json response and log it as text response', function () {
    const url = `${base}json`
    const res = fetch(url)
    const r1 = res.clone()
    expect(res.json()).to.deep.equal({ name: 'value' })
    expect(r1.text()).to.equal('{"name":"value"}')
  })

  /* eslint-disable */
  it.skip('should allow cloning a json response, and then log it as text response', function () {
    const url = `${base}json`
    const res = fetch(url)
    const r1 = res.clone()
    expect(res.json()).to.deep.equal({ name: 'value' })
    expect(r1.text()).to.equal('{"name":"value"}')
  })
  /* eslint-enable */

  it('should allow cloning a json response, first log as text response, then return json object', function () {
    const url = `${base}json`
    const res = fetch(url)
    const r1 = res.clone()
    expect(r1.text()).to.equal('{"name":"value"}')
    expect(res.json()).to.deep.equal({ name: 'value' })
  })

  it('should not allow cloning a response after its been used', function () {
    const url = `${base}hello`
    const res = fetch(url)
    res.text()
    expect(() => res.clone()).to.throw(Error)
  })

  it('should allow get all responses of a header', function () {
    const url = `${base}cookie`
    const res = fetch(url)
    const expected = 'a=1, b=1'
    expect(res.headers.get('set-cookie')).to.equal(expected)
    expect(res.headers.get('Set-Cookie')).to.equal(expected)
  })

  it('should return all headers using raw()', function () {
    const url = `${base}cookie`
    const res = fetch(url)
    const expected = [
      'a=1',
      'b=1'
    ]

    expect(res.headers.raw()['set-cookie']).to.deep.equal(expected)
  })

  it('should allow deleting header', function () {
    const url = `${base}cookie`
    const res = fetch(url)
    res.headers.delete('set-cookie')
    expect(res.headers.get('set-cookie')).to.be.null
  })

  /* eslint-disable */
  it.skip('should send request with connection keep-alive if agent is provided', function () {
    const url = `${base}inspect`
    const opts = {
      agent: new http.Agent({
        keepAlive: true
      })
    }
    const res = fetch(url, opts).json()
    expect(res.headers['connection']).to.equal('keep-alive')
  })
  /* eslint-enable */

  it('should support fetch with Request instance', function () {
    const url = `${base}hello`
    const req = new Request(url)
    const res = fetch(req)
    expect(res.url).to.equal(url)
    expect(res.ok).to.be.true
    expect(res.status).to.equal(200)
  })

  /* eslint-disable */
  it.skip('should support fetch with Node.js URL object', function () {
    const url = `${base}hello`
    const urlObj = url.parse(url)
    const req = new Request(urlObj)
    const res = fetch(req)
    expect(res.url).to.equal(url)
    expect(res.ok).to.be.true
    expect(res.status).to.equal(200)
  })
  /* eslint-enable */

  it('should support fetch with WHATWG URL object', function () {
    const url = `${base}hello`
    const urlObj = new URL(url)
    const req = new Request(urlObj)
    const res = fetch(req)
    expect(res.url).to.equal(url)
    expect(res.ok).to.be.true
    expect(res.status).to.equal(200)
  })

  /* eslint-disable */
  it.skip('should support reading blob as text', function () {
    return new Response('hello')
      .blob()
      .then(blob => blob.text())
      .then(body => {
        expect(body).to.equal('hello')
      })
  })

  it.skip('should support reading blob as arrayBuffer', function () {
    return new Response(`hello`)
      .blob()
      .then(blob => blob.arrayBuffer())
      .then(ab => {
        const str = String.fromCharCode.apply(null, new Uint8Array(ab))
        expect(str).to.equal('hello')
      })
  })

  it.skip('should support reading blob as stream', function () {
    return new Response(`hello`)
      .blob()
      .then(blob => streamToPromise(blob.stream(), data => {
        const str = data.toString()
        expect(str).to.equal('hello')
      }))
  })

  it.skip('should support blob round-trip', function () {
    const url = `${base}hello`

    let length, type

    return fetch(url).then(res => res.blob()).then(blob => {
      const url = `${base}inspect`
      length = blob.size
      type = blob.type
      return fetch(url, {
        method: 'POST',
        body: blob
      })
    }).then(res => res.json()).then(({ body, headers }) => {
      expect(body).to.equal('world')
      expect(headers['content-type']).to.equal(type)
      expect(headers['content-length']).to.equal(String(length))
    })
  })
  /* eslint-enable */

  it('should support overwrite Request instance', function () {
    const url = `${base}inspect`
    const req = new Request(url, {
      method: 'POST',
      headers: {
        a: '1'
      }
    })
    const body = fetch(req, {
      method: 'GET',
      headers: {
        a: '2'
      }
    }).json()
    expect(body.method).to.equal('GET')
    expect(body.headers.a).to.equal('2')
  })

  /* eslint-disable */
  it.skip('should support arrayBuffer(), blob(), text(), json() and buffer() method in Body constructor', function () {
    const body = new Body('a=1')
    expect(body).to.have.property('arrayBuffer')
    expect(body).to.have.property('blob')
    expect(body).to.have.property('text')
    expect(body).to.have.property('json')
    expect(body).to.have.property('buffer')
  })
  /* eslint-enable */

  it('should create custom FetchError', function funcName () {
    const systemError = new Error('system')
    systemError.code = 'ESOMEERROR'

    const err = new FetchError('test message', 'test-error', systemError)
    expect(err).to.be.an.instanceof(Error)
    expect(err).to.be.an.instanceof(FetchError)
    expect(err.name).to.equal('FetchError')
    expect(err.message).to.equal('test message')
    expect(err.type).to.equal('test-error')
    expect(err.code).to.equal('ESOMEERROR')
    expect(err.errno).to.equal('ESOMEERROR')
    // reading the stack is quite slow (~30-50ms)
    expect(err.stack).to.include('funcName').and.to.startWith(`${err.name}: ${err.message}`)
  })

  it('should support https request', function () {
    this.timeout(5000)
    const url = 'https://github.com/'
    const opts = {
      method: 'HEAD'
    }
    const res = fetch(url, opts)
    expect(res.status).to.equal(200)
    expect(res.ok).to.be.true
  })

  // issue #414
  /* eslint-disable */
  it.skip('should reject if attempt to accumulate body stream throws', function () {
    let body = resumer().queue('a=1').end()
    body = body.pipe(new stream.PassThrough())
    const res = new Response(body)
    const bufferConcat = Buffer.concat
    const restoreBufferConcat = () => Buffer.concat = bufferConcat
    Buffer.concat = () => { throw new Error('embedded error') }

    const textPromise = res.text()
    // Ensure that `Buffer.concat` is always restored:
    textPromise.then(restoreBufferConcat, restoreBufferConcat)

    expect(textPromise).to.throw(FetchError)
      .that.includes({ type: 'system' })
      .and.have.property('message').that.includes('Could not create Buffer')
      .and.that.includes('embedded error')
  })

  it.skip('supports supplying a lookup function to the agent', function () {
    const url = `${base}redirect/301`
    let called = 0
    function lookupSpy (hostname, options, callback) {
      called++
      return lookup(hostname, options, callback)
    }
    const agent = http.Agent({ lookup: lookupSpy })
    return fetch(url, { agent }).then(() => {
      expect(called).to.equal(2)
    })
  })

  it.skip('supports supplying a famliy option to the agent', function () {
    const url = `${base}redirect/301`
    const families = []
    const family = Symbol('family')
    function lookupSpy (hostname, options, callback) {
      families.push(options.family)
      return lookup(hostname, {}, callback)
    }
    const agent = http.Agent({ lookup: lookupSpy, family })
    return fetch(url, { agent }).then(() => {
      expect(families).to.have.length(2)
      expect(families[0]).to.equal(family)
      expect(families[1]).to.equal(family)
    })
  })

  it.skip('should allow a function supplying the agent', function () {
    const url = `${base}inspect`

    const agent = new http.Agent({
      keepAlive: true
    })

    let parsedURL

    return fetch(url, {
      agent: function (_parsedURL) {
        parsedURL = _parsedURL
        return agent
      }
    }).then(res => {
      return res.json()
    }).then(res => {
      // the agent provider should have been called
      expect(parsedURL.protocol).to.equal('http:')
      // the agent we returned should have been used
      expect(res.headers['connection']).to.equal('keep-alive')
    })
  })

  it.skip('should calculate content length and extract content type for each body type', function () {
    const url = `${base}hello`
    const bodyContent = 'a=1'

    // let streamBody = resumer().queue(bodyContent).end()
    // streamBody = streamBody.pipe(new stream.PassThrough())
    // const streamRequest = new Request(url, {
    //   method: 'POST',
    //   body: streamBody,
    //   size: 1024
    // })
    //
    // const blobBody = new Blob([bodyContent], { type: 'text/plain' })
    // const blobRequest = new Request(url, {
    //   method: 'POST',
    //   body: blobBody,
    //   size: 1024
    // })
    //
    // const formBody = new FormData()
    // formBody.append('a', '1')
    // const formRequest = new Request(url, {
    //   method: 'POST',
    //   body: formBody,
    //   size: 1024
    // })

    const bufferBody = Buffer.from(bodyContent)
    const bufferRequest = new Request(url, {
      method: 'POST',
      body: bufferBody,
      size: 1024
    })

    const stringRequest = new Request(url, {
      method: 'POST',
      body: bodyContent,
      size: 1024
    })

    const nullRequest = new Request(url, {
      method: 'GET',
      body: null,
      size: 1024
    })

    // expect(getTotalBytes(streamRequest)).to.be.null
    // expect(getTotalBytes(blobRequest)).to.equal(blobBody.size)
    // expect(getTotalBytes(formRequest)).to.not.be.null
    expect(getTotalBytes(bufferRequest)).to.equal(bufferBody.length)
    expect(getTotalBytes(stringRequest)).to.equal(bodyContent.length)
    expect(getTotalBytes(nullRequest)).to.equal(0)

    // expect(extractContentType(streamBody)).to.be.null
    // expect(extractContentType(blobBody)).to.equal('text/plain')
    // expect(extractContentType(formBody)).to.startWith('multipart/form-data')
    expect(extractContentType(bufferBody)).to.be.null
    expect(extractContentType(bodyContent)).to.equal('text/plain;charset=UTF-8')
    expect(extractContentType(null)).to.be.null
  })
  /* eslint-enable */
})

describe('Headers', function () {
  it('', function () {
    const headers = new Headers()
    expect(Object.getOwnPropertyNames(headers)).to.be.empty
    const enumerableProperties = []
    for (const property in headers) {
      enumerableProperties.push(property)
    }
    for (const toCheck of [
      'append', 'delete', 'entries', 'forEach', 'get', 'has', 'keys', 'set',
      'values'
    ]) {
      expect(enumerableProperties).to.contain(toCheck)
    }
  })

  it('should allow iterating through all headers with forEach', function () {
    const headers = new Headers([
      ['b', '2'],
      ['c', '4'],
      ['b', '3'],
      ['a', '1']
    ])
    expect(headers).to.have.property('forEach')

    const result = []
    headers.forEach((val, key) => {
      result.push([key, val])
    })

    expect(result).to.deep.equal([
      ['a', '1'],
      ['b', '2, 3'],
      ['c', '4']
    ])
  })

  it('should allow iterating through all headers with for-of loop', function () {
    const headers = new Headers([
      ['b', '2'],
      ['c', '4'],
      ['a', '1']
    ])
    headers.append('b', '3')
    expect(headers).to.be.iterable

    const result = []
    for (const pair of headers) {
      result.push(pair)
    }
    expect(result).to.deep.equal([
      ['a', '1'],
      ['b', '2, 3'],
      ['c', '4']
    ])
  })

  it('should allow iterating through all headers with entries()', function () {
    const headers = new Headers([
      ['b', '2'],
      ['c', '4'],
      ['a', '1']
    ])
    headers.append('b', '3')

    expect(headers.entries()).to.be.iterable
      .and.to.deep.iterate.over([
        ['a', '1'],
        ['b', '2, 3'],
        ['c', '4']
      ])
  })

  it('should allow iterating through all headers with keys()', function () {
    const headers = new Headers([
      ['b', '2'],
      ['c', '4'],
      ['a', '1']
    ])
    headers.append('b', '3')

    expect(headers.keys()).to.be.iterable
      .and.to.iterate.over(['a', 'b', 'c'])
  })

  it('should allow iterating through all headers with values()', function () {
    const headers = new Headers([
      ['b', '2'],
      ['c', '4'],
      ['a', '1']
    ])
    headers.append('b', '3')

    expect(headers.values()).to.be.iterable
      .and.to.iterate.over(['1', '2, 3', '4'])
  })

  it('should reject illegal header', function () {
    const headers = new Headers()
    expect(() => new Headers({ 'He y': 'ok' })).to.throw(TypeError)
    expect(() => new Headers({ 'Hé-y': 'ok' })).to.throw(TypeError)
    expect(() => new Headers({ 'He-y': 'ăk' })).to.throw(TypeError)
    expect(() => headers.append('Hé-y', 'ok')).to.throw(TypeError)
    expect(() => headers.delete('Hé-y')).to.throw(TypeError)
    // expect(() => headers.get('Hé-y')).to.throw(TypeError)
    // expect(() => headers.has('Hé-y')).to.throw(TypeError)
    // expect(() => headers.set('Hé-y', 'ok')).to.throw(TypeError)
    // // should reject empty header
    // expect(() => headers.append('', 'ok')).to.throw(TypeError)
    //
    // // 'o k' is valid value but invalid name
    // expect(() => new Headers({ 'He-y': 'o k' })).not.to.throw()
  })

  it('should ignore unsupported attributes while reading headers', function () {
    const FakeHeader = function () {}
    // prototypes are currently ignored
    // This might change in the future: #181
    FakeHeader.prototype.z = 'fake'

    const res = new FakeHeader()
    res.a = 'string'
    res.b = ['1', '2']
    res.c = ''
    res.d = []
    res.e = 1
    res.f = [1, 2]
    res.g = { a: 1 }
    res.h = undefined
    res.i = null
    res.j = NaN
    res.k = true
    res.l = false
    res.m = Buffer.from('test')

    const h1 = new Headers(res)
    h1.set('n', [1, 2])
    h1.append('n', ['3', 4])

    const h1Raw = h1.raw()

    expect(h1Raw.a).to.include('string')
    expect(h1Raw.b).to.include('1,2')
    expect(h1Raw.c).to.include('')
    expect(h1Raw.d).to.include('')
    expect(h1Raw.e).to.include('1')
    expect(h1Raw.f).to.include('1,2')
    expect(h1Raw.g).to.include('[object Object]')
    expect(h1Raw.h).to.include('undefined')
    expect(h1Raw.i).to.include('null')
    expect(h1Raw.j).to.include('NaN')
    expect(h1Raw.k).to.include('true')
    expect(h1Raw.l).to.include('false')
    expect(h1Raw.m).to.include('test')
    expect(h1Raw.n).to.include('1,2')
    expect(h1Raw.n).to.include('3,4')

    expect(h1Raw.z).to.be.undefined
  })

  it('should wrap headers', function () {
    const h1 = new Headers({
      a: '1'
    })
    const h1Raw = h1.raw()

    const h2 = new Headers(h1)
    h2.set('b', '1')
    const h2Raw = h2.raw()

    const h3 = new Headers(h2)
    h3.append('a', '2')
    const h3Raw = h3.raw()

    expect(h1Raw.a).to.include('1')
    expect(h1Raw.a).to.not.include('2')

    expect(h2Raw.a).to.include('1')
    expect(h2Raw.a).to.not.include('2')
    expect(h2Raw.b).to.include('1')

    expect(h3Raw.a).to.include('1')
    expect(h3Raw.a).to.include('2')
    expect(h3Raw.b).to.include('1')
  })

  it('should accept headers as an iterable of tuples', function () {
    let headers

    headers = new Headers([
      ['a', '1'],
      ['b', '2'],
      ['a', '3']
    ])
    expect(headers.get('a')).to.equal('1, 3')
    expect(headers.get('b')).to.equal('2')

    headers = new Headers([
      new Set(['a', '1']),
      ['b', '2'],
      new Map([['a', null], ['3', null]]).keys()
    ])
    expect(headers.get('a')).to.equal('1, 3')
    expect(headers.get('b')).to.equal('2')

    headers = new Headers(new Map([
      ['a', '1'],
      ['b', '2']
    ]))
    expect(headers.get('a')).to.equal('1')
    expect(headers.get('b')).to.equal('2')
  })

  it('should throw a TypeError if non-tuple exists in a headers initializer', function () {
    expect(() => new Headers([['b', '2', 'huh?']])).to.throw(TypeError)
    expect(() => new Headers(['b2'])).to.throw(TypeError)
    expect(() => new Headers('b2')).to.throw(TypeError)
    expect(() => new Headers({ [Symbol.iterator]: 42 })).to.throw(TypeError)
  })
})

describe('Response', function () {
  it('should have attributes conforming to Web IDL', function () {
    const res = new Response()
    const enumerableProperties = []
    for (const prop in res) { enumerableProperties.push(prop) }
    const getterOnly = ['body', 'bodyUsed', 'url', 'status', 'ok', 'redirected', 'statusText', 'headers']
    const all = getterOnly.concat(['arrayBuffer', 'blob', 'json', 'text', 'clone'])

    for (const toCheck of all) {
      expect(enumerableProperties).to.contain(toCheck)
    }
    for (const toCheck of getterOnly) {
      expect(() => { res[toCheck] = 'abc' }).to.throw()
    }
  })

  it('should support empty options', function () {
    const res = new Response('a=1')
    const result = res.text()
    expect(result).to.equal('a=1')
  })

  it('should support parsing headers', function () {
    const res = new Response(null, {
      headers: {
        a: '1'
      }
    })
    expect(res.headers.get('a')).to.equal('1')
  })

  it('should support text() method', function () {
    const res = new Response('a=1')
    const result = res.text()
    expect(result).to.equal('a=1')
  })

  it('should support json() method', function () {
    const res = new Response('{"a":1}')
    const result = res.json()
    expect(result.a).to.equal(1)
  })

  it('should support buffer() method', function () {
    const res = new Response('a=1')
    const result = res.buffer()
    expect(result.toString()).to.equal('a=1')
  })

  /* eslint-disable */
  it.skip('should support blob() method', function () {
    const res = new Response('a=1', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      }
    })
    return res.blob().then(function (result) {
      expect(result).to.be.an.instanceOf(Blob)
      expect(result.size).to.equal(3)
      expect(result.type).to.equal('text/plain')
    })
  })
  /* eslint-enable */

  it('should support clone() method', function () {
    const body = Buffer.from('a=1')
    const res = new Response(body, {
      headers: {
        a: '1'
      },
      url: base,
      status: 346,
      statusText: 'production'
    })
    const cl = res.clone()
    expect(cl.headers.get('a')).to.equal('1')
    expect(cl.url).to.equal(base)
    expect(cl.status).to.equal(346)
    expect(cl.statusText).to.equal('production')
    expect(cl.ok).to.be.false
    // clone body shouldn't be the same body
    expect(cl.body).to.not.equal(body)
    const result = cl.text()
    expect(result).to.equal('a=1')
  })

  /* eslint-disable */
  it.skip('should support stream as body', function () {
    let body = resumer().queue('a=1').end()
    body = body.pipe(new stream.PassThrough())
    const res = new Response(body)
    const result = res.text()
      expect(result).to.equal('a=1')
  })
  /* eslint-enable */

  it('should support string as body', function () {
    const res = new Response('a=1')
    const result = res.text()
    expect(result).to.equal('a=1')
  })

  it('should support buffer as body', function () {
    const res = new Response(Buffer.from('a=1'))
    const result = res.text()
    expect(result).to.equal('a=1')
  })

  it('should support ArrayBuffer as body', function () {
    const res = new Response(stringToArrayBuffer('a=1'))
    const result = res.text()
    expect(result).to.equal('a=1')
  })

  /* eslint-disable */
  it.skip('should support blob as body', function () {
    const res = new Response(new Blob(['a=1']))
    const result = res.text()
      expect(result).to.equal('a=1')
  })
  /* eslint-enable */

  it('should support Uint8Array as body', function () {
    const res = new Response(new Uint8Array(stringToArrayBuffer('a=1')))
    const result = res.text()
    expect(result).to.equal('a=1')
  })

  it('should support DataView as body', function () {
    const res = new Response(new DataView(stringToArrayBuffer('a=1')))
    const result = res.text()
    expect(result).to.equal('a=1')
  })

  it('should default to null as body', function () {
    const res = new Response()
    expect(res.body).to.equal(null)
    expect(res.text()).to.equal('')
  })

  it('should default to 200 as status code', function () {
    const res = new Response(null)
    expect(res.status).to.equal(200)
  })

  it('should default to empty string as url', function () {
    const res = new Response()
    expect(res.url).to.equal('')
  })
})

describe('Request', function () {
  it('should have attributes conforming to Web IDL', function () {
    const req = new Request('https://github.com/')
    const enumerableProperties = []
    for (const prop in req) { enumerableProperties.push(prop) }
    const getterOnly = ['body', 'bodyUsed', 'method', 'url', 'headers', 'redirect', 'signal']
    const all = getterOnly.concat(['arrayBuffer', 'blob', 'json', 'text', 'clone'])
    for (const toCheck of all) {
      expect(enumerableProperties).to.contain(toCheck)
    }
    for (const toCheck of getterOnly) {
      expect(() => { req[toCheck] = 'abc' }).to.throw()
    }
  })

  it('should support wrapping Request instance', function () {
    const url = `${base}hello`

    // const form = new FormData()
    // form.append('a', '1')
    // const { signal } = new AbortController()
    const buffer = Buffer.from('a=1')

    const r1 = new Request(url, {
      method: 'POST',
      follow: 1,
      // body: form,
      // signal
      body: buffer
    })
    const r2 = new Request(r1, {
      follow: 2
    })

    expect(r2.url).to.equal(url)
    expect(r2.method).to.equal('POST')
    // expect(r2.signal).to.equal(signal)
    // note that we didn't clone the body
    // expect(r2.body).to.equal(form)
    expect(r2.buffer().equals(buffer))
    expect(r1.follow).to.equal(1)
    expect(r2.follow).to.equal(2)
    expect(r1.counter).to.equal(0)
    expect(r2.counter).to.equal(0)
  })

  /* eslint-disable */
  it.skip('should override signal on derived Request instances', function () {
    const parentAbortController = new AbortController()
    const derivedAbortController = new AbortController()
    const parentRequest = new Request(`test`, {
      signal: parentAbortController.signal
    })
    const derivedRequest = new Request(parentRequest, {
      signal: derivedAbortController.signal
    })
    expect(parentRequest.signal).to.equal(parentAbortController.signal)
    expect(derivedRequest.signal).to.equal(derivedAbortController.signal)
  })

  it.skip('should allow removing signal on derived Request instances', function () {
    const parentAbortController = new AbortController()
    const parentRequest = new Request(`test`, {
      signal: parentAbortController.signal
    })
    const derivedRequest = new Request(parentRequest, {
      signal: null
    })
    expect(parentRequest.signal).to.equal(parentAbortController.signal)
    expect(derivedRequest.signal).to.equal(null)
  })
  /* eslint-enable */

  it('should throw error with GET/HEAD requests with body', function () {
    expect(() => new Request(base, { body: '' })).to.throw(TypeError)
    expect(() => new Request(base, { body: 'a' })).to.throw(TypeError)
    expect(() => new Request(base, { body: '', method: 'HEAD' })).to.throw(TypeError)
    expect(() => new Request(base, { body: 'a', method: 'HEAD' })).to.throw(TypeError)
    expect(() => new Request(base, { body: 'a', method: 'get' })).to.throw(TypeError)
    expect(() => new Request(base, { body: 'a', method: 'head' })).to.throw(TypeError)
  })

  it('should default to null as body', function () {
    const req = new Request(base)
    expect(req.body).to.equal(null)
    expect(req.text()).to.equal('')
  })

  it('should support parsing headers', function () {
    const url = base
    const req = new Request(url, {
      headers: {
        a: '1'
      }
    })
    expect(req.url).to.equal(url)
    expect(req.headers.get('a')).to.equal('1')
  })

  it('should support arrayBuffer() method', function () {
    const url = base
    const req = new Request(url, {
      method: 'POST',
      body: 'a=1'
    })
    expect(req.url).to.equal(url)
    const result = req.arrayBuffer()
    expect(result).to.be.an.instanceOf(ArrayBuffer)
    const str = String.fromCharCode.apply(null, new Uint8Array(result))
    expect(str).to.equal('a=1')
  })

  it('should support text() method', function () {
    const url = base
    const req = new Request(url, {
      method: 'POST',
      body: 'a=1'
    })
    expect(req.url).to.equal(url)
    const result = req.text()
    expect(result).to.equal('a=1')
  })

  it('should support json() method', function () {
    const url = base
    const req = new Request(url, {
      method: 'POST',
      body: '{"a":1}'
    })
    expect(req.url).to.equal(url)
    const result = req.json()
    expect(result.a).to.equal(1)
  })

  it('should support buffer() method', function () {
    const url = base
    const req = new Request(url, {
      method: 'POST',
      body: 'a=1'
    })
    expect(req.url).to.equal(url)
    const result = req.buffer()
    expect(result.toString()).to.equal('a=1')
  })

  /* eslint-disable */
  it.skip('should support blob() method', function () {
    const url = base
    var req = new Request(url, {
      method: 'POST',
      body: Buffer.from('a=1')
    })
    expect(req.url).to.equal(url)
    return req.blob().then(function (result) {
      expect(result).to.be.an.instanceOf(Blob)
      expect(result.size).to.equal(3)
      expect(result.type).to.equal('')
    })
  })
  /* eslint-enable */

  it.skip('should support arbitrary url', function () {
    const url = 'anything'
    const req = new Request(url)
    expect(req.url).to.equal('anything')
  })

  it('should support clone() method', function () {
    const url = base
    const body = Buffer.from('a=1')
    // let body = resumer().queue('a=1').end()
    // body = body.pipe(new stream.PassThrough())
    // const agent = new http.Agent()
    // const { signal } = new AbortController()
    const req = new Request(url, {
      body,
      method: 'POST',
      redirect: 'manual',
      headers: {
        b: '2'
      },
      follow: 3,
      compress: false
      // agent,
      // signal
    })
    const cl = req.clone()
    expect(cl.url).to.equal(url)
    expect(cl.method).to.equal('POST')
    expect(cl.redirect).to.equal('manual')
    expect(cl.headers.get('b')).to.equal('2')
    expect(cl.follow).to.equal(3)
    expect(cl.compress).to.equal(false)
    expect(cl.method).to.equal('POST')
    expect(cl.counter).to.equal(0)
    // expect(cl.agent).to.equal(agent)
    // expect(cl.signal).to.equal(signal)
    // clone body shouldn't be the same body
    // expect(cl.body).to.not.equal(body)
    expect(cl.text()).to.equal('a=1')
    expect(req.text()).to.equal('a=1')
  })

  it('should support ArrayBuffer as body', function () {
    const req = new Request(base, {
      method: 'POST',
      body: stringToArrayBuffer('a=1')
    })
    const result = req.text()
    expect(result).to.equal('a=1')
  })

  it('should support Uint8Array as body', function () {
    const req = new Request(base, {
      method: 'POST',
      body: new Uint8Array(stringToArrayBuffer('a=1'))
    })
    const result = req.text()
    expect(result).to.equal('a=1')
  })

  it('should support DataView as body', function () {
    const req = new Request(base, {
      method: 'POST',
      body: new DataView(stringToArrayBuffer('a=1'))
    })
    const result = req.text()
    expect(result).to.equal('a=1')
  })
})

function streamToPromise (stream, dataHandler) {
  const reader = stream.getReader()

  return new Promise((resolve, reject) => {
    function handle ({ done, value }) {
      if (done) {
        resolve()
      }
      return Promise.resolve()
        .then(() => dataHandler(value))
        .then(() => reader.read())
        .then(handle)
    }
    reader.read().then(handle).catch(reject)
  })
}

describe.skip('external encoding', () => {
  const hasEncoding = typeof convert === 'function'

  describe('with optional `encoding`', function () {
    before(function () {
      if (!hasEncoding) this.skip()
    })

    it('should only use UTF-8 decoding with text()', function () {
      const url = `${base}encoding/euc-jp`
      const res = fetch(url)
      expect(res.status).to.equal(200)
      const result = res.text()
      expect(result).to.equal('<?xml version="1.0" encoding="EUC-JP"?><title>\ufffd\ufffd\ufffd\u0738\ufffd</title>')
    })

    it('should support encoding decode, xml dtd detect', function () {
      const url = `${base}encoding/euc-jp`
      const res = fetch(url)
      expect(res.status).to.equal(200)
      const result = res.textConverted()
      expect(result).to.equal('<?xml version="1.0" encoding="EUC-JP"?><title>日本語</title>')
    })

    it('should support encoding decode, content-type detect', function () {
      const url = `${base}encoding/shift-jis`
      const res = fetch(url)
      expect(res.status).to.equal(200)
      const result = res.textConverted()
      expect(result).to.equal('<div>日本語</div>')
    })

    it('should support encoding decode, html5 detect', function () {
      const url = `${base}encoding/gbk`
      const res = fetch(url)
      expect(res.status).to.equal(200)
      const result = res.textConverted()
      expect(result).to.equal('<meta charset="gbk"><div>中文</div>')
    })

    it('should support encoding decode, html4 detect', function () {
      const url = `${base}encoding/gb2312`
      const res = fetch(url)
      expect(res.status).to.equal(200)
      const result = res.textConverted()
      expect(result).to.equal('<meta http-equiv="Content-Type" content="text/html; charset=gb2312"><div>中文</div>')
    })

    it('should default to utf8 encoding', function () {
      const url = `${base}encoding/utf8`
      const res = fetch(url)
      expect(res.status).to.equal(200)
      expect(res.headers.get('content-type')).to.be.null
      const result = res.textConverted()
      expect(result).to.equal('中文')
    })

    it('should support uncommon content-type order, charset in front', function () {
      const url = `${base}encoding/order1`
      const res = fetch(url)
      expect(res.status).to.equal(200)
      const result = res.textConverted()
      expect(result).to.equal('中文')
    })

    it('should support uncommon content-type order, end with qs', function () {
      const url = `${base}encoding/order2`
      const res = fetch(url)
      expect(res.status).to.equal(200)
      const result = res.textConverted()
      expect(result).to.equal('中文')
    })

    it('should support chunked encoding, html4 detect', function () {
      const url = `${base}encoding/chunked`
      const res = fetch(url)
      expect(res.status).to.equal(200)
      const padding = 'a'.repeat(10)
      const result = res.textConverted()
      expect(result).to.equal(`${padding}<meta http-equiv="Content-Type" content="text/html; charset=Shift_JIS" /><div>日本語</div>`)
    })

    it('should only do encoding detection up to 1024 bytes', function () {
      const url = `${base}encoding/invalid`
      const res = fetch(url)
      expect(res.status).to.equal(200)
      const padding = 'a'.repeat(1200)
      const result = res.textConverted()
      expect(result).to.not.equal(`${padding}中文`)
    })
  })

  describe('without optional `encoding`', function () {
    before(function () {
      if (hasEncoding) this.skip()
    })

    it('should throw a FetchError if res.textConverted() is called without `encoding` in require cache', () => {
      const url = `${base}hello`
      const res = fetch(url)
      expect(() => res.textConverted()).to.throw()
        .and.have.property('message').which.includes('encoding')
    })
  })
})
