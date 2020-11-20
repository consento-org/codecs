const Buffer = require('buffer').Buffer
const inspect = require('inspect-custom-symbol')
const msgpack = require('@msgpack/msgpack')

const list = [
  createString('ascii'),
  createString('base64'),
  Object.seal({
    name: 'binary',
    [inspect]: createInspect('Buffer', 'binary'),
    encode: function encodeBinary (obj) {
      return typeof obj === 'string'
        ? Buffer.from(obj, 'utf-8')
        : Buffer.isBuffer(obj)
          ? obj
          : Buffer.from(obj.buffer, obj.byteOffset, obj.byteLength)
    },
    decode: function decodeBinary (buf) {
      return Buffer.isBuffer(buf)
        ? buf
        : Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength)
    }
  }),
  createString('hex'),
  createJSON('json', false),
  Object.seal({
    name: 'msgpack',
    [inspect]: createInspect('any', 'msgpack'),
    encode: function encodeMsgPack (obj) {
      const arr = msgpack.encode(obj)
      return Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength)
    },
    decode: msgpack.decode
  }),
  createJSON('ndjson', true),
  createString('ucs-2'),
  createString('ucs2'),
  createString('utf-8'),
  createString('utf16-le'),
  createString('utf16le'),
  createString('utf8')
]

function codecs (name, fallback) {
  if (typeof name === 'object' && name !== null && typeof name.name === 'string' && typeof name.decode === 'function' && typeof name.encode === 'function') {
    return name
  }
  const codec = codecs[name]
  if (!codec) {
    return fallback ? codecs(fallback) : codecs.binary
  }
  return codec
}

codecs.available = list.map(entry => entry.name).sort()
list.forEach(entry => { codecs[entry.name] = entry })
codecs.has = codec => codecs.available.includes(codec)
codecs[Symbol.iterator] = () => list[Symbol.iterator]()
codecs[inspect] = (_, { stylize }) => `function ${stylize('@consento/codecs', 'module')} (${codecs.available.map(name => stylize(name, 'special')).join('|')}): { name, encode, decode }`
codecs.inspect = createInspect

module.exports = Object.seal(codecs)

function createInspect (type, name) {
  return function (_, opts) {
    return `Codec(${opts.stylize(type, 'string')}|${opts.stylize(name, 'string')})`
  }
}

function createJSON (name, newline) {
  return Object.seal({
    name: name,
    [inspect]: createInspect('any', name),
    encode: newline ? encodeNDJSON : encodeJSON,
    decode: function decodeJSON (buf) {
      return JSON.parse(buf.toString())
    }
  })

  function encodeJSON (val) {
    return Buffer.from(JSON.stringify(val))
  }

  function encodeNDJSON (val) {
    return Buffer.from(JSON.stringify(val) + '\n')
  }
}

function createString (type) {
  return Object.seal({
    name: type,
    [inspect]: createInspect('string', type),
    encode: function encodeString (val) {
      if (typeof val !== 'string') val = val.toString()
      return Buffer.from(val, type)
    },
    decode: function decodeString (buf) {
      return buf.toString(type)
    }
  })
}
