<template>
  <div
    :class="bem({ dragging: isDragging })"
    @drop.prevent="handleDrop"
    @dragover.prevent="handleDropover"
    @dragleave.prevent=handleDropleave
  >
    <slot></slot>
  </div>
</template>

<script lang="js">
import { createBEM } from '../utils/className'

const bem = createBEM('file-dragger')

export default {
  name: 'FileDragger',
  data () {
    return {
      isDragging: false,
    }
  },
  methods: {
    bem,
    /**
     * @type {import('./FileDragger.d.ts').IHandleDrop}
     */
    handleDrop (e) {
      this.isDragging = false
      const [file] = e.dataTransfer.files
      if (file) {
        this.$emit("file", file)
      }
    },
    handleDropover () {
      this.isDragging = true
    },
    handleDropleave () {
      this.isDragging = false
    }
  }
}
</script>

<style>
.pe_file-dragger {
  transition: all 0.2s ease;
}
.pe_file-dragger--dragging {
  opacity: 0.7;
}
</style>
