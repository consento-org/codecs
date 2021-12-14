# `@consento/codecs`

Extended, sealed version of [codecs][codecs] that supports [msgpack][msgpack] and `base32` [encoding][b32enc] and [decoding][b32dec].

[codecs]: https://github.com/mafintosh/codecs
[msgpack]: https://github.com/msgpack/msgpack-javascript
[b32enc]: https://github.com/LinusU/base32-encode
[b32dec]: https://github.com/LinusU/base32-decode

```js
const codecs = require('@consento/codecs')
const json = codecs('json')
const buffer = json.encode({ hello: 'world' }) // JSON buffer
json.decode(buffer)

codecs.msgpack // You can access the codecs directly

codecs.available /*
[
  'ascii',    'base32',
  'base32c',  'base32h',
  'base32hp', 'base32p',
  'base64',   'binary',
  'hex',      'json',
  'msgpack',  'ndjson',
  'ucs-2',    'ucs2',
  'utf-8',    'utf16-le',
  'utf16le',  'utf8'
]
*/;

codecs.has('hex') // true

for (const codec of codecs) {
  console.log(codec) /*
    Codec(string:ascii)
    Codec(string:base32)
    Codec(string:base32c)
    Codec(string:base32h)
    Codec(string:base32hp)
    Codec(string:base32p)
    Codec(string:base64)
    Codec(Buffer:binary)
    Codec(string:hex)
    Codec(any:json)
    Codec(any:msgpack)
    Codec(any:ndjson)
    Codec(string:ucs2)
    Codec(string:utf-8)
    Codec(string:utf16le)
  */
}

const extensionCodec = new codecs.msgpack.ExtensionCodec()
const extMsgpack = codecs.bindMsgPack({
  encode: { extensionCodec },
  decode: { extensionCodec }
})
```

## License

[MIT](./LICENSE)
