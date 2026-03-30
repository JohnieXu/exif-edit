<template>
  <span
    class="inline-flex shrink-0 items-center justify-center leading-none text-[12px] [&_svg]:h-[14px] [&_svg]:w-[14px]"
    :class="className"
    v-html="iconHtml"
  ></span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cameraBrandIconSvg, cameraBrandMatchList } from './icons'

const props = defineProps<{
  name: string
  className?: string
}>()

const iconHtml = computed(() => {
  if (!props.name) {
    return ''
  }
  const lowerName = props.name.toLowerCase()
  const matchedModel = cameraBrandMatchList.find((model) => lowerName.includes(model))
  return cameraBrandIconSvg[props.name] || (matchedModel ? cameraBrandIconSvg[matchedModel] : '')
})
</script>
