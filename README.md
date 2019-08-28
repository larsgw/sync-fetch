# sync-fetch
Synchronous wrapper around the Fetch API. Uses [`node-fetch`](https://github.com/bitinn/node-fetch) under the hood, and for some input-parsing code and test cases too.

## Use

```js
const fetch = require('sync-fetch')

const metadata = fetch('https://doi.org/10.7717/peerj-cs.214', {
  headers: {
    Accept: 'application/vnd.citationstyles.csl+json'
  }
}).json()
```

## Shortcomings

  - Does not support `Stream`s (or `FormData`) as input bodies since they cannot be read or serialized synchronously
  - Does not support `Blob`s as input bodies since they're too complex
  - Does not support the non-spec `agent` option as its value cannot be serialized
