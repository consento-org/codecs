export interface ICodec <TType> {
  encode (input: TType): Uint8Array
  decode (input: Uint8Array): TType
}
export interface INamedCodec <TName extends string = string, TType = any> extends ICodec<TType> {
  name: TName
}
export type StringCodec = 'ascii' | 'utf-8' | 'utf8' | 'hex' | 'base64' | 'ucs-2' | 'ucs2' | 'utf16-le' | 'utf16le'
export type ObjectCodec = 'ndjson' | 'json' | 'msgpack'
export type SupportedCodec = StringCodec | ObjectCodec | 'binary'
export type BinaryCodec = INamedCodec<'binary', string | DataView>
export type CodecOption = SupportedCodec | INamedCodec | null | undefined
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
      : TCodec

interface ICodecs {
  <TCodec extends CodecOption, TDefault extends CodecOption>(codec?: TCodec, fallback?: TDefault): Codec<TCodec, TDefault>

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
}

declare const codecs: ICodecs

export default codecs
