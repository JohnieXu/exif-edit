<template>
  <div
    class="relative inline-block"
    ref="tooltipRef"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
  >
    <slot></slot>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isVisible"
        class="absolute z-50 rounded-md bg-gray-900 px-3 py-2 text-xs text-white shadow-lg max-w-xs"
        :style="tooltipStyle"
      >
        <div class="relative">
          <slot name="content">
            {{ text }}
          </slot>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 transform rotate-45 bg-gray-900 w-2 h-2"></div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  text: string
}>()

const isVisible = ref(false)
const tooltipRef = ref<HTMLElement | null>(null)
const tooltipStyle = ref<Record<string, string>>({})

const showTooltip = () => {
  isVisible.value = true
  updateTooltipPosition()
}

const hideTooltip = () => {
  isVisible.value = false
}

const updateTooltipPosition = () => {
  if (!tooltipRef.value || !isVisible.value) return

  const rect = tooltipRef.value.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top

  if (spaceBelow < 100 && spaceAbove > 100) {
    // 如果下方空间不足，显示在上方
    tooltipStyle.value = {
      top: `${rect.top - 10}px`,
      left: `${rect.left + rect.width / 2}px`,
      transform: 'translate(-50%, -100%)',
      marginTop: '-8px'
    }
  } else {
    // 默认显示在下方
    tooltipStyle.value = {
      top: `${rect.bottom + 10}px`,
      left: `${rect.left + rect.width / 2}px`,
      transform: 'translate(-50%, 0)',
      marginTop: '0'
    }
  }
}

// 监听窗口大小变化，更新tooltip位置
const handleResize = () => {
  if (isVisible.value) {
    updateTooltipPosition()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>