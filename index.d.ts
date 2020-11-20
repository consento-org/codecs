import { Buffer } from 'buffer'
export interface ICodec <TIn, TOut = TIn> {
  encode (input: TIn): Buffer
  decode (input: Uint8Array): TOut
}
export interface INamedCodec <TName extends string = string, TIn = any, TOut = TIn> extends ICodec<TIn, TOut> {
  name: TName
}
export type StringCodec = 'ascii' | 'utf-8' | 'utf8' | 'hex' | 'base64' | 'ucs-2' | 'ucs2' | 'utf16-le' | 'utf16le'
export type ObjectCodec = 'ndjson' | 'json' | 'msgpack'
export type SupportedCodec = StringCodec | ObjectCodec | 'binary'
export type BinaryCodec = INamedCodec<'binary', string | ArrayBufferView, Buffer>
export type CodecOption = SupportedCodec | INamedCodec | null | undefined

type PropType<TObj, TProp extends keyof TObj> = TObj[TProp]
type ArgsType<T> = T extends (...args: infer U) => any ? U : never

export type OutType <TCodec extends CodecOption, TDefault extends CodecOption = BinaryCodec> =
  ReturnType<PropType<Codec<TCodec, TDefault>, 'decode'>>
export type InType <TCodec extends CodecOption, TDefault extends CodecOption = BinaryCodec> =
  ArgsType<PropType<Codec<TCodec, TDefault>, 'encode'>>[0]
export type CodecName <TCodec extends CodecOption, TDefault extends CodecOption = BinaryCodec> =
  PropType<Codec<TCodec, TDefault>, 'name'>

export type Codec <TCodec extends CodecOption, TDefault extends CodecOption = BinaryCodec> =
  TCodec extends null | undefined
    ? (
      TDefault extends null | undefined
        ? BinaryCodec
        : TDefault extends SupportedCodec
          ? typeof codecs[TDefault]
          : TDefault
      )
    : TCodec extends SupportedCodec
      ? typeof codecs[TCodec]
      : TCodec extends INamedCodec
        ? TCodec
        : BinaryCodec

interface ICodecs {

  <TCodec extends CodecOption = undefined, TDefault extends CodecOption = 'binary'>(codec?: TCodec, fallback?: TDefault): Codec<TCodec, TDefault>

  [Symbol.iterator] (): Iterator<INamedCodec<SupportedCodec, any>>

  has (codec: SupportedCodec | INamedCodec): codec is SupportedCodec

  available: Array<SupportedCodec>
  binary: BinaryCodec
  ascii: INamedCodec<'ascii', string>
  'utf-8': INamedCodec<'utf-8', string>
  utf8: INamedCodec<'utf8', string>
  hex: INamedCodec<'hex', string>
  base64: INamedCodec<'base64', string>
  'ucs-2': INamedCodec<'ucs-2', string>
  ucs2: INamedCodec<'ucs2', string>
  'utf16-le': INamedCodec<'utf16-le', string>
  utf16le: INamedCodec<'utf16le', string>
  ndjson: INamedCodec<'ndjson', any>
  msgpack: INamedCodec<'msgpack', any>
  json: INamedCodec<'json', any>
  inspect (type: string, name: string): () => string
}

declare const codecs: ICodecs

export default codecs
