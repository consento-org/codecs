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

tape('json', t => {
  var enc = codecs('json')
  t.same(enc.encode({}), Buffer.from('{}'))
  t.same(enc.decode(Buffer.from('{}')), {})
  t.end()
})

tape('utf-8', function (t) {
  var enc = codecs('utf-8')
  t.same(enc.encode('hello world'), Buffer.from('hello world'))
  t.same(enc.decode(Buffer.from('hello world')), 'hello world')
  t.end()
})

tape('hex', function (t) {
  var enc = codecs('hex')
  t.same(enc.encode('abcd'), Buffer.from([0xab, 0xcd]))
  t.same(enc.decode(Buffer.from([0xab, 0xcd])), 'abcd')
  t.end()
})

tape('binary', function (t) {
  var enc = codecs()
  t.same(enc.encode(new Uint8Array([255])).toString('hex'), 'ff', 'encode Uint8Array to Buffer')
  t.same(enc.decode(new Uint8Array([255])).toString('hex'), 'ff', 'decode Uint8Array to Buffer')
  t.same(enc.encode('hello world'), Buffer.from('hello world'))
  t.same(enc.encode(Buffer.from('hello world')), Buffer.from('hello world'))
  t.same(enc.decode(Buffer.from('hello world')), Buffer.from('hello world'))
  t.end()
})

tape('custom', function (t) {
  const custom: INamedCodec<'custom', number> = {
    name: 'custom',
    encode: function (input: number): Buffer {
      return Buffer.from('lol')
    },
    decode: function (input: Buffer): number {
      return 42
    }
  }
  var enc = codecs(custom)
  enc.name
  // @ts-expect-error
  t.same(enc.encode('hello'), Buffer.from('lol'))
  t.same(enc.encode(42), Buffer.from('lol'))
  t.same(enc.decode(Buffer.from('lol')), 42)
  t.end()
})

tape('uint8arrays in binary', function (t) {
  var enc = codecs('binary')

  var buf = enc.encode(new Uint8Array([1, 2, 3]))
  t.same(buf, Buffer.from([1, 2, 3]))
  t.end()
})

tape('base32', function (t) {
  var enc = codecs('base32')

  var buf = new Uint8Array([1, 2, 3])
  var str = enc.decode(buf)
  t.same(str, 'AEBAG')
  t.same(Buffer.compare(buf, enc.encode(str)), 0)
  t.end()
})

tape('base32-c', function (t) {
  var enc = codecs('base32-c')

  var buf = new Uint8Array([1, 2, 3])
  var str = enc.decode(buf)
  t.same(str, '04106')
  t.same(Buffer.compare(buf, enc.encode(str)), 0)
  t.end()
})

tape('base32-h', function (t) {
  var enc = codecs('base32-h')

  var buf = new Uint8Array([1, 2, 3])
  var str = enc.decode(buf)
  t.same(str, '04106===')
  t.same(Buffer.compare(buf, enc.encode(str)), 0)
  t.end()
})

tape('base32-p', function (t) {
  var enc = codecs('base32-p')

  var buf = new Uint8Array([1, 2, 3])
  var str = enc.decode(buf)
  t.same(str, 'AEBAG===')
  t.same(Buffer.compare(buf, enc.encode(str)), 0)
  t.end()
})
