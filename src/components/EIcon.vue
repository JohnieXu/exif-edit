<template>
  <span class="shrink-0 leading-none text-[0]" :class="className">
    <component :is="iconRenderer" />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cameraBrandIconSvg, cameraBrandMatchList } from './icons'

const props = defineProps<{
  name: string
  className?: string
}>()

const iconRenderer = computed(() => {
  if (!props.name) {
    return 'span'
  }
  const lowerName = props.name.toLowerCase()
  const matchedModel = cameraBrandMatchList.find((model) => lowerName.includes(model))
  const iconHtml = cameraBrandIconSvg[props.name] || (matchedModel ? cameraBrandIconSvg[matchedModel] : '')
  return {
    template: `<span class="inline-flex items-center justify-center text-[12px] [&_svg]:h-[14px] [&_svg]:w-[14px]" v-html="icon"></span>`,
    data() {
      return { icon: iconHtml || '' }
    }
  }
})
</script>
