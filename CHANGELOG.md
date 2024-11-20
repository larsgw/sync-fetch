# [0.6.0-2](https://github.com/larsgw/sync-fetch/compare/v0.6.0-1...v0.6.0-2) (2024-11-20)


### Features

* add support for SyncResponse#blob() in Node.js ([6b1e85c](https://github.com/larsgw/sync-fetch/commit/6b1e85c031d81ba1826be768e3d25b26b721e786))



# [0.6.0-1](https://github.com/larsgw/sync-fetch/compare/v0.6.0-0...v0.6.0-1) (2024-11-20)


### Bug Fixes

* fix handling of duplicate headers ([b3460ca](https://github.com/larsgw/sync-fetch/commit/b3460ca85c94c237ed389180be4f6c2ae333e805))



# [0.6.0-0](https://github.com/larsgw/sync-fetch/compare/v0.5.2...v0.6.0-0) (2024-11-19)


### Code Refactoring

* upgrade to node-fetch 3 ([071930c](https://github.com/larsgw/sync-fetch/commit/071930cf6e37f9a72afc912fcb17c7f93597b018))


### BREAKING CHANGES

* drop support for Node 14, 16; upgrade to node-fetch 3



## [0.5.2](https://github.com/larsgw/sync-fetch/compare/v0.5.1...v0.5.2) (2023-06-11)

* update package definition ([7325c8a](https://github.com/larsgw/sync-fetch/commit/7325c8aed4295cdea43213d175705cdb1e91ee05))



## [0.5.1](https://github.com/larsgw/sync-fetch/compare/v0.5.0...v0.5.1) (2023-06-11)


### Bug Fixes

* **browser:** correctly send request body ([77a5b8f](https://github.com/larsgw/sync-fetch/commit/77a5b8f4f1091ca5a05c42801f63a7632f983ee8))
* **browser:** fix text responses ([ce210ce](https://github.com/larsgw/sync-fetch/commit/ce210ced0e8108c30e5ab0b5c992e18fbd8710c7))
* **browser:** remove SyncResponse#buffer() ([5d17fba](https://github.com/larsgw/sync-fetch/commit/5d17fba8c78f71dcd8268cdd360bf802dd7e9bc8))



# [0.5.0](https://github.com/larsgw/sync-fetch/compare/v0.4.5...v0.5.0) (2023-06-11)


* refactor!: replace Buffer with TextEncoder and Uint8Array ([1615baa](https://github.com/larsgw/sync-fetch/commit/1615baa1a32db9216a17618dcf1b7043c1d34496)), closes [#27](https://github.com/larsgw/sync-fetch/issues/27)


### BREAKING CHANGES

* Support for IE and Edge <18 dropped.



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

* **browser:** improve browser compatibility ([c65b3aa](https://github.com/larsgw/sync-fetch/commit/c65b3aa4c392e1c34af7957dd86d66ef0700a29d))


* chore!: raise minimal Node.js version to 14 ([096e7a3](https://github.com/larsgw/sync-fetch/commit/096e7a3cf19bdd1109634506ba388608764662d2))


### BREAKING CHANGES

* Use Node.js 14 or higher. sync-fetch 0.3.x will keep
getting critical security fixes if possible, but keep in mind that
Node.js 12 itself is EOL and will itself not receive any security
updates.



## [0.3.1](https://github.com/larsgw/sync-fetch/compare/v0.3.0...v0.3.1) (2021-10-09)


### Bug Fixes

* transfer binary data correctly ([674c848](https://github.com/larsgw/sync-fetch/commit/674c84886a3943a80d57495d7e78ad0a0230390d))



# [0.3.0](https://github.com/larsgw/sync-fetch/compare/v0.2.1...v0.3.0) (2020-11-02)


* chore!: drop node 8 and add 14 ([b8b3e6c](https://github.com/larsgw/sync-fetch/commit/b8b3e6c36d94be032844f2f2c1cb1e1246192171))


### BREAKING CHANGES

* drop Node 8 support



## [0.2.1](https://github.com/larsgw/sync-fetch/compare/v0.2.0...v0.2.1) (2020-11-02)


### Bug Fixes

* call .join on stdin chunks array using empty string separator ([bd609ad](https://github.com/larsgw/sync-fetch/commit/bd609ad7824e2212bc8e83838025993027959eac))



# [0.2.0](https://github.com/larsgw/sync-fetch/compare/v0.1.1...v0.2.0) (2020-06-27)


* refactor!: change class names ([2e6a9ea](https://github.com/larsgw/sync-fetch/commit/2e6a9ea18347916583484804e7dd28145920a70e))


### BREAKING CHANGES

* Changes Response and Request class names



## [0.1.1](https://github.com/larsgw/sync-fetch/compare/v0.1.0...v0.1.1) (2019-10-24)


### Bug Fixes

* allow child process to flush io ([4424e5f](https://github.com/larsgw/sync-fetch/commit/4424e5ff3c4667912e2016444800e83b8a495af3)), closes [/github.com/nodejs/node/issues/19218#issuecomment-434839796](https://github.com//github.com/nodejs/node/issues/19218/issues/issuecomment-434839796)
* stringify execFileSync return value ([7c0c668](https://github.com/larsgw/sync-fetch/commit/7c0c66876b812377ad5d8e385cb5e2d7ccb7874b))



# [0.1.0](https://github.com/larsgw/sync-fetch/compare/6f1563e132369980c3e873743e8e8528ba042890...v0.1.0) (2019-08-29)


### Bug Fixes

* **body:** also inline constructor ([fe75247](https://github.com/larsgw/sync-fetch/commit/fe752476b49137ae4311307be7245530a26263aa))
* **body:** clone as sync instance ([dd0b3c2](https://github.com/larsgw/sync-fetch/commit/dd0b3c2fefdfb1016b8d62a1583b34c6fbf3b636))
* **body:** default to null body ([e5bd3b2](https://github.com/larsgw/sync-fetch/commit/e5bd3b2df4fb0b0a11715dcdacaa1246c2c43862))
* **body:** do not consume body on clone ([52dd003](https://github.com/larsgw/sync-fetch/commit/52dd00328c46894f46b39ad20e77776d170a7b68))
* **body:** fix cloning consuming the body ([8582046](https://github.com/larsgw/sync-fetch/commit/858204697519ef1d852f95b0db5f0cf20176df5c))
* **body:** handle multi-value headers ([379f55b](https://github.com/larsgw/sync-fetch/commit/379f55b9a3882df7881af014bb8652f029cdaa8d))
* **body:** inline body for super call ([4b749f0](https://github.com/larsgw/sync-fetch/commit/4b749f0af8479efe2cf48bee8c3754282e2d79a6))
* **body:** make body methods enumerable ([b20d190](https://github.com/larsgw/sync-fetch/commit/b20d1907a22c5d9e0eb33834608f0f84df3e9d26))
* **body:** make clone method enumerable ([27fa776](https://github.com/larsgw/sync-fetch/commit/27fa776eff26ce5fd335f19b4eda51b9c926fcbd))
* **body:** only use super.buffer() ([7558e7d](https://github.com/larsgw/sync-fetch/commit/7558e7d62ad01b7a6cb8916a15f727c245593d83))
* **body:** pass stream to original Body ([aa8a491](https://github.com/larsgw/sync-fetch/commit/aa8a4917825bcdf5b507a4f8d6f420167a90b3de))
* **body:** throw error on stream input ([ede18b8](https://github.com/larsgw/sync-fetch/commit/ede18b892e27f70e37a7807cd8708038c2bb56fe))
* **body:** throw error when body already used ([e78484d](https://github.com/larsgw/sync-fetch/commit/e78484dd1d4c8369bf8a2923f100c0779af11036))
* **request:** count other bodies as string ([ed729f5](https://github.com/larsgw/sync-fetch/commit/ed729f5972b1f44dbc39ba89a8f2688a66fd8b90))
* **request:** pass body as-is ([d36eb2a](https://github.com/larsgw/sync-fetch/commit/d36eb2a124085b5fb04e3ce8de7450f81b1e8830))
* **request:** properly include headers ([84a1de5](https://github.com/larsgw/sync-fetch/commit/84a1de5c5243e6d66e56e106dfd6711b2e37dd05))
* **request:** special handling for input body strings ([62c7876](https://github.com/larsgw/sync-fetch/commit/62c7876319743ea89869c7053ffbc6d91960fbc5))
* **request:** support node-fetch-only props ([a6e3d38](https://github.com/larsgw/sync-fetch/commit/a6e3d38847f9f1c0eacee438fbbac8a80d795fd0))
* **response:** fix response error type ([99ef625](https://github.com/larsgw/sync-fetch/commit/99ef625defa344d835b071dd082760cb712b4c42))
* **response:** include url ([a82beea](https://github.com/larsgw/sync-fetch/commit/a82beea084ec6f51f5fa92a216e52aee671c3a07))
* **response:** properly include headers ([7afa710](https://github.com/larsgw/sync-fetch/commit/7afa7104df9014265454f1781a54be8124af5314))
* **response:** support all body types ([f7de954](https://github.com/larsgw/sync-fetch/commit/f7de95481b1083a6a9268a7d0e0442015d16393f))
* **response:** support redirected prop ([0d9714f](https://github.com/larsgw/sync-fetch/commit/0d9714f1999dec730908038a140bf6ff03ee20f9))
* **response:** throw body errors late ([d1fcbc4](https://github.com/larsgw/sync-fetch/commit/d1fcbc4325fd38e1296e02e4c816713bfa6d2145))
* support Node 8 ([52c0129](https://github.com/larsgw/sync-fetch/commit/52c0129086ef12b2d9ac2591f3075b2b58875ae0))


### Features

* **body:** catch async errors ([390ddab](https://github.com/larsgw/sync-fetch/commit/390ddab439151d1d60e0a53940b16eef9b959744))
* **browser:** make working browser alternative ([ef05ffc](https://github.com/larsgw/sync-fetch/commit/ef05ffc0764c29910fd231351398be83ad79ebc6))
* **fetch:** improve child process handling ([fece0fa](https://github.com/larsgw/sync-fetch/commit/fece0fab1f16025b5d872408a3e85636c0135fd6))
* **fetch:** support Node URL object input ([d753191](https://github.com/larsgw/sync-fetch/commit/d753191e5d1081f3066b436e253e2ac45a08cc29))
* initial implementation ([6f1563e](https://github.com/larsgw/sync-fetch/commit/6f1563e132369980c3e873743e8e8528ba042890))



## [0.5.1](https://github.com/larsgw/sync-fetch/compare/v0.5.0...v0.5.1) (2023-06-11)


### Bug Fixes

* **browser:** correctly send request body ([77a5b8f](https://github.com/larsgw/sync-fetch/commit/77a5b8f4f1091ca5a05c42801f63a7632f983ee8))
* **browser:** fix text responses ([ce210ce](https://github.com/larsgw/sync-fetch/commit/ce210ced0e8108c30e5ab0b5c992e18fbd8710c7))
* **browser:** remove SyncResponse#buffer() ([5d17fba](https://github.com/larsgw/sync-fetch/commit/5d17fba8c78f71dcd8268cdd360bf802dd7e9bc8))



# [0.5.0](https://github.com/larsgw/sync-fetch/compare/v0.4.5...v0.5.0) (2023-06-11)


* refactor!: replace Buffer with TextEncoder and Uint8Array ([1615baa](https://github.com/larsgw/sync-fetch/commit/1615baa1a32db9216a17618dcf1b7043c1d34496)), closes [#27](https://github.com/larsgw/sync-fetch/issues/27)


### BREAKING CHANGES

* Support for IE and Edge <18 dropped.



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
