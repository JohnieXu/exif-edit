<template>
  <div :class="bem()">
    <!-- 预览区 -->
    <div :class="bem('left-container')" :style="{ flexBasis: previewWidth + 'px' }">
      <div v-if="!file" :class="bem('preview-image', 'placeholder')">
        <div :class="bem('preview-image-icon')">
          <div v-html="imagePlaceholder"></div>
          <input ref="file" :class="bem('file')" type="file" name="file" id="file" accept="image/jpeg, image/tiff" @change="handleFileChange" />
        </div>
      </div>
      <!-- <input v-if="!file" ref="file" :class="bem('file')" type="file" name="file" id="file" accept="image/jpeg, image/tiff" @change="handleFileChange" /> -->
      <div ref="container" id="container" :class="bem('preivew-container')"></div>
    </div>
    <!-- 参数区 -->
    <div :class="bem('save-container')">
      <div class="top">
        <div class="group">
          <p class="title">水印设置</p>
          <div class="field">
            <label>型号</label>
            <input class="value" />
          </div>
          <div class="field">
            <label>图标</label>
            <select class="value">
              <option>a</option>
            </select>
            <img class="icon" :src="require('@/assets/imgs/arrow_right.png')" />
          </div>
          <div class="field">
            <label>主题</label>
            <select class="value">
              <option>浅色</option>
              <option>深色</option>
            </select>
            <img class="icon" :src="require('@/assets/imgs/arrow_right.png')" />
          </div>
        </div>
        <div class="group group-2">
          <p class="title">导出设置</p>
          <div class="field">
            <label>质量</label>
            <input class="value value__range" type="range" v-model.number="exportForm.quality" @change="handleQualityChange" />
            <span style="margin-left: 6px; display: inline-block; width: 30px; text-align: right; font-size: 14px; color: rgba(189, 189, 189, 1);">{{ (exportForm.quality / 100).toFixed(2) }}</span>
          </div>
          <div class="field">
            <label>文件名</label>
            <input class="value" type="text" v-model.trim="exportForm.fileName" />
          </div>
          <br/>
        </div>
      </div>
      <div class="bottom">
        <div class="group group-3">
          <div class="actions">
            <button class="button button__save" @click="handleSaveClick">下载图片{{ fileSize ? `(${fileSize})` : ''}}</button>
            <button class="button button__clear" @click="handleClearClick">清空</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import piexifjs, { piexif } from 'piexifjs'
import Konva from 'konva'
import dayjs from 'dayjs'
import * as Constant from '@/config/const'
import { createBEM } from '@/utils/className'
import { captureException, captureMessage } from '@/utils/sentry'
import { modelToIconPath } from '@/utils/icon'
import { onDevelop, removeNull, cloneDeep } from '@/utils/common'
import { getImageSize, readFile2Buffer, getImageData, getBase64ByteSize, byte2Mb } from '@/utils/file'
import { imagePlaceholder } from '@/components/data'

/**
 * 画布尺寸设计思路：
 * 1.获取选择的图片像素大小，在 y 轴（高度方向）加上水印高度
 * 2.将上面得到的像素大小除以缩放比例 canvasRatio 后作文画布大小（目的：防止图片像素太大将画布撑得太大）
 * 3.导出图片时在传入 canvasRatio 参数，放大为原图像素大小（目的：保证导出图片像素与原图符合）
 * 
 * 绘图像素与场景现实像素缩放思路：
 * 1.绘图像素以选择的图片真实像素绘制
 * 2.使用 css 样式讲场景中的 div 和 canvas 元素的 style 的宽高按照缩放进行展示
 * 3.场景展示像素约定：竖版图固定宽度 400px、横版图固定高度 200px
 */

const bem = createBEM('wartermark_edit')

const defaultExifVersion = cloneDeep(Constant.DEFUALT_EXIF_VERSION)

const previewWidth = 400 // 左侧预览图宽度版图固定宽度 400px、横版图固定高度 200px

/**
 * 从图片链接或 dataURI 获取图片像素大小、图片数据
 * @param {String} src 图片链接或 dataURI 字符串
 */
