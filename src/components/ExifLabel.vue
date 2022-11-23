<template>
  <div v-if="hasExifData" :class="bem()">
    <span v-if="exif && exif.ISO" :class="bem('item', 'ISO')">ISO {{exif.ISO}}</span>
    <span v-if="exif && exif.L" :class="bem('item', 'L')">{{exif.L}} 毫米</span>
    <span v-if="exif && exif.F" :class="bem('item', 'F')">f/{{exif.F}}</span>
    <span v-if="exif && exif.S" :class="bem('item', 'S')">1/{{exif.S}} 秒</span>
  </div>
</template>

<script>
import { isObjectKeySame } from '@/utils/common';
import { createBEM } from '@/utils/className'
import { DEFUALT_EXIF } from '../config/const';

const bem = createBEM('exif-label')

export default {
  name: 'exif-label',
  props: {
    exif: {
      type: Object,
      default: null
    }
  },
  computed: {
    hasExifData() {
      return isObjectKeySame(this.exif, DEFUALT_EXIF) && !!this.exif.ISO
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
  border-bottom: 2px solid rgb(251 251 251 / 80%);
  color: #1f1f1f;
}
.pe_exif-label__item {
  flex: 1;
  text-align: left;
}
</style>

