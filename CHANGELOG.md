## [0.5.1](https://github.com/larsgw/sync-fetch/compare/v0.5.0...v0.5.1) (2023-06-11)


### Bug Fixes

* **browser:** correctly send request body ([77a5b8f](https://github.com/larsgw/sync-fetch/commit/77a5b8f4f1091ca5a05c42801f63a7632f983ee8))
* **browser:** fix text responses ([ce210ce](https://github.com/larsgw/sync-fetch/commit/ce210ced0e8108c30e5ab0b5c992e18fbd8710c7))
* **browser:** remove SyncResponse#buffer() ([5d17fba](https://github.com/larsgw/sync-fetch/commit/5d17fba8c78f71dcd8268cdd360bf802dd7e9bc8))



# [0.5.0](https://github.com/larsgw/sync-fetch/compare/v0.4.5...v0.5.0) (2023-06-11)


* refactor!: replace Buffer with TextEncoder and Uint8Array ([1615baa](https://github.com/larsgw/sync-fetch/commit/1615baa1a32db9216a17618dcf1b7043c1d34496)), closes [#27](https://github.com/larsgw/sync-fetch/issues/27)


### BREAKING CHANGES

* Support for IE and Edge <18 dropped.

Co-authored-by: Arda TANRIKULU <ardatanrikulu@gmail.com>



## [0.4.5](https://github.com/larsgw/sync-fetch/compare/v0.4.4...v0.4.5) (2023-06-11)


### Bug Fixes

* **browser:** fix binary responses ([479a418](https://github.com/larsgw/sync-fetch/commit/479a41848d2e44391c247a1118647218097ce891))



## [0.4.4](https://github.com/larsgw/sync-fetch/compare/v0.4.3...v0.4.4) (2023-06-11)


### Features

* **browser:** fetch binary outside Worker scopes ([02611fc](https://github.com/larsgw/sync-fetch/commit/02611fc70ea9cae4d61f0ccec9e4d0dfb2bce11b)), closes [#36](https://github.com/larsgw/sync-fetch/issues/36)



## [0.4.3](https://github.com/larsgw/sync-fetch/compare/v0.4.2...v0.4.3) (2023-06-11)


### Bug Fixes

* transfer binary POST bodies correctly ([cf5f592](https://github.com/larsgw/sync-fetch/commit/cf5f5921b0e5a63fc9e69d643f814bbb7ed84160)), closes [#37](https://github.com/larsgw/sync-fetch/issues/37)



## [0.4.2](https://github.com/larsgw/sync-fetch/compare/v0.4.1...v0.4.2) (2022-09-24)



## [0.4.1](https://github.com/larsgw/sync-fetch/compare/v0.4.0...v0.4.1) (2022-05-26)


### Bug Fixes

* **browser:** re-add non-spec timeout option ([168a46c](https://github.com/larsgw/sync-fetch/commit/168a46c441390a7a996fd27d39724f79488db220))



# [0.4.0](https://github.com/larsgw/sync-fetch/compare/v0.3.1...v0.4.0) (2022-05-26)


### Bug Fixes

* **browser:** improve browser compatibility ([c65b3aa](https://github.com/larsgw/sync-fetch/commit/c65b3aa))


* chore!: raise minimal Node.js version to 14 ([096e7a3](https://github.com/larsgw/sync-fetch/commit/096e7a3))


### BREAKING CHANGES

* Use Node.js 14 or higher. sync-fetch 0.3.x will keep
getting critical security fixes if possible, but keep in mind that
Node.js 12 itself is EOL and will itself not receive any security
updates.



## [0.3.1](https://github.com/larsgw/sync-fetch/compare/v0.3.0...v0.3.1) (2021-10-09)


### Bug Fixes

* transfer binary data correctly ([674c848](https://github.com/larsgw/sync-fetch/commit/674c848))



# [0.3.0](https://github.com/larsgw/sync-fetch/compare/v0.2.1...v0.3.0) (2020-11-02)


* chore!: drop node 8 and add 14 ([b8b3e6c](https://github.com/larsgw/sync-fetch/commit/b8b3e6c))


### BREAKING CHANGES

* drop Node 8 support



## [0.2.1](https://github.com/larsgw/sync-fetch/compare/v0.2.0...v0.2.1) (2020-11-02)


### Bug Fixes

* call .join on stdin chunks array using empty string separator ([bd609ad](https://github.com/larsgw/sync-fetch/commit/bd609ad))



# [0.2.0](https://github.com/larsgw/sync-fetch/compare/v0.1.1...v0.2.0) (2020-06-27)


* refactor!: change class names ([2e6a9ea](https://github.com/larsgw/sync-fetch/commit/2e6a9ea))


### BREAKING CHANGES

* Changes Response and Request class names



## [0.1.1](https://github.com/larsgw/sync-fetch/compare/v0.1.0...v0.1.1) (2019-10-24)


### Bug Fixes

* allow child process to flush io ([4424e5f](https://github.com/larsgw/sync-fetch/commit/4424e5f)), closes [/github.com/nodejs/node/issues/19218#issuecomment-434839796](https://github.com//github.com/nodejs/node/issues/19218/issues/issuecomment-434839796)
* stringify execFileSync return value ([7c0c668](https://github.com/larsgw/sync-fetch/commit/7c0c668))



# [0.1.0](https://github.com/larsgw/sync-fetch/compare/6f1563e...v0.1.0) (2019-08-29)
