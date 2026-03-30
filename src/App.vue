<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-5 py-5 sm:px-10 sm:py-10 lg:px-20 lg:py-20 xl:px-[12vw]">
      <TypeSelect v-model="type" />
      <ExifEdit v-show="type === '0'" class="flex-1" @change="handleExifEditChange" />
      <WatermarkEdit v-show="type === '1'" class="flex-1" />
      <VDemo v-show="type === '2'" />
      <EIconTest v-if="isEIconTestShow" />
    </div>
  </div>
</template>

<script setup lang="ts">
import download from 'downloadjs'
import { ref } from 'vue'

import ExifEdit from './components/ExifEdit.vue'
import EIconTest from './components/EIconTest.vue'
import TypeSelect from './components/TypeSelect.vue'
import WatermarkEdit from './components/WatermarkEdit.vue'
import VDemo from './components/Demo.vue'
import type { ExifChangePayload } from './types/exif'

const isEIconTestShow = false
const type = ref<string>('0')

const handleExifEditChange = ({ b64: imgData, fileName }: ExifChangePayload) => {
  download(imgData, fileName, 'image/jpeg')
}
</script>
