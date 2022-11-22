<template>
  <div :class="bem()">
    <span v-if="exif && exif.ISO" :class="bem('item', 'ISO')">ISO {{exif.ISO}}</span>
    <span v-if="exif && exif.L" :class="bem('item', 'L')">{{exif.L}} 毫米</span>
    <span v-if="exif && exif.F" :class="bem('item', 'F')">f/{{exif.F}}</span>
    <span v-if="exif && exif.S" :class="bem('item', 'S')">1/{{exif.S}} 秒</span>
  </div>
</template>

<script>
import { createBEM } from '../utils/className'

const bem = createBEM('exif-label')

export default {
  name: 'exif-label',
  props: {
    exif: {
      type: Object,
      default: null
    }
  },
  methods: {
    bem
  }
}
</script>

<style>
.pe_exif-label {
  flex: 1;
  display: flex;
  justify-content: space-around;
  align-items: center;
  font-size: 16px;
  padding-bottom: 10px;
  margin-bottom: 5px;
  border-bottom: 1px solid rgba(200,200,200,0.8);
}
.pe_exif-label__item {
  flex: 1;
  text-align: left;
}
</style>

