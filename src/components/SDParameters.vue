<template>
  <FileDragger @file="handleDragDone">
    <div :class="bem()">
      <!-- 图片预览 -->
      <div :class="bem('preview')">
        <img v-if="previewImageData" :class="bem('preview-image')" :src="previewImageUrl" alt="img" />
        <div v-else :class="bem('preview-image', 'placeholder')">
          <div :class="bem('preview-image-icon')">
            <div v-html="imagePlaceholder"></div>
            <input
              ref="file"
              :class="bem('file')"
              type="file"
              name="file"
              id="file_sd-parameters"
              accept="image/png"
              @change="handleFileChange" />
          </div>
        </div>
      </div>
      <!-- 参数编辑 -->
      <div :class="bem('property')">
        <div :class="bem('result')">
          <p v-if="parameters">{{ parameters }}</p>
          <p v-else class="placeholder">点击左侧图标选择png格式图片，或者拖拽图片到此处，会自动解析图片中包含的Stable-Diffusion生成信息</p>
        </div>
        <div v-if="parameters" :class="bem('actions')">
          <button :class="bem('actions-button', 'clear')" @click="handleClearClick">
            <EIcon :class="bem('actions-button-icon')" name="clear"></EIcon>
            <span :class="bem('actions-button-text')">清空</span>
          </button>
          <button :class="bem('actions-button', 'copy')" @click="handleCopyClick">
            <EIcon :class="bem('actions-button-icon')" name="copy"></EIcon>
            <span :class="bem('actions-button-text')">复制</span>
          </button>
        </div>
      </div>
    </div>
  </FileDragger>
</template>

<script>
import PNGReader from '../pngjs'
import { createBEM } from '../utils/className'
import { createObjectURL, revokeObjectURL } from '../utils/file'
import { captureException, captureMessage } from '../utils/sentry'
import EIcon from './EIcon.vue'
import FileDragger from './FileDragger.vue'

const imagePlaceholder = '<svg t="1668863586543" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2945" width="128" height="128"><path d="M856.32 428.064c-94.816 0-144.928 90.656-185.184 163.52-25.824 46.688-52.512 94.944-78.72 97.568-28.544-5.664-48.096-23.2-70.656-43.36-31.744-28.448-67.488-60.288-130.464-57.952-76.8 3.328-146.24 57.696-206.4 161.696a32 32 0 0 0 55.392 32.064c48.48-83.84 100.224-127.488 153.728-129.824 36.928-1.44 56.96 16.576 84.992 41.664 26.88 24.096 57.344 51.36 105.888 59.392a31.584 31.584 0 0 0 5.216 0.448c64.704 0 101.44-66.464 136.96-130.72 28.352-51.328 57.504-104 97.184-123.072v369.984H128V231.68h488.16a32 32 0 1 0 0-64H96a32 32 0 0 0-32 32v701.824a32 32 0 0 0 32 32h760.32a32 32 0 0 0 32-32V460.064a32 32 0 0 0-32-32z" p-id="2946" fill="#faf9f9"></path><path d="M180.96 424.32c0 57.952 47.168 105.12 105.12 105.12s105.12-47.168 105.12-105.12-47.168-105.088-105.12-105.088-105.12 47.136-105.12 105.088z m146.24 0a41.152 41.152 0 0 1-82.24 0 41.152 41.152 0 0 1 82.24 0zM960 174.656h-61.376V113.28a32 32 0 1 0-64 0v61.344H752.64a32 32 0 1 0 0 64h81.984v81.984a32 32 0 1 0 64 0V238.656H960a32 32 0 1 0 0-64z" p-id="2947" fill="#faf9f9"></path></svg>'

const bem = createBEM('sd-parameters')

/**
 * 读取png图片的SD生成信息
 * @param {ArrayBuffer} buffer 图片buffer数据
 */
