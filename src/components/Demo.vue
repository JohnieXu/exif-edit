<template>
  <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <p class="mb-3 text-left text-sm text-slate-500">Demo 画布（开发环境可见）</p>
    <div ref="containerRef" class="mx-auto flex justify-center"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import Konva from 'konva'

const containerRef = ref<HTMLDivElement | null>(null)
let stage: Konva.Stage | null = null

onMounted(() => {
  if (!containerRef.value) {
    return
  }
  stage = new Konva.Stage({
    container: containerRef.value,
    width: 400,
    height: 300
  })
  const layer = new Konva.Layer()

  const rect0 = new Konva.Rect({
    x: 0,
    y: 0,
    width: 400,
    height: 300,
    stroke: 'green',
    strokeWidth: 1
  })
  const rect1 = new Konva.Rect({
    x: 20,
    y: 20,
    width: 100,
    height: 50,
    fill: 'green',
    stroke: 'black',
    strokeWidth: 1
  })
  const group0 = new Konva.Group({
    x: 100,
    y: 0,
    width: 200,
    height: 200
  })
  const rect2 = new Konva.Rect({
    x: 20,
    y: 20,
    width: 100,
    height: 50,
    fill: 'blue',
    stroke: 'black',
    strokeWidth: 1
  })
  const rect3 = new Konva.Rect({
    x: 0,
    y: 0,
    width: 200,
    height: 200,
    fill: '#ff000063'
  })
  const text0 = new Konva.Text({
    x: 0,
    y: 0,
    text: 'Simple Text',
    fontSize: 30,
    fontFamily: 'Calibri',
    fill: 'yellow'
  })
  const text1 = new Konva.Text({
    x: 0,
    y: 50,
    text: 'XIAOMI12SULTRA',
    fontSize: 26,
    fontFamily:
      '-apple-system,BlinkMacSystemFont,Helvetica Neue,Helvetica,Segoe UI,Arial,Roboto,PingFang SC,miui,Hiragino Sans GB,Microsoft Yahei,sans-serif',
    fontVariant: 'bold',
    fill: '#000'
  })

  group0.add(rect2)
  group0.add(rect3)
  group0.add(text0)
  group0.add(text1)
  layer.add(rect0)
  layer.add(rect1)
  layer.add(group0)
  stage.add(layer)
})

onBeforeUnmount(() => {
  stage?.destroy()
  stage = null
})
</script>
