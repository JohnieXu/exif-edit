<template>
  <section class="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm md:p-5">
    <div class="flex flex-col gap-6 lg:flex-row lg:items-stretch">
      <div class="flex-1 lg:max-w-[400px]">
        <div
          v-if="!file"
          class="relative flex min-h-[280px] items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50"
        >
          <div class="h-24 w-24 text-slate-400 [&_.icon]:h-full [&_.icon]:w-full [&_.icon_path]:fill-[#94a3b8]" v-html="imagePlaceholder"></div>
          <input
            ref="fileRef"
            type="file"
            accept="image/jpeg, image/tiff"
            class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            @change="handleFileChange"
          />
        </div>
        <div ref="containerRef" class="w-full [&_.konvajs-content]:mx-auto [&_.konvajs-content]:shadow-sm"></div>
      </div>

      <div class="flex min-w-0 flex-1 flex-col justify-between gap-6">
        <div class="space-y-8">
          <div class="space-y-3">
            <p class="text-left text-xs font-semibold text-slate-400">水印设置</p>
            <div class="flex items-center border-b border-slate-200 pb-3">
              <label class="w-16 text-left text-sm font-semibold text-slate-700">型号</label>
              <input
                class="min-w-0 flex-1 border-0 bg-transparent text-right text-sm font-medium text-slate-400 outline-none"
                type="text"
              />
            </div>
            <div class="flex items-center border-b border-slate-200 pb-3">
              <label class="w-16 text-left text-sm font-semibold text-slate-700">图标</label>
              <select
                class="min-w-0 flex-1 appearance-none border-0 bg-transparent pr-2 text-right text-sm font-medium text-slate-400 outline-none"
              >
                <option>a</option>
              </select>
              <img class="h-3 w-[7px]" :src="arrowRight" alt="arrow" />
            </div>
            <div class="flex items-center border-b border-slate-200 pb-3">
              <label class="w-16 text-left text-sm font-semibold text-slate-700">主题</label>
              <select
                class="min-w-0 flex-1 appearance-none border-0 bg-transparent pr-2 text-right text-sm font-medium text-slate-400 outline-none"
              >
                <option>浅色</option>
                <option>深色</option>
              </select>
              <img class="h-3 w-[7px]" :src="arrowRight" alt="arrow" />
            </div>
          </div>

          <div class="space-y-3">
            <p class="text-left text-xs font-semibold text-slate-400">导出设置</p>
            <div class="flex items-center border-b border-slate-200 pb-3">
              <label class="w-16 text-left text-sm font-semibold text-slate-700">质量</label>
              <input
                v-model.number="exportForm.quality"
                class="min-w-0 flex-1 accent-orange-400"
                type="range"
                @change="handleQualityChange"
              />
              <span class="ml-2 inline-block w-10 text-right text-sm text-slate-400">
                {{ (exportForm.quality / 100).toFixed(2) }}
              </span>
            </div>
            <div class="flex items-center border-b border-slate-200 pb-3">
              <label class="w-16 text-left text-sm font-semibold text-slate-700">文件名</label>
              <input
                v-model.trim="exportForm.fileName"
                class="min-w-0 flex-1 border-0 bg-transparent text-right text-sm font-medium text-slate-500 outline-none"
                type="text"
              />
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-3">
          <button
            class="rounded-full bg-sky-500 px-6 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-600"
            @click="handleSaveClick"
          >
            下载图片{{ fileSize ? `(${fileSize})` : '' }}
          </button>
          <button
            class="rounded-full bg-white px-6 py-2 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
            @click="handleClearClick"
          >
            清空
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import Konva from 'konva'
import piexifjs, { piexif } from 'piexifjs'
import { reactive, ref } from 'vue'
import arrowRight from '@/assets/imgs/arrow_right.png'
import { imagePlaceholder } from '@/components/imagePlaceholder'
import type { ExifData, ParsedExif } from '@/types/exif'
import { DEFAULT_EXIF_VERSION } from '@/config/const'
import { getImageData, getImageSize, getBase64ByteSize, byte2Mb, readFile2Buffer } from '@/utils/file'
import { modelToIconPath } from '@/utils/icon'
import { removeNull, cloneDeep } from '@/utils/common'
import { captureException } from '@/utils/sentry'

