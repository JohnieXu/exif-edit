<template>
  <div :class="bem()">
    <input v-if="!file" ref="file" :class="bem('file')" type="file" name="file" id="file" accept="image/jpeg, image/tiff" @change="handleFileChange" />
    <div ref="container" id="container"></div>
    <div :class="bem('save-container')">
      <button :class="bem('save')" @click="handleSaveClick">保存</button>
      <button :class="bem('clear')" @click="handleClearClick">清除</button>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import { createBEM } from '@/utils/className';
import { createObjectURL } from '@/utils/file';
import Konva from 'konva'

/**
 * 画布尺寸设计思路：
 * 1.获取选择的图片像素大小，在 y 轴（高度方向）加上水印高度
 * 2.将上面得到的像素大小除以缩放比例 canvasRatio 后作文画布大小（目的：防止图片像素太大将画布撑得太大）
 * 3.导出图片时在传入 canvasRatio 参数，放大为原图像素大小（目的：保证导出图片像素与原图符合）
 */

const bem = createBEM('wartermark_edit')

/**
 * 从 file 文件获取图片像素大小、图片数据
 * @param {File} file 文件对象
 */
const getImageSize = (file) => {
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

/**
 * 开发环境执行
 */
const onDevelop = (fn, self, ...args) => {
  if (process.env.NODE_ENV === 'development') {
    fn.call(self, ...args)
  }
}

// 缩放比例
const canvasRatio = window.devicePixelRatio || 2

export default {
  name: "WatermarkEdit",
  data() {
    return {
      file: null,
      image: null,
      // 选择的图片像素大小
      imageSize: {
        width: 0,
        height: 0
      },
      // 水印相关配置
      watermark: {
        height: 300
      },
      // konva 的 stage
      stage: null
    }
  },
  methods: {
    bem,
    handleFileChange(e) {
      const files = e.target.files || []
      if (!files[0]) { return }
      this.file = files[0]
      // console.log(this.file, files)
      getImageSize(this.file).then(({ imageSize, image }) => {
        this.imageSize = imageSize
        this.image = image
      }).then(this.initStage)
    },
    initStage() {
      const stage = new Konva.Stage({
        container: this.$refs.container,
        width: this.imageSize.width / canvasRatio,
        height: (this.imageSize.height + this.watermark.height) / canvasRatio
      })
      const layer1 = new Konva.Layer()
      stage.add(layer1)
      this.stage = stage

      this.drawImage(layer1)
      this.drawWatermarkBackground(layer1)
      this.drawCameraData(layer1, { brand: 'Nikon', model: 'Z5' }, { padding: 40 })
      this.drawExifData(layer1, {
        L: 50,
        F: 1.8,
        S: 200,
        ISO: 100,
        T: '2023.01.18 14:00:00'
      }, { padding: 40 })
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
        y: (this.imageSize.height + 40) / canvasRatio,
        text: model ? `${brand} ${model}` : brand,
        fontSize: 24,
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
          fontSize: 18,
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
      const text2 = new Konva.Text({
        x: padding,
        y: padding + config.text1.fontSize + config.textGap1,
        text: exif.T,
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
        stroke: '#d8d8d8',
        strokeWidth: 1,
      })

      group.add(line1)

      // 绘制品牌 logo
      const { image } = await getImageSizeFromSrc(require('@/assets/icons/leica.png'))
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
      const dataURL = this.stage.toDataURL({ pixelRatio: canvasRatio })
      downloadURI(dataURL, 'image.jpg')
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
    }
  }
}
</script>

<style scoped>
.pe_wartermark_edit__save-container {
  margin-top: 50px;
}
.pe_wartermark_edit__save {
  cursor: pointer;
  margin-right: 10px;
}
.pe_wartermark_edit__clear {
  cursor: pointer;
}
</style>
