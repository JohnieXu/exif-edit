const fs = require('fs')
const path = require('path')
const piexifjs = require('piexifjs')
const piexif = require('piexifjs').piexif

const getExifData = (imgData) => {
  // eslint-disable-next-line
  // debugger
  return piexifjs.load(imgData)
}

const parseExifData = (exifData) => {
  if (!exifData) { return null }
  const M = exifData['0th'][piexif.ImageIFD.Model]
  const F = exifData.Exif[piexif.ExifIFD.FNumber]
  const S = exifData.Exif[piexif.ExifIFD.ExposureTime]
  const ISO = exifData.Exif[piexif.ExifIFD.ISOSpeedRatings]
  const L = exifData.Exif[piexif.ExifIFD.FocalLength]
  const LEN = exifData.Exif[piexif.ExifIFD.LensModel]
  const T = exifData.Exif[piexif.ExifIFD.DateTimeOriginal]
  return {
    M: M || null,
    F: F && F[0] && F[1] ? `${F[0] / F[1]}` : null,
    S: S && S[0] && S[1] ? S[1] : null,
    ISO: ISO || null,
    L: L && L[0] && L[1] ? L[0] / L[1] : null,
    LEN: LEN || null,
    T: T || null
  }
}

function main() {
  // const dataURL = fs.readFileSync(path.resolve(__dirname, './dataURL.txt'), { encoding: 'utf-8' })
  // console.log(dataURL.length)
  const dataURL = 'data:image/jpg;base64,' + fs.readFileSync(path.resolve(__dirname, './demo1.jpg'), 'base64')
  const exifData = getExifData(dataURL)
  console.log(exifData)
}

main()
