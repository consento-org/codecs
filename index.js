const inspect = require('inspect-custom-symbol')

const nullStyle = Object.freeze({
  stylize: Object.freeze(any => any)
})

function prepare (codec, type, name) {
  if (!name) {
    name = codec.name
  }
  return Object.freeze({
    ...codec,
    name,
    toString: inspectFn.bind(null, null, nullStyle),
    [inspect]: inspectFn
  })

  function inspectFn (_, opts) {
    return `[Codec ${opts.stylize(type, 'string')}|${opts.stylize(name, 'string')}]`
  }
}

const b32Names = ['base32', 'base32c', 'base32h', 'base32hp', 'base32p']
let b32
function getB32 (name) {
  let codec
  return {
    get () {
      if (codec === undefined) {
        if (b32 === undefined) {
          b32 = require('base32-codecs')
        }
        codec = prepare(b32[name], 'string')
      }
      return codec
    }
  }
}

let base
const baseNames = ['ascii', 'base64', 'binary', 'hex', 'json', 'ndjson', 'ucs-2', 'ucs2', 'utf-8', 'utf16le', 'utf16-le', 'utf8']
function getBase (name) {
  let codec
  return {
    get () {
      if (codec === undefined) {
        if (base === undefined) {
          base = require('codecs')
        }
        const baseCodec = base(name)
        codec = prepare(baseCodec, name === 'binary' ? 'Buffer' : name === 'json' || name === 'ndjson' ? 'any' : 'string')
      }
      return codec
    }
  }
}

const props = {}
for (const b32Name of b32Names) {
  props[b32Name] = getB32(b32Name)
}
for (const baseName of baseNames) {
  props[baseName] = getBase(baseName)
}

const byName = {}

let msgpack
props.msgpack = {
  get () {
    if (msgpack === undefined) {
      msgpack = prepare(require('msgpack-codec'), 'any')
    }
    return msgpack
  }
}

Object.defineProperties(byName, props)

function codecs (name, fallback) {
  if (typeof name === 'object' && name !== null && typeof name.name === 'string' && typeof name.decode === 'function' && typeof name.encode === 'function') {
    return name
  }
  const codec = byName[name]
  if (codec !== undefined) {
    return codec
  }
  if (fallback !== undefined && fallback !== null) {
    return fallback
  }
  return byName.binary
}

const available = b32Names.concat(baseNames).concat(['msgpack']).sort()
codecs.available = available
codecs.has = codec => available.includes(codec)
codecs[Symbol.iterator] = () => {
  const nextName = available[Symbol.iterator]()
  return {
    next () {
      while (true) {
        const name = nextName.next()
        if (name.done) {
          return name
        }
        const value = byName[name.value]
        if (value.name !== name.value) {
          continue
        }
        return {
          done: false,
          value
        }
      }
    }
  }
}
codecs[inspect] = (_, { stylize }) => `function ${stylize('@consento/codecs', 'module')} (${available.map(name => stylize(name, 'special')).join('|')}): { name, encode, decode }`
codecs.prepare = prepare
Object.defineProperties(codecs, props)

module.exports = Object.freeze(codecs)
