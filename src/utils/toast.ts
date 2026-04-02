import { ref } from 'vue'

// 创建一个全局的 toast 实例
const toast = ref<{
  show: (options: ToastOptions) => void
  hide: () => void
} | null>(null)

export interface ToastOptions {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
}

/**
 * 注册全局 toast 实例
 * @param instance - toast 实例
 */
export const registerToast = (instance: any) => {
  toast.value = instance
}

/**
 * 显示 toast 提示
 */
export const showToast = (options: ToastOptions) => {
  if (toast.value) {
    toast.value.show(options)
  } else {
    // 如果没有注册实例，使用 fallback 到 console
    console.warn('Toast instance not registered')
    console.log('Toast:', options.message)
  }
}

/**
 * 成功提示
 */
export const showSuccess = (message: string, duration = 3000) => {
  showToast({ message, type: 'success', duration })
}

/**
 * 错误提示
 */
export const showError = (message: string, duration = 5000) => {
  showToast({ message, type: 'error', duration })
}

/**
 * 信息提示
 */
export const showInfo = (message: string, duration = 3000) => {
  showToast({ message, type: 'info', duration })
}

/**
 * 手动隐藏 toast
 */
export const hideToast = () => {
  if (toast.value) {
    toast.value.hide()
  }
}