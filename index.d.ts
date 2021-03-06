import { Codecs as BaseCodecs, Codec as BaseCodec, OutType as BaseOutType, InType as BaseInType, CodecName as BaseCodecName, NamedCodec, BinaryCodec, CodecLookup } from 'codecs'
import { MsgPackCodec, DecodeOptions, EncodeOptions } from 'msgpack-codec'
import { Base32cCodec, Base32Codec, Base32hCodec, Base32hpCodec, Base32pCodec } from 'base32-codecs'

export type BigIntBECodec = NamedCodec<'bigIntBE', bigint>
export type BigIntLECodec = NamedCodec<'bigIntLE', bigint>
export type BigIntQuickCodec = NamedCodec<'bigIntQuick', bigint>
export type BigUintBECodec = NamedCodec<'bigUintBE', bigint>
export type BigUintLECodec = NamedCodec<'bigUintLE', bigint>

interface KnownCodecs extends CodecLookup {
  base32: Base32Codec
  base32c: Base32cCodec
  base32h: Base32hCodec
  base32hp: Base32hpCodec
  base32p: Base32pCodec
  msgpack: MsgPackCodec
  bigIntBE: BigIntBECodec
  bigIntLE: BigIntLECodec
  bigIntQuick: BigIntQuickCodec
  bigUintBE: BigUintBECodec
  bigUintLE: BigUintLECodec
}

export type Codec <TCodec, TFallback = BinaryCodec, TCodecs = KnownCodecs> = BaseCodec<TCodec, TFallback, TCodecs>
export type OutType <TCodec extends MaybeCodecInput, TFallback extends NamedCodec = BinaryCodec, TCodecs = KnownCodecs> = BaseOutType<TCodec, TFallback, TCodecs>
export type InType <TCodec extends MaybeCodecInput, TFallback extends NamedCodec = BinaryCodec, TCodecs = KnownCodecs> = BaseInType<TCodec, TFallback, TCodecs>
export type CodecName <TCodec extends MaybeCodecInput, TFallback extends NamedCodec = BinaryCodec, TCodecs = KnownCodecs> = BaseCodecName<TCodec, TFallback, TCodecs>

export { MsgPackCodec, DecodeOptions, EncodeOptions } from 'msgpack-codec'
export { Base32cCodec, Base32Codec, Base32hCodec, Base32hpCodec, Base32pCodec } from 'base32-codecs'
export { JsonCodec, NDJsonCodec, AsciiCodec, Utf8Codec, HexCodec, Base64Codec, Ucs2Codec, Utf16leCodec, NamedCodec, JsonObject, JsonArray, JsonValue } from 'codecs'
export type CodecInput = keyof KnownCodecs | NamedCodec
export type MaybeCodecInput = CodecInput | null | undefined

interface Codecs extends BaseCodecs, KnownCodecs {
  (): BinaryCodec;
  <TCodec extends MaybeCodecInput, TFallback= BinaryCodec>(
      codec: TCodec,
      fallback?: TFallback,
  ): Codec<TCodec, TFallback>;

  [Symbol.iterator] (): Iterator<NamedCodec<keyof KnownCodecs>>

  has (codec: string): boolean
  bindMsgpack <TName extends string | null | undefined = undefined> (options: { encode?: EncodeOptions, decode?: DecodeOptions }, name?: TName): TName extends string
    ? MsgPackCodec<TName>
    : MsgPackCodec<'msgpack-ext'>

  available: Array<keyof KnownCodecs>
  inspect (type: string, name: string): () => string
}

declare const codecs: Codecs

export default codecs
