#!/usr/bin/env npx ts-node
import tape from 'tape'
import codecs, { Codec, CodecOption, INamedCodec } from '.'

tape('available list', async t => {
  t.equals(new Set(codecs.available).size, codecs.available.length, 'no duplicates in list')
})
tape('all list entries exist on object', async t => {
  for (const entry of codecs.available) {
    const codec = codecs[entry]
    t.equals(codec.name, entry)
  }
})
tape('codecs is iterable', async t => {
  t.deepEqual(Array.from(codecs).map(codec => codec.name), codecs.available)
})

tape('typescript codec argument', async t => {
  const fn = function <TCodec extends CodecOption = undefined> ({ codec }: { codec?: TCodec } = {}): Codec<TCodec, 'msgpack'> {
    return codecs(codec, 'msgpack')
  }
  const binary = fn()
  t.equals(binary.name, 'msgpack')
  const json = fn({ codec: 'json' })
  t.equals(json.name, 'json')
})
tape('bring-your-own codec', async t => {
  const ownCodec: INamedCodec<'fancy', string> = {
    name: 'fancy',
    decode: (buf) => buf.toString(),
    encode: (str) => Buffer.from(str)
  }
  const codec = codecs(ownCodec)
  t.equals(codec.name, 'fancy')
})
tape('bring-your-own fallback', async t => {
  const ownCodec: INamedCodec<'fancy', string> = {
    name: 'fancy',
    decode: (buf) => buf.toString(),
    encode: (str) => Buffer.from(str)
  }
  const codec = codecs(null, ownCodec)
  t.equals(codec.name, 'fancy')
})
