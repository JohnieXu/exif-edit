/**
 * base64 格式的 dataURL 转为 File 对象
 * @param {String} b64Data 文件 base64 数据
 * @param String contentType MIME 类型
 * @param {String} fileName 文件名
 * @param {Number} sliceSize 切片大小
 * @returns {File} 文件
 */
export const b64toFile = (b64Data, contentType, fileName, sliceSize = 512) => {

  var byteCharacters = window.atob(b64Data);
  var byteArrays = [];

  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    var slice = byteCharacters.slice(offset, offset + sliceSize);

    var byteNumbers = new Array(slice.length);
    for (var i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    var byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  return new File(byteArrays, fileName, { type: contentType });
}

/**
 * 生成文件 URL
 * @param {File} file 文件
 * @returns {Array}
 */
export const createObjectURL = (file) => {
  const url = URL.createObjectURL(file)
  return [url, () => { URL.revokeObjectURL(url) }]
}

/**
 * 释放文件
 * @param {String} url 文件 URL
 * @returns 
 */
export const revokeObjectURL = (url) => {
  return URL.revokeObjectURL(url)
}

/**
 * 从 file 文件获取图片像素大小、图片数据
 * @param {File} file 文件对象
 */
export const getImageSize = (file) => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const [imageUrl, revoke] = createObjectURL(file)
    image.src = imageUrl
    image.onload = () => {
      revoke()
      resolve({
        imageSize: {
          width: image.width,
          height: image.height,
        },
        image
      })
    }
    image.onerror = (e) => {
      revoke()
      reject(e)
    }
  })
}

/**
 * 读取 file 文件为 ArrayBuffer 对象
 * @param {File} file 文件对象
 */
export const readFile2Buffer = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = (e) => {
      resolve(e.target.result)
    }
    fileReader.onerror = (e) => {
      reject(e)
    }
    fileReader.readAsArrayBuffer(file)
  })
}

/**
 * 读取 file 文件为 dataURL 字符串
 * @param {File} file 文件对象
 * @returns 文件的 dataURL
 */
export const getImageData = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = (e) => {
      resolve(e.target.result)
    }
    fileReader.onerror = (error) => {
      reject(error)
    }
    fileReader.readAsDataURL(file)
  })
}
