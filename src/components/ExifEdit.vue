<template>
  <div :class="bem()">
    <!-- 图片预览 -->
    <div :class="bem('preview')">
      <img v-if="previewImageData" :class="bem('preview-image')" :src="previewImageUrl" alt="img" />
      <div v-else :class="bem('preview-image', 'placeholder')">
        <div :class="bem('preview-image-icon')">
          <div v-html="imagePlaceholder"></div>
          <input ref="file" :class="bem('file')" type="file" name="file" id="file" accept="image/jpeg, image/tiff" @change="handleFileChange" />
        </div>
      </div>
    </div>
    <!-- 参数编辑 -->
    <div :class="bem('property')">
      <div :class="bem('row')">
        <ExifLabel :exif="exif"></ExifLabel>
      </div>
      <div :class="bem('row')">
        <EIcon :name="exif.M || ''"></EIcon>
        <span :class="bem('row-label')">设备M</span>
        <input :class="bem('row-value')" type="string" v-model.trim="exif.M" placeholder="例如：NIKON Z 5" />
      </div>
      <div :class="bem('row')">
        <EIcon name="F"></EIcon>
        <span :class="bem('row-label')">光圈F</span>
        <input :class="bem('row-value')" type="number" v-model.trim="exif.F" placeholder="例如：1.8" />
      </div>
      <div :class="bem('row')">
        <EIcon name="S"></EIcon>
        <span :class="bem('row-label')">快门S</span>
        <input :class="bem('row-value')" type="text" v-model.trim="exif.S" placeholder="例如：200" />
      </div>
      <div :class="bem('row')">
        <EIcon name="ISO"></EIcon>
        <span :class="bem('row-label')">感光度ISO</span>
        <input :class="bem('row-value')" type="number" v-model.trim="exif.ISO" placeholder="例如：100" />
      </div>
      <div :class="bem('row')">
        <EIcon name="L"></EIcon>
        <span :class="bem('row-label')">焦距L</span>
        <input :class="bem('row-value')" type="number" v-model.trim="exif.L" placeholder="例如：35" />
      </div>
      <div :class="bem('row')">
        <EIcon name="LEN"></EIcon>
        <span :class="bem('row-label')">镜头LEN</span>
        <input :class="bem('row-value')" type="string" v-model.trim="exif.LEN" placeholder="例如：NIKKOR Z 24-70mm f/4 S" />
      </div>
      <div :class="bem('row')">
        <EIcon name="T"></EIcon>
        <span :class="bem('row-label')">拍摄时间T</span>
        <input :class="bem('row-value')" type="text" v-model.trim="exif.T" placeholder="例如：2022:11:14 10:00:00" />
      </div>
      <div :class="bem('actions')">
        <button :class="bem('actions-button', 'clear')" @click="handleClearClick">
          <EIcon :class="bem('actions-button-icon')" name="clear"></EIcon>
          <span :class="bem('actions-button-text')">清空</span>
        </button>
        <button :class="bem('actions-button', 'reset')" @click="handleResetClick">
          <EIcon :class="bem('actions-button-icon')" name="reset"></EIcon>
          <span :class="bem('actions-button-text')">重置</span>
        </button>
        <button :class="bem('actions-button', 'copy')" @click="handleCopyClick">
          <EIcon :class="bem('actions-button-icon')" name="copy"></EIcon>
          <span :class="bem('actions-button-text')">复制</span>
        </button>
        <button :class="bem('actions-button', 'paste')" @click="handlePasteClick">
          <EIcon :class="bem('actions-button-icon')" name="paste"></EIcon>
          <span :class="bem('actions-button-text')">粘贴</span>
        </button>
        <button v-if="previewImageData" :class="bem('actions-button', ['save', 'primary'])" @click="handleSaveClick">
          <EIcon :class="bem('actions-button-icon')" name="download"></EIcon>
          <span  :class="bem('actions-button-text')">保存</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import piexifjs, { piexif } from 'piexifjs'