const getSDParameters = (buffer) => {
  const reader = new PNGReader(buffer)
  return new Promise((resolve, reject) => {
    reader.parse((err, png) => {
      if (err) {
        reject(err)
      } else {
        resolve({
          png,
          parameters: png.text.parameters
        })
      }
    })
  })
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
const getImageBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = (e) => {
      resolve(e.target.result)
    }
    fileReader.onerror = (error) => {
      reject(error)
    }
    fileReader.readAsArrayBuffer(file)
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

// eslint-disable-next-line no-unused-vars
const removeNull = (obj) => {
  Object.keys(obj).forEach(key => {
    if (obj[key] === null || obj[key] === undefined || obj[key] === '') {
      delete obj[key]
    }
  })
}

export default {
  name: 'SDParameters',
  components: {
    EIcon,
    FileDragger,
  },
  props: {
    // png 图片的 base64 数据 TODO: 支持外部传入 base64需要转为ArrayBuffer
    b64: {
      type: String
    }
  },
  data () {
    return {
      imgBuffer: null,
      previewImageUrl: null, // 用于预览的图片 URL
      imagePlaceholder,
      parameters: '', // SD生成信息
      fileReader: {
        loading: false
      }
    }
  },
  computed: {
    previewImageData () {
      return this.b64 || this.imgBuffer || null
    }
  },
  mounted () {
  },
  methods: {
    bem,
    toggleLoading (loading) {
      this.fileReader.loading = loading
    },
    showParseError (e) {
      let message = `解析SD生成信息失败：${e}`
      if (e.message.includes('bad signature')) {
        message = `请选择png格式图片，文件后缀是.png`
      }
      window.alert(message)
    },
    showNoParametersToast () {
      window.alert('当前图片未解析到SD生成信息')
    },
    /**
     * 
     * @param {File} file 拖拽的文件
     */
    handleDragDone (file) {
      console.log(file)
      const getExtension = (str) => {
        if (!str) {
          return
        }
        const arr = str.split('.')
        if (arr.length < 2) {
          return
        }
        return arr[arr.length - 1]
      }
      const extension = getExtension(file.name)
      if (!extension || extension !== 'png') {
        this.showParseError(new Error('bad signature'))
        return
      }
      this.processFile(file)
    },
    handleClearClick () {
      this.imgBuffer = null
      this.previewImageUrl && revokeObjectURL(this.previewImageUrl)
      this.previewImageUrl = null
      this.parameters = ''
      this.$emit('update:b64', null)
    },
    handleCopyClick () {
      if (!navigator.clipboard) {
        captureMessage('复制失败: navigator.clipboard is undefined')
        window.alert('当前系统不支持使用剪贴板')
        return
      }
      const str = this.parameters || ''
      navigator.clipboard.writeText(str).then(() => {
        console.log('复制成功')
      }).catch((e) => {
        captureException(e)
        window.alert(`复制失败：${e.message}`)
      })
    },
    handleFileChange (e) {
      const files = e.target.files || []
      const file = files[0]
      if (!file || this.fileReader.loading) { return }
      this.processFile(file)
    },
    processFile (file) {
      const clearFileValue = () => {
        if (this.$refs.file) {
          this.$refs.file.value = ''
        }
      }

      this.toggleLoading(true)
      return getImageBuffer(file).then(async (buffer) => {
        let parameters = null
        try {
          const parsed = await getSDParameters(buffer)
          console.log(parsed)
          parameters = parsed.parameters
          // parameters = await getSDParameters(buffer).parameters
        } catch (e) {
          console.error(e)
          this.showParseError(e)
          return
        }
        if (!parameters) {
          this.showNoParametersToast()
          return
        }
        this.imgBuffer = buffer
        this.file = file
        this.previewImageUrl = createObjectURL(file)[0]
        this.parameters = parameters
      }).catch((e) => {
        console.error(e)
        captureException(e)
        this.file = null
        this.imgBuffer = null
        this.previewImageUrl && revokeObjectURL(this.previewImageUrl)
        this.previewImageUrl = null
        const message = e.message.includes('invalid file data') ? '不支持所选图片格式' : e.message
        this.showParseError(new Error(message))
      }).finally(() => {
        this.toggleLoading(false)
        clearFileValue()
      })
    }
  }
}
</script>

<style>
.pe_sd-parameters {
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
.pe_sd-parameters__preview {
  flex: 1;
  padding: 20px 20px;
  text-align: center;
  align-self: center;
  align-items: center;
  font-size: 0;
}
.pe_sd-parameters__preview-image {
  width: 100%;
  height: auto;
}
.pe_sd-parameters__property {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 20px;
  padding-right: 20px;
}
.pe_sd-parameters__result {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 20px;
  padding-bottom: 20px;
  text-align: left;
  min-height: 50vh;
  p {
    margin: 0;
    padding: 0;
  }
}
.pe_sd-parameters__result .placeholder {
  color: rgb(248 250 252);
}
.pe_sd-parameters__row {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: 6px 0;
}
.pe_sd-parameters__row-label {
  flex: 0 0 80px;
  text-align: left;
  font-size: 14px;
  line-height: 1;
}
.pe_sd-parameters__row-value {
  flex: 1;
  line-height: 1.4;
  font-size: 14px;
  outline: none;
  border-radius: 6px;
  color: #333;
  padding: 0.26em 0.6em;
  border: 1px solid #fff;
}
.pe_sd-parameters__row-value:focus {
  border-color: #07A3FF;
}
.pe_sd-parameters__actions {
  margin-bottom: 20px;
}
.pe_sd-parameters__actions-button {
  cursor: pointer;
  padding: 6px 20px;
  margin-right: 8px;
  margin-top: 0px;
  border: none;
  border-radius: 20px;
  background-color: #fff;
  color: #333333;
  transition: all 0.2s ease-in-out;
  box-shadow: 1px 5px 10px #07a3ff36;
  font-size: 0;
}
.pe_sd-parameters__actions-button:focus {
  outline: none;
}
.pe_sd-parameters__actions-button-icon {
  font-size: 0;
  display: inline-block;
  vertical-align: middle;
}
.pe_sd-parameters__actions-button-text {
  font-size: 12px;
  display: inline-block;
  vertical-align: middle;
}
.pe_sd-parameters__actions-button:hover {
  /* opacity: 0.8; */
  box-shadow: 2px 5px 10px #07a3ff4f;
}
.pe_sd-parameters__actions-button--reset {
}
.pe_sd-parameters__actions-button--save {
  padding: 6px 30px;
}
.pe_sd-parameters__actions-button--primary {
  background-color: #07A3FF;
  color: #fff;
}
.pe_sd-parameters__preview-image-icon {
  position: relative;
  display: inline-block;
}
.pe_sd-parameters__preview-image--placeholder {}
.pe_sd-parameters__preview-image-icon .icon {
  width: 80px;
  height: auto;
  transition: width 0.2s ease-in-out;
}
.pe_sd-parameters__preview-image-icon:hover .icon {
  width: 90px;
}
.pe_sd-parameters__file {
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
