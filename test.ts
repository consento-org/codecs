#!/usr/bin/env npx ts-node
import tape from 'tape'
import codecs, { Codec, CodecOption, INamedCodec, InType, OutType, CodecName } from '.'
import { Buffer } from 'buffer'

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

tape('typescript message types', async t => {
  const x: InType<'msgpack'> = 'hello'
  // @ts-expect-error
  const y: InType<'utf8'> = {}
  type custom = INamedCodec<'hello', number>
  // @ts-expect-error
  const z: InType<custom> = 'hello'
  // @ts-expect-error
  const d: InType<null, 'utf8'> = {}
  const a: InType<'binary'> = Buffer.from('hello')
})

tape('typescript message types', async t => {
  const x: OutType<'msgpack'> = new Uint8Array(0)
  const y: OutType<'utf8'> = 'hi'
  type custom = INamedCodec<'hello', number>
  const z: OutType<custom> = 1
  const d: OutType<null, 'utf8'> = 'string'
  const a: OutType<'binary'> = Buffer.from('hello')
})

tape('typescript names', async t => {
  const x: CodecName<'msgpack'> = 'msgpack'
  // @ts-expect-error
  const y: CodecName<'msgpack'> = 'hello'
  const z: CodecName<undefined> = 'binary'
  const a: CodecName<undefined, 'msgpack'> = 'msgpack'
  type custom = INamedCodec<'hello', number>
  const b: CodecName<custom> = 'hello'
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
