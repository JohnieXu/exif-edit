<template>
  <div class="flex flex-col gap-5 rounded-2xl bg-gradient-to-r from-[#FBAB7E] via-[#F8BD72] to-[#F7CE68] p-5 md:flex-row md:p-6">
    <div class="relative flex flex-1 items-center justify-center py-2">
      <img v-if="previewImageData" class="w-full rounded-xl object-contain" :src="previewImageUrl || previewImageData" alt="img" />
      <div v-else class="inline-block">
        <div class="relative inline-flex flex-col items-center gap-2 transition-transform hover:scale-105">
          <div class="[&_.icon]:h-auto [&_.icon]:w-24" v-html="imagePlaceholder"></div>
          <span class="text-xs text-white/90">点击上传图片</span>
          <input
            ref="fileInputRef"
            class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            type="file"
            name="file"
            accept="image/jpeg, image/tiff"
            @change="handleFileChange"
          />
        </div>
      </div>
    </div>

    <div class="flex flex-1 flex-col justify-center gap-2 md:px-4">
      <ExifLabel :exif="exif"></ExifLabel>

      <div class="flex items-center gap-2">
        <EIcon :name="exif.M || ''"></EIcon>
        <span class="w-20 shrink-0 text-left text-sm text-slate-900">设备M</span>
        <input v-model.trim="exif.M" class="flex-1 rounded-md border border-white/90 px-3 py-1 text-sm text-slate-700 outline-none focus:border-[#07A3FF]" type="text" placeholder="例如：NIKON Z 5" />
      </div>
      <div class="flex items-center gap-2">
        <EIcon name="F"></EIcon>
        <span class="w-20 shrink-0 text-left text-sm text-slate-900">光圈F</span>
        <input v-model.trim="exif.F" class="flex-1 rounded-md border border-white/90 px-3 py-1 text-sm text-slate-700 outline-none focus:border-[#07A3FF]" type="number" placeholder="例如：1.8" />
      </div>
      <div class="flex items-center gap-2">
        <EIcon name="S"></EIcon>
        <span class="w-20 shrink-0 text-left text-sm text-slate-900">快门S</span>
        <input v-model.trim="exif.S" class="flex-1 rounded-md border border-white/90 px-3 py-1 text-sm text-slate-700 outline-none focus:border-[#07A3FF]" type="text" placeholder="例如：200" />
      </div>
      <div class="flex items-center gap-2">
        <EIcon name="ISO"></EIcon>
        <span class="w-20 shrink-0 text-left text-sm text-slate-900">感光度ISO</span>
        <input v-model.trim="exif.ISO" class="flex-1 rounded-md border border-white/90 px-3 py-1 text-sm text-slate-700 outline-none focus:border-[#07A3FF]" type="number" placeholder="例如：100" />
      </div>
      <div class="flex items-center gap-2">
        <EIcon name="L"></EIcon>
        <span class="w-20 shrink-0 text-left text-sm text-slate-900">焦距L</span>
        <input v-model.trim="exif.L" class="flex-1 rounded-md border border-white/90 px-3 py-1 text-sm text-slate-700 outline-none focus:border-[#07A3FF]" type="number" placeholder="例如：35" />
      </div>
      <div class="flex items-center gap-2">
        <EIcon name="LEN"></EIcon>
        <span class="w-20 shrink-0 text-left text-sm text-slate-900">镜头LEN</span>
        <input
          v-model.trim="exif.LEN"
          class="flex-1 rounded-md border border-white/90 px-3 py-1 text-sm text-slate-700 outline-none focus:border-[#07A3FF]"
          type="text"
          placeholder="例如：NIKKOR Z 24-70mm f/4 S"
        />
      </div>
      <div class="flex items-center gap-2">
        <EIcon name="T"></EIcon>
        <span class="w-20 shrink-0 text-left text-sm text-slate-900">拍摄时间T</span>
        <input v-model.trim="exif.T" class="flex-1 rounded-md border border-white/90 px-3 py-1 text-sm text-slate-700 outline-none focus:border-[#07A3FF]" type="text" placeholder="例如：2022:11:14 10:00:00" />
      </div>

      <div class="mt-2 flex flex-wrap gap-2">
        <button class="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-xs text-slate-700 shadow-[1px_5px_10px_rgba(7,163,255,0.25)] transition hover:shadow-[2px_5px_10px_rgba(7,163,255,0.31)]" @click="handleClearClick">
          <EIcon name="clear"></EIcon><span>清空</span>
        </button>
        <button class="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-xs text-slate-700 shadow-[1px_5px_10px_rgba(7,163,255,0.25)] transition hover:shadow-[2px_5px_10px_rgba(7,163,255,0.31)]" @click="handleResetClick">
          <EIcon name="reset"></EIcon><span>重置</span>
        </button>
        <button class="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-xs text-slate-700 shadow-[1px_5px_10px_rgba(7,163,255,0.25)] transition hover:shadow-[2px_5px_10px_rgba(7,163,255,0.31)]" @click="handleCopyClick">
          <EIcon name="copy"></EIcon><span>复制</span>
        </button>
        <button class="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-xs text-slate-700 shadow-[1px_5px_10px_rgba(7,163,255,0.25)] transition hover:shadow-[2px_5px_10px_rgba(7,163,255,0.31)]" @click="handlePasteClick">
          <EIcon name="paste"></EIcon><span>粘贴</span>
        </button>
        <button
          v-if="previewImageData"
          class="inline-flex items-center gap-1 rounded-full bg-[#07A3FF] px-6 py-2 text-xs text-white shadow-[1px_5px_10px_rgba(7,163,255,0.25)] transition hover:shadow-[2px_5px_10px_rgba(7,163,255,0.31)]"
          @click="handleSaveClick"
        >
          <EIcon name="download"></EIcon><span>保存</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import piexifjs from 'piexifjs'