const previewWidth = 400
const canvasRatio = window.devicePixelRatio || 1

const fileRef = ref<HTMLInputElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)

const file = ref<File | null>(null)
const image = ref<HTMLImageElement | null>(null)
const exif = ref<ParsedExif | null>(null)
const fileSize = ref('')
const stage = ref<Konva.Stage | null>(null)

const imageSize = reactive({
  width: 0,
  height: 0
})

const sceneSize = reactive({
  width: 0,
  height: 0
})

const watermark = reactive({
  height: 300
})

const exportForm = reactive({
  quality: 90,
  fileName: ''
})

const imageSizeLimited = {
  wmin: 1500,
  hmin: 2000,
  hmax: 3500
}

const getExifData = (imgData: string): ExifData => {
  return piexifjs.load(imgData) as ExifData
}

const parseExifData = (exifData: ExifData | null): ParsedExif | null => {
  if (!exifData) return null
  const M = exifData['0th']?.[piexif.ImageIFD.Model]
  const F = exifData.Exif?.[piexif.ExifIFD.FNumber]
  const S = exifData.Exif?.[piexif.ExifIFD.ExposureTime]
  const ISO = exifData.Exif?.[piexif.ExifIFD.ISOSpeedRatings]
  const L = exifData.Exif?.[piexif.ExifIFD.FocalLength]
  const LEN = exifData.Exif?.[piexif.ExifIFD.LensModel]
  const T = exifData.Exif?.[piexif.ExifIFD.DateTimeOriginal]
  return {
    M: (M as string) || null,
    F: Array.isArray(F) && F[0] && F[1] ? Number(F[0]) / Number(F[1]) : null,
    S: Array.isArray(S) && S[0] && S[1] ? Number(S[1]) : null,
    ISO: (ISO as number) || null,
    L: Array.isArray(L) && L[0] && L[1] ? Number(L[0]) / Number(L[1]) : null,
    LEN: (LEN as string) || null,
    T: (T as string) || null,
    version: DEFAULT_EXIF_VERSION
  }
}

const insertExif = (b64: string, input: ParsedExif) => {
  const { M, F, S, ISO, L, T, LEN, version } = input
  const th: Record<number, unknown> = {
    [piexif.ImageIFD.Model]: M || undefined
  }
  const exifMap: Record<number, unknown> = {
    [piexif.ExifIFD.ExifVersion]: version || DEFAULT_EXIF_VERSION,
    [piexif.ExifIFD.FNumber]: `${F}`.includes('.') ? [Number(F) * 100, 100] : [Number(F), 1],
    [piexif.ExifIFD.ExposureTime]: [1, Number(S)],
    [piexif.ExifIFD.ISOSpeed]: Number(ISO),
    [piexif.ExifIFD.ISOSpeedRatings]: Number(ISO),
    [piexif.ExifIFD.FocalLength]: [Number(L) * 10, 10],
    [piexif.ExifIFD.LensModel]: LEN || undefined,
    [piexif.ExifIFD.DateTimeOriginal]: T || undefined,
    [piexif.ExifIFD.DateTimeDigitized]: T || undefined
  }
  removeNull(th)
  removeNull(exifMap)
  const exifStr = piexifjs.dump({ '0th': th, Exif: exifMap })
  return piexifjs.insert(exifStr, b64)
}

const imageSizeValid = (target: { width: number; height: number }) => {
  if (target.width < imageSizeLimited.wmin || target.height < imageSizeLimited.hmin) {
    return { valid: false, message: '图片尺寸太小，合成效果可能不佳' }
  }
  if (target.height >= imageSizeLimited.hmax) {
    return { valid: false, message: '图片尺寸太大，合成效果可能不佳' }
  }
  return { valid: true, message: null as string | null }
}