const getImageSizeFromSrc = (src) => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.src = src
    image.onload = () => {
      resolve({
        imageSize: {
          width: image.width,
          height: image.height,
        },
        image
      })
    }
    image.onerror = (e) => {
      reject(e)
    }
  })
}

// 缩放比例
const canvasRatio = window.devicePixelRatio || 1

// 图片像素大小边界情况
const imageSizeLimited = {
  wmin: 1500,
  hmin: 2000,
  hmax: 3500
}

/**
 * 校验图片像素大小
 * @param {Object} imageSize 图片尺寸
 * @param {Number} imageSize.width 宽度
 * @param {Number} imageSize.height 高度
 * @return {Object} { valid: Boolean, message: String }
 */
const imageSizeValid = (imageSize) => {
  if (imageSize.width < imageSizeLimited.wmin || imageSize.height < imageSizeLimited.hmin) {
    return {
      valid: false,
      message: '图片尺寸太小，合成效果可能不佳'
    }
  }
  if (imageSize.height >= imageSizeLimited.hmax) {
    return {
      valid: false,
      message: '图片尺寸太大，合成效果可能不佳'
    }
  }
  return {
    valid: true,
    message: null
  }
}

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

/**
 * 向 base64 数据中插入 exif 数据
 * @param {String} b64 base64 数据
 * @param {Object} exif exif 数据
 * @param {String} exif.M M
 * @param {Number} exif.F F
 * @param {String} exif.S S
 * @param {String} exif.ISO ISO
 * @param {String} exif.L L
 * @param {String} exif.LEN LEN
 * @param {String} exif.version version
 */
const insertExif = (b64, { M, F, S, ISO, L, T, LEN, version } = {}) => {
  // console.log(b64, M, F, S, ISO, L, T, LEN)
  const th = {
    [piexif.ImageIFD.Model]: M
  }
  const exif = {
    [piexif.ExifIFD.ExifVersion]: version || defaultExifVersion,
    // 光圈值包含小数时需要x100
    [piexif.ExifIFD.FNumber]: `${F}`.includes('.') ? [F * 100, 1 * 100] : [F, 1],
    [piexif.ExifIFD.ExposureTime]: [1, Number(S)],
    [piexif.ExifIFD.ISOSpeed]: Number(ISO),
    [piexif.ExifIFD.ISOSpeedRatings]: Number(ISO),
    [piexif.ExifIFD.FocalLength]: [Number(L) * 10, 10],
    [piexif.ExifIFD.LensModel]: LEN,
    [piexif.ExifIFD.DateTimeOriginal]: T,
    [piexif.ExifIFD.DateTimeDigitized]: T,
  }
  removeNull(th)
  removeNull(exif)
  // console.log(th, exif)
  const exifStr = piexifjs.dump({ '0th': th, Exif: exif })
  const nb64 = piexifjs.insert(exifStr, b64)
  return nb64
}

