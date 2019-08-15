# sync-fetch
Synchronous wrapper around the Fetch API. Uses [`node-fetch`]() under the hood, and for some input-parsing code and test cases too.

## Use

```js
const fetch = require('sync-fetch')

const metadata = fetch('https://doi.org/', {
  headers: {
    Accept: 'application/'
  }
}).json()
```
