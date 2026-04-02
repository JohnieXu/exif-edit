import { onUnmounted, ref } from 'vue'

/**
 * 键盘快捷键键位配置
 */
export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  alt?: boolean
}

/**
 * 快捷键回调函数
 */
export type ShortcutCallback = () => void

/**
 * 键盘快捷键管理工具
 */
export const useKeyboardShortcuts = () => {
  // 存储已注册的快捷键
  const shortcuts = ref<Record<string, ShortcutCallback>>({})

  /**
   * 注册快捷键
   * @param id - 快捷键唯一标识
   * @param shortcut - 快捷键配置
   * @param callback - 回调函数
   */
  const register = (
    id: string,
    shortcut: KeyboardShortcut,
    callback: ShortcutCallback
  ) => {
    shortcuts.value[id] = callback
  }

  /**
   * 移除快捷键
   * @param id - 快捷键唯一标识
   */
  const unregister = (id: string) => {
    delete shortcuts.value[id]
  }

  /**
   * 键盘事件处理函数
   * @param event - 键盘事件
   */
  const handleKeyDown = (event: KeyboardEvent) => {
    for (const [id, callback] of Object.entries(shortcuts.value)) {
      const shortcut = id.split('|')
      const key = shortcut[0]
      const ctrl = shortcut.includes('ctrl')
      const meta = shortcut.includes('meta')
      const shift = shortcut.includes('shift')
      const alt = shortcut.includes('alt')

      // 检查是否匹配快捷键
      if (
        event.key === key &&
        (!!ctrl === !!event.ctrlKey) &&
        (!!meta === !!event.metaKey) &&
        (!!shift === !!event.shiftKey) &&
        (!!alt === !!event.altKey)
      ) {
        // 防止在输入框中触发快捷键
        if ((event.target as HTMLElement).tagName === 'INPUT') {
          return
        }

        // 防止与浏览器默认快捷键冲突
        if (ctrl || meta) {
          event.preventDefault()
        }

        callback()
      }
    }
  }

  // 添加全局键盘事件监听
  window.addEventListener('keydown', handleKeyDown)

  // 组件卸载时移除事件监听
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  return {
    register,
    unregister
  }
}

/**
 * 常用快捷键配置
 */
export const CommonShortcuts = {
  COPY: 'ctrl|c',
  PASTE: 'ctrl|v',
  SAVE: 'ctrl|s',
  UNDO: 'ctrl|z',
  REDO: 'ctrl|shift|z'
} as const

/**
 * 创建快捷键唯一标识
 */
export const createShortcutId = (
  key: string,
  ctrl?: boolean,
  meta?: boolean,
  shift?: boolean,
  alt?: boolean
): string => {
  const parts = [key]
  if (ctrl) parts.push('ctrl')
  if (meta) parts.push('meta')
  if (shift) parts.push('shift')
  if (alt) parts.push('alt')
  return parts.join('|')
}