import { computed, onMounted, ref } from 'vue'
import { DEFAULT_EXIF, DEFAULT_EXIF_VERSION } from '@/config/const'
import type { ExifForm } from '@/types/exif'
import { imagePlaceholder } from '@/components/imagePlaceholder'
import EIcon from '@/components/EIcon.vue'
import ExifLabel from '@/components/ExifLabel.vue'
import { cloneDeep, isObjectKeySame } from '@/utils/common'
import { createObjectURL, revokeObjectURL } from '@/utils/file'
import { captureException, captureMessage } from '@/utils/sentry'

const props = defineProps<{
  b64?: string
}>()

const emit = defineEmits<{
  (e: 'change', payload: { exif: ExifForm; b64: string; fileName: string }): void
  (e: 'update:b64', payload: string | null): void
}>()

const piexif = (piexifjs as any).piexif
const defaultExif = cloneDeep(DEFAULT_EXIF)
const defaultExifVersion = cloneDeep(DEFAULT_EXIF_VERSION)

const imgData = ref<string | null>(null)
const previewImageUrl = ref<string | null>(null)
const exif = ref<ExifForm>(cloneDeep(defaultExif))
const fileRef = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const loading = ref(false)

const previewImageData = computed(() => props.b64 || imgData.value || null)

const getExifData = (input: string) => piexifjs.load(input)

const parseExifData = (exifData: Record<string, any>) => {
  if (!exifData) return cloneDeep(defaultExif)
  const base0th = exifData['0th'] || {}
  const baseExif = exifData.Exif || {}
  const M = base0th[piexif.ImageIFD.Model]
  const F = baseExif[piexif.ExifIFD.FNumber]
  const S = baseExif[piexif.ExifIFD.ExposureTime]
  const ISO = baseExif[piexif.ExifIFD.ISOSpeedRatings]
  const L = baseExif[piexif.ExifIFD.FocalLength]
  const LEN = baseExif[piexif.ExifIFD.LensModel]
  const T = baseExif[piexif.ExifIFD.DateTimeOriginal]
  return {
    M: M || null,
    F: F && F[0] && F[1] ? F[0] / F[1] : null,
    S: S && S[0] && S[1] ? S[1] : null,
    ISO: ISO || null,
    L: L && L[0] && L[1] ? L[0] / L[1] : null,
    LEN: LEN || null,
    T: T || null,
    version: defaultExifVersion,
  } satisfies ExifForm
}

const getImageData = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = (e) => resolve((e.target?.result || '') as string)
    fileReader.onerror = (error) => reject(error)
    fileReader.readAsDataURL(file)
  })

const removeNull = (obj: Record<string, unknown>) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] === null || obj[key] === undefined || obj[key] === '') {
      delete obj[key]
    }
  })
}

const showNoExifToast = (value: ExifForm) => {
  const payload = cloneDeep(value) as Record<string, unknown>
  removeNull(payload)
  if (!Object.keys(payload).length) {
    window.alert('当前图片未解析到 exif 数据')
  }
}

const getFileName = (file: File | null) => (file?.name ? `${file.name.replace(/\.jp(e)?g/i, '')}_1.jpg` : `${Date.now()}.jpg`)

