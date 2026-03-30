<template>
  <div class="mb-5 flex items-center gap-3 text-sm">
    <button
      class="border-b-2 px-1 pb-1 transition"
      :class="modelValue === '0' ? 'border-orange-400 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'"
      type="button"
      @click="handleItemClick('0')"
    >
      Exif编辑
    </button>
    <button
      v-if="show.watermark"
      class="border-b-2 px-1 pb-1 transition"
      :class="modelValue === '1' ? 'border-orange-400 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'"
      type="button"
      @click="handleItemClick('1')"
    >
      水印边框
    </button>
    <button
      v-if="show.demo"
      class="border-b-2 px-1 pb-1 transition"
      :class="modelValue === '2' ? 'border-orange-400 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'"
      type="button"
      @click="handleItemClick('2')"
    >
      Demo
    </button>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { onDevelop } from '@/utils/common'

const props = withDefaults(
  defineProps<{
    modelValue?: string
  }>(),
  {
    modelValue: '0'
  }
)

const emit = defineEmits<{
  (event: 'update:modelValue', selected: string): void
}>()

const show = reactive({
  watermark: true,
  demo: false
})

const handleItemClick = (selected: string) => {
  emit('update:modelValue', selected)
}

onDevelop(() => {
  show.demo = true
})
</script>
