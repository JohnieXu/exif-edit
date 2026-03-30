<template>
  <div class="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-4">
    <div
      v-for="name in names"
      :key="name"
      class="flex items-center gap-2 rounded-md border border-slate-100 bg-slate-50 px-2 py-1 text-xs text-slate-600"
    >
      <EIcon :name="name" />
      <span>{{ name }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import EIcon from './EIcon.vue'
import { cameraBrandIconSvg } from './icons'

const names = computed(() => Object.keys(cameraBrandIconSvg))
</script>
