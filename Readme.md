# `@consento/codecs`

Extended version of [`codecs`](https://github.com/mafintosh/codecs) that is suited for serialization, supports typescript
and supports [`msgpack`](https://github.com/msgpack/msgpack-javascript).

```js
const codecs = require('@consento/codecs')
const json = codecs('json')
const buffer = json.encode({ hello: 'world'}) // JSON buffer
json.decode(buffer)
```

## Fallback support

> This is particularly interesting for `TypeScript` as proper type declarations can be tough!

Codecs supports an additional `fallback` property that is used if a given codec is not available.

```typescript
import codecs, { Codec, CodecOption } from '@consento/codecs'

const fn = function <TCodec extends CodecOption = undefined> ({ codec }: { codec?: TCodec } = {}): Codec<TCodec, 'msgpack'> {
  return codecs(codec, 'msgpack') // The default fallback is 'binary', here we change it to 'msgpack'
}

fn().name === 'msgpack'
fn({ codec: 'json' }).name === 'json'
```

## License

[MIT](./LICENSE)