import { createBEM } from '../utils/className'
import { isObjectKeySame, cloneDeep } from '../utils/common'
import { createObjectURL, revokeObjectURL } from '../utils/file'
import { captureException, captureMessage } from '../utils/sentry'
import * as Constant from '../config/const'
import EIcon from './EIcon.vue'
import ExifLabel from './ExifLabel.vue'

const imagePlaceholder = '<svg t="1668863586543" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2945" width="128" height="128"><path d="M856.32 428.064c-94.816 0-144.928 90.656-185.184 163.52-25.824 46.688-52.512 94.944-78.72 97.568-28.544-5.664-48.096-23.2-70.656-43.36-31.744-28.448-67.488-60.288-130.464-57.952-76.8 3.328-146.24 57.696-206.4 161.696a32 32 0 0 0 55.392 32.064c48.48-83.84 100.224-127.488 153.728-129.824 36.928-1.44 56.96 16.576 84.992 41.664 26.88 24.096 57.344 51.36 105.888 59.392a31.584 31.584 0 0 0 5.216 0.448c64.704 0 101.44-66.464 136.96-130.72 28.352-51.328 57.504-104 97.184-123.072v369.984H128V231.68h488.16a32 32 0 1 0 0-64H96a32 32 0 0 0-32 32v701.824a32 32 0 0 0 32 32h760.32a32 32 0 0 0 32-32V460.064a32 32 0 0 0-32-32z" p-id="2946" fill="#faf9f9"></path><path d="M180.96 424.32c0 57.952 47.168 105.12 105.12 105.12s105.12-47.168 105.12-105.12-47.168-105.088-105.12-105.088-105.12 47.136-105.12 105.088z m146.24 0a41.152 41.152 0 0 1-82.24 0 41.152 41.152 0 0 1 82.24 0zM960 174.656h-61.376V113.28a32 32 0 1 0-64 0v61.344H752.64a32 32 0 1 0 0 64h81.984v81.984a32 32 0 1 0 64 0V238.656H960a32 32 0 1 0 0-64z" p-id="2947" fill="#faf9f9"></path></svg>'