export default {
  name: "WatermarkEdit",
  data() {
    return {
      imagePlaceholder,
      previewWidth,
      file: null,
      image: null,
      exif: null,
      // 选择的图片像素大小
      imageSize: {
        width: 0,
        height: 0
      },
      // 界面场景像素大小
      sceneSize: {
        width: 0,
        height: 0
      },
      // 水印相关配置
      watermark: {
        height: 300
      },
      // konva 的 stage
      stage: null,
      // 导出图片的表单数据
      exportForm: {
        quality: 90,
        fileName: '',
      },
      // 导出的文件大小
      fileSize: '',
    }
  },
  methods: {
    bem,
    handleFileChange(e) {
      const files = e.target.files || []
      const file = files[0]
      if (!file) { return }
      this.file = file
      this.exportForm.fileName = file.name || ''
      readFile2Buffer(this.file).then((ab) => {
        const ab8 = new Uint8Array(ab)
        console.log(ab, ab8)
      }).catch((e) => {
        console.error(e)
      })
      // console.log(this.file, files)
      getImageSize(this.file).then(({ imageSize, image }) => {

        // 校验图片尺寸大小（仅做提示不阻断后续合成）
        const { valid, message } = imageSizeValid(imageSize)
        if (!valid) {
          alert(message)
        }
        
        this.imageSize = imageSize
        this.image = image
        
        const width = previewWidth;
        this.sceneSize = {
          width,
          height: width / imageSize.width * (imageSize.height + this.watermark.height)
        }
      }).then(() => {
        return getImageData(file).then((imgData) => {
          const exifData = getExifData(imgData)
          console.log(exifData)
          const exif = parseExifData(exifData)
          console.log(exif)
          // exif.version = exif.version || defaultExifVersion
          if (this.isInValidExif(exif) ) {
            this.exif = null
          } else {
            this.exif = exif
          }
        }).catch((e) => {
          console.error(e)
          captureException(e)
          // this.file = null
          // this.imgData = null
          const message = e.message.includes('invalid file data') ? '不支持所选图片格式' : e.message
          window.alert(`解析图片 Exif 数据失败：${message}`)
        }).finally(() => {
          // this.toggleLoading(false)
          // clearFileValue()
        })
      }).then(() => {
        this.initStage()
        this.initScene()
      })
    },
    initStage() {
      const exif = this.exif || {
        L: 50,
        F: 1.8,
        S: 200,
        ISO: 100,
        T: dayjs().format('YYYY.MM.DD HH:mm:ss')
      }
      const stage = new Konva.Stage({
        container: this.$refs.container,
        width: this.imageSize.width / canvasRatio,
        height: (this.imageSize.height + this.watermark.height) / canvasRatio
      })
      const layer1 = new Konva.Layer()
      // console.log(layer1.getCanvas().getPixelRatio(), layer1.getCanvas().setPixelRatio(4))
      // console.log(layer1.getCanvas().pixelRatio())
      stage.add(layer1)
      this.stage = stage

      this.drawImage(layer1)
      this.drawWatermarkBackground(layer1)
      this.drawCameraData(layer1, { brand: '', model: (this.exif || {}).M || 'XIAOMI 12S ULTRA' }, { padding: 40 })
      this.drawExifData(layer1, exif || {}, { padding: 40 })
      this.calcExportFileSize()
    },
    initScene() {
      const sceneSize = this.sceneSize
      const content = document.querySelector('#container .konvajs-content')
      const canvas = document.querySelector('#container canvas')
      if (content && canvas) {
        content.style.width = `${sceneSize.width}px`
        content.style.height = `${sceneSize.height}px`
        canvas.style.width = `${sceneSize.width}px`
        canvas.style.height = `${sceneSize.height}px`
      }
    },
    drawImage(layer) {
      const image = new Konva.Image({
        image: this.image,
        x: 0,
        y: 0,
        width: this.imageSize.width / canvasRatio,
        height: this.imageSize.height / canvasRatio,
      })
      layer.add(image)
    },
    drawWatermarkBackground(layer) {
      const rect = new Konva.Rect({
        x: 0,
        y: this.imageSize.height / canvasRatio,
        width: this.imageSize.width / canvasRatio,
        height: this.watermark.height / canvasRatio,
        fill: '#fff',
        strokeWidth: 0
      })
      layer.add(rect)
    },
    drawCameraData(layer, { brand, model } = {}, { padding = 40 } = {}) {
      const text = new Konva.Text({
        // x: padding / canvasRatio,
        x: 0,
        y: (this.imageSize.height + 36) / canvasRatio,
        text: model ? `${brand} ${model}` : brand,
        fontSize: 28,
        fontFamily: '-apple-system,BlinkMacSystemFont,Helvetica Neue,Helvetica,Segoe UI,Arial,Roboto,PingFang SC,miui,Hiragino Sans GB,Microsoft Yahei,sans-serif',
        fontStyle: 'bold',
        fill: '#000',
        width: 500,
        padding,
        align: 'left'
      })
      layer.add(text)
    },
    async drawExifData(layer, exif, { padding = 40 } = {}) {
      const config = {
        text1: {
          fontSize: 24,
        },
        text2: {
          fontSize: 19,
        },
        fontFamily: '-apple-system,BlinkMacSystemFont,Helvetica Neue,Helvetica,Segoe UI,Arial,Roboto,PingFang SC,miui,Hiragino Sans GB,Microsoft Yahei,sans-serif',
        textGap1: 14
      }
      const exifList = [
        exif.L ? exif.L + 'mm' : undefined,
        exif.F ? 'f/' + exif.F : undefined,
        exif.S ? '1/' + exif.S : undefined,
        exif.ISO ? 'ISO' + exif.ISO : undefined
      ]
      const text1 = new Konva.Text({
        x: 0,
        y: 0,
        text: exifList.join(' '),
        fontSize: config.text1.fontSize,
        fontFamily: config.fontFamily,
        fontStyle: 'bold',
        fill: '#000',
        padding,
        align: 'left'
      })

      /**
       * 转换为正确的日期格式
       * 2023:01:27 12:00:00 转换为 2023.01.27 12:00:00
       */
      function tranformT (T) {
        if (!T) { return T }
        const y = T.split(' ')[0]
        const t = T.split(' ')[1]
        const _y = y.replaceAll(':', '.')
        return [_y, t].join(' ')
      }

      const T = tranformT(exif.T)
      const timeStr = T && dayjs(T).format('YYYY.MM.DD HH:mm:ss') !== 'Invalid Date' ? dayjs(T).format('YYYY.MM.DD HH:mm:ss') : dayjs().format('YYYY.MM.DD HH:mm:ss')
      const text2 = new Konva.Text({
        x: padding,
        y: padding + config.text1.fontSize + config.textGap1,
        text: timeStr,
        fontSize: config.text2.fontSize,
        fontFamily: config.fontFamily,
        fill: '#666',
        width: text1.width(),
        padding: 0,
        align: 'left'
      })
      const rect1 = new Konva.Rect({
        x: 0,
        y: 0,
        width: text1.width(),
        height: this.watermark.height,
        fill: "#ff000060"
      })
      const group = new Konva.Group({
        x: this.imageSize.width / canvasRatio - text1.width(),
        y: this.imageSize.height / canvasRatio,
        width: text1.width(),
        height: this.watermark.height,
        // draggable: true,
      })
      group.width(text1.width())

      // 绘制竖线
      const logoWidth = config.text1.fontSize + config.text2.fontSize + config.textGap1
      const line1 = new Konva.Line({
        points: [padding / 2, padding, padding / 2, padding + logoWidth],
        stroke: '#c3c3c3',
        strokeWidth: 1,
      })

      group.add(line1)

      // 绘制品牌 logo
      const logoPath = modelToIconPath(exif.M)
      const { image } = await getImageSizeFromSrc(logoPath)
      const image1 = new Konva.Image({
        image,
        x: -(logoWidth + 0),
        y: padding,
        width: logoWidth,
        height: logoWidth,
      })
      
      // 调试用
      // onDevelop(() => {
      //   group.add(rect1)
      // })

      group.add(text1)
      exif.T && group.add(text2)
      group.add(image1)

      layer.add(group)
    },
    isInValidExif (exif) {
      const _exif = cloneDeep(exif)
      removeNull(_exif)
      const noExif = !Object.keys(_exif).length
      return noExif
    },
    calcExportFileSize () {
      if (!this.stage) {
        this.fileSize = '';
        return
      }
      const dataURL = this.stage.toDataURL({
        mimeType: 'image/jpeg',
        pixelRatio: canvasRatio,
        quality: this.exportForm.quality / 100
      });
      const nDataURL = this.exif ? insertExif(dataURL, this.exif) : dataURL;
      const fileSize = byte2Mb(getBase64ByteSize(nDataURL), 2);
      this.fileSize = fileSize;
    },
    handleQualityChange() {
      this.calcExportFileSize();
    },
    handleSaveClick() {
      function downloadURI(uri, name) {
        let link = document.createElement('a');
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        link = null;
      }
      if (!this.stage) {
        window.alert('请先上传照片');
        return;
      }
      const dataURL = this.stage.toDataURL({
        mimeType: 'image/jpeg',
        pixelRatio: canvasRatio,
        quality: this.exportForm.quality / 100
      })
      const nDataURL = this.exif ? insertExif(dataURL, this.exif) : dataURL;
      // const fileSize = byte2Mb(getBase64ByteSize(nDataURL), 3);
      // console.log('fileSize = ', fileSize);
      downloadURI(nDataURL,  this.exportForm.fileName || 'image.jpg');
    },
    handleClearClick() {
      this.stage.destroy();
      this.stage = null;
      this.file = null;
      this.image = null;
      this.imageSize = {
        width: 0,
        height: 0
      };
      this.exportForm = {
        quality: 90,
        fileName: '',
      };
      this.calcExportFileSize();
    }
  }
}
</script>

