<template>
  <div :class="bem()">
    <span :class="bem('button', value === '0' ? 'active' : '')" @click="handleItemClick('0')">Exif编辑</span>
    <span :class="bem('button', value === '1' ? 'active' : '')" @click="handleItemClick('1')">水印边框</span>
    <span :class="bem('button', value === '2' ? 'active' : '')" @click="handleItemClick('2')">Demo</span>
  </div>
</template>

<script>
import { createBEM } from '@/utils/className';


const bem = createBEM('type-select')

export default {
  name: "TypeSelect",
  model: {
    value: 'selected',
    event: 'change'
  },
  props: {
    value: {
      type: String,
      default: '0'
    }
  },
  methods: {
    bem,
    handleItemClick(selected) {
      this.$emit('change', selected)
    }
  }
}
</script>

<style>
.pe_type-select {
  margin-bottom: 20px;
}
.pe_type-select__button {
  cursor: pointer;
  border-bottom: 3px solid transparent;
}
.pe_type-select__button:not(:last-child) {
  margin-right: 10px;
}
.pe_type-select__button--active {
  border-color: #FBAB7E;
}
</style>
