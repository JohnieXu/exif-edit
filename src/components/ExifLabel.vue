<template>
  <div
    v-if="hasExifData"
    class="mb-1 flex items-center justify-around border-b border-white/80 pb-2 text-sm text-zinc-900 md:text-base"
  >
    <span v-if="exif?.ISO" class="flex-1 text-left">ISO {{ exif.ISO }}</span>
    <span v-if="exif?.L" class="flex-1 text-left">{{ exif.L }} 毫米</span>
    <span v-if="exif?.F" class="flex-1 text-left">f/{{ exif.F }}</span>
    <span v-if="exif?.S" class="flex-1 text-left">1/{{ exif.S }} 秒</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { DEFUALT_EXIF } from '@/config/const'
import { isObjectKeySame } from '@/utils/common'
import type { ExifValue } from '@/types/exif'

const props = withDefaults(
  defineProps<{
    exif?: ExifValue | null
  }>(),
  {
    exif: null
  }
)

const hasExifData = computed(() => {
  if (!props.exif) {
    return false
  }
  return isObjectKeySame(props.exif as Record<string, unknown>, DEFUALT_EXIF as Record<string, unknown>) && !!props.exif.ISO
})
</script>