<style>
#container .konvajs-content {
  /* box-shadow: 6px 5px 5px rgb(200 200 200 / 30%); */
  box-shadow: 0 0 10px rgb(200 200 200 / 30%);
}
.pe_wartermark_edit {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  /* align-items: center; */
  /* align-items: flex-end; */
  align-items: stretch;
  border: 1px dashed rgba(200,200,200,0.2);
  padding: 10px;
  border-radius: 8px;
}
.pe_wartermark_edit__preview-image-icon {
  position: relative;
  display: inline-block;
}
.pe_wartermark_edit__preview-image-icon .icon {
  width: 132px;
  height: auto;
  transition: width 0.2s ease-in-out;
}
.pe_wartermark_edit__preview-image-icon:hover .icon {
  width: 140px;
}
.pe_wartermark_edit__preview-image-icon .pe_wartermark_edit__file {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  width: 100%;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  opacity: 0;
  cursor: pointer;
}
.pe_wartermark_edit__left-container {
  flex: 2;
  align-self: center;
}
.pe_wartermark_edit__save-container {
  flex: 3;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
}
.pe_wartermark_edit__save-container .group {
  text-align: left;
}
.pe_wartermark_edit__save-container .group-2 {
  margin-top: 47px;
}
.pe_wartermark_edit__save-container .group .title {
  color: #BDBDBD;
  font-family: Inter;
  font-weight: medium;
  font-size: 12px;
  line-height: normal;
  letter-spacing: 0px;
  text-align: left;
}
.pe_wartermark_edit__save-container .group .field {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 0.5px solid #E0E0E0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pe_wartermark_edit__save-container .group .field .value {
  color: rgba(189, 189, 189, 1);
  font-weight: 500;
  font-size: 14px;
  border: none;
  flex: 1;
  text-align: right;
  appearance: none;
}
.pe_wartermark_edit__save-container .group .field .value__range {
  margin: 0;
  padding: 0;
  cursor: pointer;
  appearance: none;
  height: 3px;
  border-radius: 10px;
  background: rgba(251, 171, 126, 1);
}
.pe_wartermark_edit__save-container .group .field .value__range::-webkit-slider-thumb {
  appearance: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(251, 171, 126, 1);
}
.pe_wartermark_edit__save-container .group .field .value:focus {
  outline: none;
  border: none;
}
.pe_wartermark_edit__save-container .group .field .value:focus-visible {
  outline: none;
  border: none;
}
.pe_wartermark_edit__save-container .group .field .icon {
  width: 7px;
  height: 12px;
  margin-left: 6px;
}
.pe_wartermark_edit__save-container .group .field label {
  color: #2C3E50;
  font-family: Inter;
  font-weight: medium;
  font-size: 14px;
  line-height: normal;
  letter-spacing: 0px;
  text-align: left;
  display: inline-block;
  width: 50px;
}
.pe_wartermark_edit__save-container .group .actions .button {
  display: inline-block;
  padding: 10px 30px;
  margin-right: 8px;
  margin-bottom: 8px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 1);
  box-shadow: 1px 5px 10px rgba(7, 163, 255, 0.25);
  color: rgba(44, 62, 80, 1);
  font-weight: 500;
  font-size: 12px;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease-in-out;
}
.pe_wartermark_edit__save-container .group .actions .button:hover {
  box-shadow: 2px 5px 10px rgb(7 163 255 / 31%);
}
.pe_wartermark_edit__save {
  cursor: pointer;
  margin-right: 10px;
}
.pe_wartermark_edit__clear {
  cursor: pointer;
}
</style>

<style>
#container .konvajs-content {
  margin: 0 auto;
}
</style>
