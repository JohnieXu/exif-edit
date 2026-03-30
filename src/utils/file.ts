export const b64toFile = (
  b64Data: string,
  contentType: string,
  fileName: string,
  sliceSize = 512
) => {
  const byteCharacters = window.atob(b64Data)
  const byteArrays: BlobPart[] = []

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize)
    const byteNumbers = new Array(slice.length)
    for (let i = 0; i < slice.length; i += 1) {
      byteNumbers[i] = slice.charCodeAt(i)
    }
    byteArrays.push(new Uint8Array(byteNumbers))
  }

  return new File(byteArrays, fileName, { type: contentType })
}

export const createObjectURL = (file: File) => {
  const url = URL.createObjectURL(file)
  return [url, () => URL.revokeObjectURL(url)] as const
}

export const revokeObjectURL = (url: string) => URL.revokeObjectURL(url)

export const getImageSize = (file: File) => {
  return new Promise<{ imageSize: { width: number; height: number }; image: HTMLImageElement }>(
    (resolve, reject) => {
      const image = new Image()
      const [imageUrl, revoke] = createObjectURL(file)
      image.src = imageUrl
      image.onload = () => {
        revoke()
        resolve({
          imageSize: {
            width: image.width,
            height: image.height
          },
          image
        })
      }
      image.onerror = (e) => {
        revoke()
        reject(e)
      }
    }
  )
}

export const getBase64ByteSize = (b64: string) => {
  if (!b64) {
    return 0
  }
  return Math.ceil((b64.length * 3) / 4)
}

export const byte2Mb = (n: number, precision = 2) => `${(n / 1000 / 1000).toFixed(precision)}Mb`

export const readFile2Buffer = (file: File) => {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = (e) => {
      resolve(e.target?.result as ArrayBuffer)
    }
    fileReader.onerror = (e) => {
      reject(e)
    }
    fileReader.readAsArrayBuffer(file)
  })
}

export const getImageData = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = (e) => {
      resolve(e.target?.result as string)
    }
    fileReader.onerror = (error) => {
      reject(error)
    }
    fileReader.readAsDataURL(file)
  })
}
