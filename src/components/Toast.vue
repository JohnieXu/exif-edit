<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="isVisible"
        class="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-white px-6 py-3 shadow-lg"
        :class="toastClass"
      >
        <div class="flex items-center gap-2">
          <EIcon v-if="icon" :name="icon" />
          <span>{{ message }}</span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import EIcon from './EIcon.vue'

const props = defineProps<{
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
}>()

const toastClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-500 text-white'
    case 'error':
      return 'bg-red-500 text-white'
    case 'info':
      return 'bg-blue-500 text-white'
    default:
      return 'bg-gray-900 text-white'
  }
})

const icon = computed(() => {
  switch (props.type) {
    case 'success':
      return 'check'
    case 'error':
      return 'close'
    case 'info':
      return 'info'
    default:
      return null
  }
})

const isVisible = ref(false)

const show = () => {
  isVisible.value = true
  if (props.duration) {
    setTimeout(hide, props.duration)
  }
}

const hide = () => {
  isVisible.value = false
}

defineExpose({
  show,
  hide
})
</script>