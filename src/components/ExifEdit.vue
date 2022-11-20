<template>
  <div :class="bem()">
    <!-- 图片预览 -->
    <div :class="bem('preview')">
      <img v-if="previewImageData" :class="bem('preview-image')" :src="previewImageData" alt="img" />
      <div v-else :class="bem('preview-image', 'placeholder')">
        <div :class="bem('preview-image-icon')">
          <div v-html="imagePlaceholder"></div>
          <input ref="file" :class="bem('file')" type="file" name="file" id="file" @change="handleFileChange" />
        </div>
      </div>
    </div>
    <!-- 参数编辑 -->
    <div :class="bem('property')">
      <div :class="bem('row')">
        <span :class="bem('row-label')">设备M</span>
        <input :class="bem('row-value')" type="string" v-model.trim="exif.M" placeholder="例如：NIKON Z 5" />
      </div>
      <div :class="bem('row')">
        <span :class="bem('row-label')">光圈F</span>
        <input :class="bem('row-value')" type="number" v-model.trim="exif.F" placeholder="例如：1.8" />
      </div>
      <div :class="bem('row')">
        <span :class="bem('row-label')">快门S</span>
        <input :class="bem('row-value')" type="text" v-model.trim="exif.S" placeholder="例如：1/200" />
      </div>
      <div :class="bem('row')">
        <span :class="bem('row-label')">感光度ISO</span>
        <input :class="bem('row-value')" type="number" v-model.trim="exif.ISO" placeholder="例如：100" />
      </div>
      <div :class="bem('row')">
        <span :class="bem('row-label')">焦距L</span>
        <input :class="bem('row-value')" type="number" v-model.trim="exif.L" placeholder="例如：35" />
      </div>
      <div :class="bem('row')">
        <span :class="bem('row-label')">镜头LEN</span>
        <input :class="bem('row-value')" type="string" v-model.trim="exif.LEN" placeholder="例如：NIKKOR Z 24-70mm f/4 S" />
      </div>
      <div :class="bem('row')">
        <span :class="bem('row-label')">拍摄时间T</span>
        <input :class="bem('row-value')" type="text" v-model.trim="exif.T" placeholder="例如：2022:11:14 10:00:00" />
      </div>
      <div :class="bem('actions')">
        <button :class="bem('actions-button', 'clear')" @click="handleClearClick">清空</button>
        <button :class="bem('actions-button', 'reset')" @click="handleResetClick">重置</button>
        <button :class="bem('actions-button', 'copy')" @click="handleCopyClick">复制</button>
        <button :class="bem('actions-button', 'paste')" @click="handlePasteClick">粘贴</button>
        <button v-if="previewImageData" :class="bem('actions-button', ['save', 'primary'])" @click="handleSaveClick">保存</button>
      </div>
    </div>
  </div>
</template>

<script>
import piexifjs, { piexif } from 'piexifjs'
import { createBEM } from '../utils/className'

const imagePlaceholder = '<svg t="1668863586543" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2945" width="128" height="128"><path d="M856.32 428.064c-94.816 0-144.928 90.656-185.184 163.52-25.824 46.688-52.512 94.944-78.72 97.568-28.544-5.664-48.096-23.2-70.656-43.36-31.744-28.448-67.488-60.288-130.464-57.952-76.8 3.328-146.24 57.696-206.4 161.696a32 32 0 0 0 55.392 32.064c48.48-83.84 100.224-127.488 153.728-129.824 36.928-1.44 56.96 16.576 84.992 41.664 26.88 24.096 57.344 51.36 105.888 59.392a31.584 31.584 0 0 0 5.216 0.448c64.704 0 101.44-66.464 136.96-130.72 28.352-51.328 57.504-104 97.184-123.072v369.984H128V231.68h488.16a32 32 0 1 0 0-64H96a32 32 0 0 0-32 32v701.824a32 32 0 0 0 32 32h760.32a32 32 0 0 0 32-32V460.064a32 32 0 0 0-32-32z" p-id="2946" fill="#8a8a8a"></path><path d="M180.96 424.32c0 57.952 47.168 105.12 105.12 105.12s105.12-47.168 105.12-105.12-47.168-105.088-105.12-105.088-105.12 47.136-105.12 105.088z m146.24 0a41.152 41.152 0 0 1-82.24 0 41.152 41.152 0 0 1 82.24 0zM960 174.656h-61.376V113.28a32 32 0 1 0-64 0v61.344H752.64a32 32 0 1 0 0 64h81.984v81.984a32 32 0 1 0 64 0V238.656H960a32 32 0 1 0 0-64z" p-id="2947" fill="#8a8a8a"></path></svg>'

