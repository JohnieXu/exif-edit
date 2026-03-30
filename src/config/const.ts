import type { ExifValue } from '@/types/exif'

export const DEFAULT_EXIF_VERSION = '2.2'

export const DEFAULT_EXIF: ExifValue = {
  version: DEFAULT_EXIF_VERSION,
  M: null,
  F: null,
  S: null,
  ISO: null,
  L: null,
  T: null,
  LEN: null
}

// backward compatibility with legacy naming
export const DEFUALT_EXIF_VERSION = DEFAULT_EXIF_VERSION
export const DEFUALT_EXIF = DEFAULT_EXIF
