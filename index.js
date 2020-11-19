const unnamedCodecs = require('codecs')
const inspect = require('inspect-custom-symbol')
const msgpack = require('@msgpack/msgpack')

function createNamed (name, codec) {
  return Object.seal({
    name,
    [inspect]: function (_, opts) {
      return `Codec(${opts.stylize(name, 'string')})`
    },
    toJSON: function () {
      return name
    },
    ...(codec || unnamedCodecs(name))
  })
}

const list = [
  createNamed('ascii'),
  createNamed('base64'),
  createNamed('binary'),
  createNamed('hex'),
  createNamed('json'),
  createNamed('msgpack', msgpack),
  createNamed('ndjson'),
  createNamed('ucs-2'),
  createNamed('ucs2'),
  createNamed('utf-8'),
  createNamed('utf16-le'),
  createNamed('utf16le'),
  createNamed('utf8')
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
codecs[inspect] = (_, { stylize}) => `function ${stylize('codecs', 'module')} (${codecs.available.map(name => stylize(name, 'special')).join('|')}): { name, encode, decode }`

module.exports = Object.seal(codecs)