const bem = createBEM('exif-edit')

const getExifData = (imgData) => {
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

// eslint-disable-next-line no-unused-vars
const getImageData = (file) => {
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

// eslint-disable-next-line no-unused-vars
const previewImage = (imgData, el = document.body) => {
  return new Promise((resolve, reject) => {
    if (!imgData) {
      reject(new Error('imgData is required'))
      return
    }
    const img = document.createElement('img')
    img.src = imgData
    img.onload = () => {
      resolve(true)
    }
    img.onerror = (error) => {
      reject(error)
    }
    img.style = 'width: 300px; height: auto; margin-top: 20px; margin-left: 50px; margin-right: 50px;'
    el.appendChild(img)
  })
}

const removeNull = (obj) => {
  Object.keys(obj).forEach(key => {
    if (obj[key] === null || obj[key] === undefined || obj[key] === '') {
      delete obj[key]
    }
  })
}

const cloneDeep = (data) => {
  return JSON.parse(JSON.stringify(data))
}

const defaultExifVersion = '2.3.1'

const defaultExif = {
  version: defaultExifVersion,
  M: null,
  F: null,
  S: null,
  ISO: null,
  L: null,
  T: null,
  LEN: null
}

export default {
  name: 'ExifEdit',
  props: {
    // jpg 图片的 base64 数据
    b64: {
      type: String
    }
    // // 设备
    // M: {
    //   type: String
    // },
    // // 光圈
    // F: {
    //   type: String
    // },
    // // 快门
    // S: {
    //   type: Number
    // },
    // // 感光度
    // ISO: {
    //   type: Number
    // },
    // // 焦距
    // L: {
    //   type: Number
    // },
    // // 时间
    // T: {
    //   type: String
    // },
    // // 镜头
    // LEN: {
    //   type: String
    // }
  },
  data () {
    return {
      imgData: null,
      exif: cloneDeep(defaultExif),
      imagePlaceholder,
      fileReader: {
        loading: false
      }
    }
  },
  computed: {
    previewImageData () {
      return this.b64 || this.imgData || null
    }
  },
  watch: {
    // b64 (b64) {
    //   if (b64) {
    //     const exif = parseExifData(getExifData(b64))
    //     this.exif = exif
    //   }
    // }
    // exif: {
    //   deep: true,
    //   handler (exif) {
    //     this.insertExif(exif)
    //   }
    // },
    // M (M) {
    //   this.insertExif({ M })
    // },
    // F (F) {
    //   this.insertExif({ F })
    // },
    // S (S) {
    //   this.insertExif({ S })
    // },
    // ISO (ISO) {
    //   this.insertExif({ ISO })
    // },
    // L (L) {
    //   this.insertExif({ L })
    // },
    // T (T) {
    //   this.insertExif({ T })
    // },
    // LEN (LEN) {
    //   this.insertExif({ LEN })
    // }
  },
  mounted () {
    this.handleResetClick()
  },
  methods: {
    bem,
    toggleLoading (loading) {
      this.fileReader.loading = loading
    },
    insertExif ({ b64, M, F, S, ISO, L, T, LEN } = {}) {
      console.log(b64, M, F, S, ISO, L, T, LEN)
      const th = {
        [piexif.ImageIFD.Model]: M || this.exif.M
      }
      const _F = F || this.exif.F
      const _S = S || this.exif.S
      const _L = L || this.exif.L
      const exif = {
        [piexif.ExifIFD.ExifVersion]: this.exif.version,
        [piexif.ExifIFD.FNumber]: [Number(_F), 1],
        [piexif.ExifIFD.ExposureTime]: [1, Number(_S)],
        [piexif.ExifIFD.ISOSpeed]: ISO || this.exif.ISO,
        [piexif.ExifIFD.ISOSpeedRatings]: ISO || this.exif.ISO,
        [piexif.ExifIFD.FocalLength]: [Number(_L) * 10, 10],
        [piexif.ExifIFD.LensModel]: LEN || this.exif.LEN,
        [piexif.ExifIFD.DateTimeOriginal]: T || this.exif.T,
        [piexif.ExifIFD.DateTimeDigitized]: T || this.exif.T
      }
      removeNull(th)
      removeNull(exif)
      console.log(th, exif)
      const exifStr = piexifjs.dump({ '0th': th, Exif: exif })
      const nb64 = piexifjs.insert(exifStr, this.previewImageData)
      this.$emit('change', { exif: this.exif, b64: nb64 })
    },
    showNoExifToast (exif) {
      const _exif = cloneDeep(exif)
      removeNull(_exif)
      const noExif = !Object.keys(_exif).length
      if (noExif) {
        window.alert('当前图片未解析到 exif 数据')
      }
    },
    handleClearClick () {
      this.imgData = null
      this.exif = cloneDeep(defaultExif)
      this.$emit('update:b64', null)
    },
    handleResetClick () {
      if (!this.previewImageData) {
        this.exif = cloneDeep(defaultExif)
        return
      }
      const exifData = getExifData(this.previewImageData)
      console.log(exifData)
      const exif = parseExifData(exifData)
      console.log(exif)
      this.showNoExifToast(exif)
      exif.version = exif.version || defaultExifVersion
      this.exif = exif
    },
    handleCopyClick () {
      const exifStr = JSON.stringify(this.exif)
      navigator.clipboard.writeText(exifStr).then(() => {
        console.log('复制成功')
      }).catch((e) => {
        window.alert(`复制失败：${e.message}`)
      })
    },
    handlePasteClick () {
      navigator.clipboard.readText().then((exifStr) => {
        console.log(exifStr)
        const isObjectKeySame = (a, b) => {
          const _a = JSON.stringify(Object.keys(a).sort())
          const _b = JSON.stringify(Object.keys(b).sort())
          console.log(_a, _b)
          return _a === _b
        }
        let exif = null
        try {
          exif = JSON.parse(exifStr)
        } catch (e) {
          console.error(e)
          window.alert('剪贴板参数不是 Exif 数据格式，请粘贴复制功能导出的 JSON 数据')
          return
        }
        if (!exif) {
          console.error(new Error('no exif'))
          window.alert('剪贴板参数不是 Exif 数据格式，请粘贴复制功能导出的 JSON 数据')
          return
        }
        const targetExif = { ...defaultExif }
        if (!isObjectKeySame(exif, targetExif)) {
          console.error(new Error('exif is invalid'))
          window.alert('剪贴板参数不是 Exif 数据格式，请粘贴复制功能导出的 JSON 数据')
          return
        }
        this.exif = exif
        console.log('粘贴成功')
      }).catch((e) => {
        window.alert(`粘贴失败：${e.message}`)
      })
    },
    handleSaveClick () {
      try {
        this.insertExif()
      } catch (e) {
        console.error(e)
        window.alert(`保存失败：${e.message}`)
      }
    },
    handleFileChange (e) {
      const files = e.target.files || []
      const file = files[0]
      if (!file || this.fileReader.loading) { return }

      const clearFileValue = () => {
        if (this.$refs.file) {
          this.$refs.file.value = ''
        }
      }

      this.toggleLoading(true)
      getImageData(file).then((imgData) => {
        this.imgData = imgData
        const exifData = getExifData(this.imgData)
        console.log(exifData)
        const exif = parseExifData(exifData)
        console.log(exif)
        this.showNoExifToast(exif)
        exif.version = exif.version || defaultExifVersion
        this.exif = exif
      }).catch((e) => {
        console.error(e)
      }).finally(() => {
        this.toggleLoading(false)
        clearFileValue()
      })
    }
  }
}
</script>

<style>
.pe_exif-edit {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-content: center;
}
.pe_exif-edit__preview {
  flex: 1;
  padding: 0 20px;
  text-align: center;
  align-self: center;
}
.pe_exif-edit__preview-image {
  width: 100%;
  height: auto;
}
.pe_exif-edit__property {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.pe_exif-edit__row {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: 6px 0;
}
.pe_exif-edit__row-label {
  flex: 0 0 80px;
  text-align: left;
  font-size: 14px;
}
.pe_exif-edit__row-value {
  flex: 1;
  line-height: 1.4;
  font-size: 14px;
}
.pe_exif-edit__actions {
  /* margin-top: 16px; */
}
.pe_exif-edit__actions-button {
  cursor: pointer;
  padding: 6px 20px;
  margin-right: 8px;
  margin-top: 12px;
  border: none;
  transition: all 0.2s ease-in-out;
}
.pe_exif-edit__actions-button:hover {
  opacity: 0.8;
}
.pe_exif-edit__actions-button--reset {
}
.pe_exif-edit__actions-button--save {
}
.pe_exif-edit__actions-button--primary {
  background-color: #409eff;
  color: #fff;
}
.pe_exif-edit__preview-image-icon {
  position: relative;
  display: inline-block;
}
.pe_exif-edit__preview-image--placeholder {}
.pe_exif-edit__preview-image-icon .icon {
  width: 80px;
  height: auto;
  transition: width 0.2s ease-in-out;
}
.pe_exif-edit__preview-image-icon:hover .icon {
  width: 90px;
}
.pe_exif-edit__file {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  appearance: none;
  opacity: 0;
  cursor: pointer;
}
</style>
