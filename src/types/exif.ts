export interface ExifForm extends Record<string, unknown> {
  version: string | null
  M: string | null
  F: number | string | null
  S: number | string | null
  ISO: number | string | null
  L: number | string | null
  T: string | null
  LEN: string | null
}

export type ExifValue = ExifForm
export type ParsedExif = ExifForm

export interface ExifChangePayload {
  exif: ExifForm
  b64: string
  fileName: string
}

export interface ExifData {
  '0th'?: Record<number, unknown>
  Exif?: Record<number, unknown>
  GPS?: Record<number, unknown>
  Interop?: Record<number, unknown>
  '1st'?: Record<number, unknown>
  thumbnail?: string | null
}
