<template>
  <div :class="bem()">
    <div :class="bem('icon-item')" v-for="(_, name) in iconMap" :key="name">
      <EIcon :name="name" />
    </div>
  </div>
</template>

<script>
import { createBEM } from '../utils/className'
import { iconMap } from './data'
import EIcon from './EIcon.vue'

const bem = createBEM("e-icon-test")

export default {
  name: "EIconTest",
  components: {
    EIcon
  },
  props: {
    name: {
      type: String,
      required: true
    },
  },
  data () {
    return {
      iconMap,
    }
  },
  methods: {
    bem
  }
}
</script>

<style>
.pe_e-icon-test__icon-item {
  margin: 8px;
}
</style>
