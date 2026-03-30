declare module 'downloadjs' {
  export default function download(data: string, filename?: string, mimeType?: string): void
}

declare module 'piexifjs' {
  export const piexif: {
    ImageIFD: Record<string, number>
    ExifIFD: Record<string, number>
  }
  const piexifjs: {
    load(data: string): Record<string, unknown>
    dump(data: Record<string, unknown>): string
    insert(exifStr: string, data: string): string
  }
  export default piexifjs
}