const getImageSizeFromSrc = (src: string) => {
  return new Promise<{ imageSize: { width: number; height: number }; image: HTMLImageElement }>((resolve, reject) => {
    const img = new Image()
    img.src = src
    img.onload = () => resolve({ imageSize: { width: img.width, height: img.height }, image: img })
    img.onerror = (error) => reject(error)
  })
}

const initScene = () => {
  if (!containerRef.value) return
  const content = containerRef.value.querySelector('.konvajs-content') as HTMLElement | null
  const canvas = containerRef.value.querySelector('canvas') as HTMLCanvasElement | null
  if (!content || !canvas) return
  content.style.width = `${sceneSize.width}px`
  content.style.height = `${sceneSize.height}px`
  canvas.style.width = `${sceneSize.width}px`
  canvas.style.height = `${sceneSize.height}px`
}

const drawImage = (layer: Konva.Layer) => {
  if (!image.value) return
  const node = new Konva.Image({
    image: image.value,
    x: 0,
    y: 0,
    width: imageSize.width / canvasRatio,
    height: imageSize.height / canvasRatio
  })
  layer.add(node)
}

const drawWatermarkBackground = (layer: Konva.Layer) => {
  const rect = new Konva.Rect({
    x: 0,
    y: imageSize.height / canvasRatio,
    width: imageSize.width / canvasRatio,
    height: watermark.height / canvasRatio,
    fill: '#fff',
    strokeWidth: 0
  })
  layer.add(rect)
}

const drawCameraData = (
  layer: Konva.Layer,
  { brand, model }: { brand?: string; model?: string } = {},
  { padding = 40 }: { padding?: number } = {}
) => {
  const text = new Konva.Text({
    x: 0,
    y: (imageSize.height + 36) / canvasRatio,
    text: model ? `${brand || ''} ${model}`.trim() : brand || '',
    fontSize: 28,
    fontFamily:
      '-apple-system,BlinkMacSystemFont,Helvetica Neue,Helvetica,Segoe UI,Arial,Roboto,PingFang SC,miui,Hiragino Sans GB,Microsoft Yahei,sans-serif',
    fontStyle: 'bold',
    fill: '#000',
    width: 500,
    padding,
    align: 'left'
  })
  layer.add(text)
}

const drawExifData = async (layer: Konva.Layer, data: ParsedExif, { padding = 40 }: { padding?: number } = {}) => {
  const config = {
    text1: { fontSize: 24 },
    text2: { fontSize: 19 },
    fontFamily:
      '-apple-system,BlinkMacSystemFont,Helvetica Neue,Helvetica,Segoe UI,Arial,Roboto,PingFang SC,miui,Hiragino Sans GB,Microsoft Yahei,sans-serif',
    textGap1: 14
  }

  const exifList = [data.L ? `${data.L}mm` : undefined, data.F ? `f/${data.F}` : undefined, data.S ? `1/${data.S}` : undefined, data.ISO ? `ISO${data.ISO}` : undefined].filter(Boolean)

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

  const transformT = (target?: string | null) => {
    if (!target) return target
    const [y, t] = target.split(' ')
    if (!y || !t) return target
    return `${y.split(':').join('.')} ${t}`
  }
  const t = transformT(data.T)
  const timeStr =
    t && dayjs(t).format('YYYY.MM.DD HH:mm:ss') !== 'Invalid Date'
      ? dayjs(t).format('YYYY.MM.DD HH:mm:ss')
      : dayjs().format('YYYY.MM.DD HH:mm:ss')

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

  const group = new Konva.Group({
    x: imageSize.width / canvasRatio - text1.width(),
    y: imageSize.height / canvasRatio,
    width: text1.width(),
    height: watermark.height
  })

  const logoWidth = config.text1.fontSize + config.text2.fontSize + config.textGap1
  const line1 = new Konva.Line({
    points: [padding / 2, padding, padding / 2, padding + logoWidth],
    stroke: '#c3c3c3',
    strokeWidth: 1
  })
  group.add(line1)

  const logoPath = modelToIconPath(data.M || undefined)
  const { image: logoImage } = await getImageSizeFromSrc(logoPath)
  const imageNode = new Konva.Image({
    image: logoImage,
    x: -logoWidth,
    y: padding,
    width: logoWidth,
    height: logoWidth
  })

  group.add(text1)
  if (data.T) {
    group.add(text2)
  }
  group.add(imageNode)
  layer.add(group)
}