const bem = createBEM('exif-edit')

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
  console.log('parseExifData\nM, F, S, ISO, L, LEN, T\n', M, F, S, ISO, L, LEN, T)
  return {
    M: M || null,
    F: F && F[0] && F[1] ? F[0] / F[1] : null,
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

const defaultExifVersion = cloneDeep(Constant.DEFUALT_EXIF_VERSION)

const defaultExif = cloneDeep(Constant.DEFUALT_EXIF)

export default {
  name: 'ExifEdit',
  components: {
    EIcon,
    ExifLabel
  },
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
      previewImageUrl: null, // 用于预览的图片 URL
      exif: cloneDeep(defaultExif),
      file: null,
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
        // 光圈值包含小数时需要x100
        [piexif.ExifIFD.FNumber]: `${_F}`.includes('.') ? [_F * 100, 1 * 100] : [_F, 1],
        [piexif.ExifIFD.ExposureTime]: [1, Number(_S)],
        [piexif.ExifIFD.ISOSpeed]: Number(ISO || this.exif.ISO),
        [piexif.ExifIFD.ISOSpeedRatings]: Number(ISO || this.exif.ISO),
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
      const getFileName = (file) => {
        return file && file.name ? `${file.name.replace(/\.jp(e)?g/i, '')}_1.jpg` : `${Date.now()}.jpg`
      }
      this.$emit('change', { exif: this.exif, b64: nb64, fileName: getFileName(this.file) })
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
      this.previewImageUrl && revokeObjectURL(this.previewImageUrl)
      this.previewImageUrl = null
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
      if (!navigator.clipboard) {
        captureMessage('复制失败: navigator.clipboard is undefined')
        window.alert('当前系统不支持使用剪贴板')
        return
      }
      const exifStr = JSON.stringify(this.exif)
      navigator.clipboard.writeText(exifStr).then(() => {
        console.log('复制成功')
      }).catch((e) => {
        captureException(e)
        window.alert(`复制失败：${e.message}`)
      })
    },
    handlePasteClick () {
      if (!navigator.clipboard) {
        captureMessage('粘贴失败: navigator.clipboard is undefined')
        window.alert('当前系统不支持使用剪贴板')
        return
      }
      navigator.clipboard.readText().then((exifStr) => {
        console.log(exifStr)
        let exif = null
        try {
          exif = JSON.parse(exifStr)
        } catch (e) {
          console.error(e)
          captureException(e)
          window.alert('剪贴板参数不是 Exif 数据格式，请粘贴复制功能导出的 JSON 数据')
          return
        }
        if (!exif) {
          let err = new Error('no exif')
          console.error(err)
          captureException(err)
          window.alert('剪贴板参数不是 Exif 数据格式，请粘贴复制功能导出的 JSON 数据')
          return
        }
        const targetExif = { ...defaultExif }
        if (!isObjectKeySame(exif, targetExif)) {
          let err = new Error('exif is invalid')
          console.error(err)
          captureException(err)
          window.alert('剪贴板参数不是 Exif 数据格式，请粘贴复制功能导出的 JSON 数据')
          return
        }
        this.exif = exif
        console.log('粘贴成功')
      }).catch((e) => {
        captureException(e)
        window.alert(`粘贴失败：${e.message}`)
      })
    },
    handleSaveClick () {
      try {
        this.insertExif()
      } catch (e) {
        console.error(e)
        captureException(e)
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
        this.file = file
        this.previewImageUrl = createObjectURL(file)[0]
      }).catch((e) => {
        console.error(e)
        captureException(e)
        this.file = null
        this.imgData = null
        this.previewImageUrl && revokeObjectURL(this.previewImageUrl)
        this.previewImageUrl = null
        const message = e.message.includes('invalid file data') ? '不支持所选图片格式' : e.message
        window.alert(`解析图片 Exif 数据失败：${message}`)
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
  justify-content: stretch;
  align-content: center;
  background-color: #FBAB7E;
  background-image: linear-gradient(45deg, #FBAB7E 0%, #F7CE68 50%);
  border-radius: 12px;
  padding-left: 20px;
  padding-right: 20px;
}
.pe_exif-edit__preview {
  flex: 1;
  padding: 0 20px;
  text-align: center;
  align-self: center;
  align-items: center;
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
  padding-left: 20px;
  padding-right: 20px;
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
  line-height: 1;
}
.pe_exif-edit__row-value {
  flex: 1;
  line-height: 1.4;
  font-size: 14px;
  outline: none;
  border-radius: 6px;
  color: #333;
  padding: 0.26em 0.6em;
  border: 1px solid #fff;
}
.pe_exif-edit__row-value:focus {
  border-color: #07A3FF;
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
  border-radius: 20px;
  background-color: #fff;
  color: #333333;
  transition: all 0.2s ease-in-out;
  box-shadow: 1px 5px 10px #07a3ff36;
  font-size: 0;
}
.pe_exif-edit__actions-button:focus {
  outline: none;
}
.pe_exif-edit__actions-button-icon {
  font-size: 0;
  display: inline-block;
  vertical-align: middle;
}
.pe_exif-edit__actions-button-text {
  font-size: 12px;
  display: inline-block;
  vertical-align: middle;
}
.pe_exif-edit__actions-button:hover {
  /* opacity: 0.8; */
  box-shadow: 2px 5px 10px #07a3ff4f;
}
.pe_exif-edit__actions-button--reset {
}
.pe_exif-edit__actions-button--save {
  padding: 6px 30px;
}
.pe_exif-edit__actions-button--primary {
  background-color: #07A3FF;
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
  width: 100%;
  appearance: none;
  opacity: 0;
  cursor: pointer;
}
</style>