const insertExif = ({ b64, M, F, S, ISO, L, T, LEN }: Partial<ExifForm> & { b64?: string } = {}) => {
  const currentB64 = b64 || previewImageData.value
  if (!currentB64) {
    throw new Error('图片不存在')
  }
  const th: Record<number, string | null> = {
    [piexif.ImageIFD.Model]: M || exif.value.M,
  }
  const FValue = Number(F ?? exif.value.F)
  const SValue = Number(S ?? exif.value.S)
  const LValue = Number(L ?? exif.value.L)
  const ISOValue = Number(ISO ?? exif.value.ISO)
  const exifPayload: Record<number, any> = {
    [piexif.ExifIFD.ExifVersion]: exif.value.version,
    [piexif.ExifIFD.FNumber]: Number.isFinite(FValue) && `${FValue}`.includes('.') ? [FValue * 100, 100] : [FValue, 1],
    [piexif.ExifIFD.ExposureTime]: [1, SValue],
    [piexif.ExifIFD.ISOSpeed]: ISOValue,
    [piexif.ExifIFD.ISOSpeedRatings]: ISOValue,
    [piexif.ExifIFD.FocalLength]: [LValue * 10, 10],
    [piexif.ExifIFD.LensModel]: LEN || exif.value.LEN,
    [piexif.ExifIFD.DateTimeOriginal]: T || exif.value.T,
    [piexif.ExifIFD.DateTimeDigitized]: T || exif.value.T,
  }
  removeNull(th)
  removeNull(exifPayload)
  const exifStr = piexifjs.dump({ '0th': th, Exif: exifPayload })
  const nextB64 = piexifjs.insert(exifStr, currentB64)
  emit('change', { exif: exif.value, b64: nextB64, fileName: getFileName(fileRef.value) })
}

const handleClearClick = () => {
  imgData.value = null
  if (previewImageUrl.value) {
    revokeObjectURL(previewImageUrl.value)
    previewImageUrl.value = null
  }
  exif.value = cloneDeep(defaultExif)
  fileRef.value = null
  emit('update:b64', null)
}

const handleResetClick = () => {
  if (!previewImageData.value) {
    exif.value = cloneDeep(defaultExif)
    return
  }
  const parsed = parseExifData(getExifData(previewImageData.value))
  showNoExifToast(parsed)
  parsed.version = parsed.version || defaultExifVersion
  exif.value = parsed
}

const handleCopyClick = () => {
  if (!navigator.clipboard) {
    captureMessage('复制失败: navigator.clipboard is undefined')
    window.alert('当前系统不支持使用剪贴板')
    return
  }
  navigator.clipboard.writeText(JSON.stringify(exif.value)).catch((error: Error) => {
    captureException(error)
    window.alert(`复制失败：${error.message}`)
  })
}

const handlePasteClick = () => {
  if (!navigator.clipboard) {
    captureMessage('粘贴失败: navigator.clipboard is undefined')
    window.alert('当前系统不支持使用剪贴板')
    return
  }
  navigator.clipboard
    .readText()
    .then((exifStr) => {
      let payload: ExifForm | null = null
      try {
        payload = JSON.parse(exifStr) as ExifForm
      } catch (error) {
        captureException(error as Error)
        window.alert('剪贴板参数不是 Exif 数据格式，请粘贴复制功能导出的 JSON 数据')
        return
      }
      if (!payload || !isObjectKeySame(payload as Record<string, unknown>, defaultExif as Record<string, unknown>)) {
        captureException(new Error('exif is invalid'))
        window.alert('剪贴板参数不是 Exif 数据格式，请粘贴复制功能导出的 JSON 数据')
        return
      }
      exif.value = payload
    })
    .catch((error: Error) => {
      captureException(error)
      window.alert(`粘贴失败：${error.message}`)
    })
}

const handleSaveClick = () => {
  try {
    insertExif()
  } catch (error) {
    captureException(error as Error)
    window.alert(`保存失败：${(error as Error).message}`)
  }
}

const clearFileValue = () => {
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file || loading.value) return
  loading.value = true
  getImageData(file)
    .then((data) => {
      imgData.value = data
      const parsed = parseExifData(getExifData(data))
      showNoExifToast(parsed)
      parsed.version = parsed.version || defaultExifVersion
      exif.value = parsed
      fileRef.value = file
      previewImageUrl.value = createObjectURL(file)[0]
    })
    .catch((error: Error) => {
      captureException(error)
      fileRef.value = null
      imgData.value = null
      if (previewImageUrl.value) {
        revokeObjectURL(previewImageUrl.value)
        previewImageUrl.value = null
      }
      const message = error.message?.includes('invalid file data') ? '不支持所选图片格式' : error.message
      window.alert(`解析图片 Exif 数据失败：${message}`)
    })
    .finally(() => {
      loading.value = false
      clearFileValue()
    })
}

onMounted(() => {
  handleResetClick()
})
</script>