const calcExportFileSize = () => {
  if (!stage.value) {
    fileSize.value = ''
    return
  }
  const dataURL = stage.value.toDataURL({
    mimeType: 'image/jpeg',
    pixelRatio: canvasRatio,
    quality: exportForm.quality / 100
  })
  const targetData = exif.value ? insertExif(dataURL, exif.value) : dataURL
  fileSize.value = byte2Mb(getBase64ByteSize(targetData), 2)
}

const initStage = async () => {
  if (!containerRef.value) return
  const currentExif = exif.value || {
    L: 50,
    F: 1.8,
    S: 200,
    ISO: 100,
    T: dayjs().format('YYYY.MM.DD HH:mm:ss'),
    M: 'XIAOMI 12S ULTRA',
    LEN: null,
    version: DEFAULT_EXIF_VERSION
  }

  stage.value?.destroy()
  const targetStage = new Konva.Stage({
    container: containerRef.value,
    width: imageSize.width / canvasRatio,
    height: (imageSize.height + watermark.height) / canvasRatio
  })
  const layer = new Konva.Layer()
  targetStage.add(layer)
  stage.value = targetStage

  drawImage(layer)
  drawWatermarkBackground(layer)
  drawCameraData(layer, { model: currentExif.M || 'XIAOMI 12S ULTRA' }, { padding: 40 })
  await drawExifData(layer, currentExif, { padding: 40 })
  calcExportFileSize()
}

const isInValidExif = (value: ParsedExif | null) => {
  if (!value) return true
  const copy = cloneDeep(value)
  removeNull(copy as Record<string, unknown>)
  return !Object.keys(copy).length
}

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const selected = target.files?.[0]
  if (!selected) return

  file.value = selected
  exportForm.fileName = selected.name || ''

  try {
    await readFile2Buffer(selected)
    const { imageSize: selectedImageSize, image: loadedImage } = await getImageSize(selected)
    const valid = imageSizeValid(selectedImageSize)
    if (!valid.valid && valid.message) {
      window.alert(valid.message)
    }

    imageSize.width = selectedImageSize.width
    imageSize.height = selectedImageSize.height
    image.value = loadedImage

    const width = previewWidth
    sceneSize.width = width
    sceneSize.height = (width / selectedImageSize.width) * (selectedImageSize.height + watermark.height)

    const imageData = await getImageData(selected)
    const exifData = getExifData(imageData)
    const parsed = parseExifData(exifData)
    exif.value = isInValidExif(parsed) ? null : parsed

    await initStage()
    initScene()
  } catch (error) {
    captureException(error)
    const message = error instanceof Error && error.message.includes('invalid file data') ? '不支持所选图片格式' : error instanceof Error ? error.message : '未知错误'
    window.alert(`解析图片 Exif 数据失败：${message}`)
  } finally {
    if (target) {
      target.value = ''
    }
  }
}

const handleQualityChange = () => {
  calcExportFileSize()
}

const handleSaveClick = () => {
  if (!stage.value) {
    window.alert('请先上传照片')
    return
  }
  const dataURL = stage.value.toDataURL({
    mimeType: 'image/jpeg',
    pixelRatio: canvasRatio,
    quality: exportForm.quality / 100
  })
  const targetData = exif.value ? insertExif(dataURL, exif.value) : dataURL
  const link = document.createElement('a')
  link.download = exportForm.fileName || 'image.jpg'
  link.href = targetData
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const handleClearClick = () => {
  stage.value?.destroy()
  stage.value = null
  file.value = null
  image.value = null
  exif.value = null
  imageSize.width = 0
  imageSize.height = 0
  sceneSize.width = 0
  sceneSize.height = 0
  exportForm.quality = 90
  exportForm.fileName = ''
  fileSize.value = ''
  if (fileRef.value) {
    fileRef.value.value = ''
  }
}
</script>
