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
 * 获取图片像素大小、图片数据
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

// 缩放比例
const canvasRatio = window.pixelRatio || 2

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
      this.drawExifData(layer1, {}, { padding: 40 })
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
        y: (this.imageSize.height + 60) / canvasRatio,
        text: model ? `${brand} ${model}` : brand,
        fontSize: 24,
        fontFamily: 'Calibri',
        fill: '#000',
        width: 500,
        padding,
        align: 'left'
      })
      layer.add(text)
    },
    drawExifData(layer, exif, { padding = 40 } = {}) {
      const text1 = new Konva.Text({
        x: 0,
        y: (this.imageSize.height + 60) / canvasRatio,
        text: '50mm f/1.8 1/200 ISO100',
        fontSize: 24,
        fontFamily: 'Calibri',
        fill: '#000',
        width: 500,
        padding,
        align: 'right'
      })
      const text2 = new Konva.Text({
        x: 0,
        y: (this.imageSize.height + 60 + 20 + 60) / canvasRatio,
        text: '2023.01.18 14:00:00',
        fontSize: 20,
        fontFamily: 'Calibri',
        fill: '#666',
        width: 500,
        padding,
        align: 'right'
      })
      const group = new Konva.Group({
        x: 0,
        y: 0,
        draggable: true,
      })
      group.add(text1)
      group.add(text2)
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

<style>
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
