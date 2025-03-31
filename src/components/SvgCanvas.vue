<template>
  <svg
      @click="addPoint"
      @mousemove="updatePreviewLine"
      @keydown="handleKeydown"
      tabindex="0"
      width="500" height="500" viewBox="0 0 500 500"
      style="border: 1px solid black; cursor: normal;">

    <line
        v-for="(line, index) in lines"
        :key="'line-' + index"
        :x1="line.x1" :y1="line.y1"
        :x2="line.x2" :y2="line.y2"
        stroke="black" stroke-width="2" />

    <line
        v-if="isDrawing && currentPoint"
        :x1="currentPoint.startX" :y1="currentPoint.startY"
        :x2="mouseX" :y2="mouseY"
        stroke="gray" stroke-dasharray="5,5" stroke-width="2" />

    <circle
        v-for="(point, index) in points"
        :key="'circle-' + index"
        :cx="point.startX"
        :cy="point.startY"
        r="5"
        fill="red"
        @click.stop="checkPolygonClosure(index)" />

    <polygon
        v-if="polygonPoints.length > 0"
        :points="polygonPoints.map(p => `${p.x},${p.y}`).join(' ')"
        fill="rgba(0,0,255,0.3)" stroke="blue" stroke-width="2" />
  </svg>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useDrawingStore } from '../stores/drawing.store.js';

const store = useDrawingStore();
const points = computed(() => store.points);
const lines = computed(() => store.lines);
const isDrawing = computed(() => store.isDrawing);
const currentPoint = computed(() => store.currentPoint);
const polygonPoints = computed(() => store.polygonPoints);
const mouseX = ref(0);
const mouseY = ref(0);

const addPoint = (event) => {
  if (!store.isDrawing) return;

  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  if (currentPoint.value) {
    store.addLine({ x1: currentPoint.value.startX, y1: currentPoint.value.startY, x2: x, y2: y });
  }

  store.setCurrentPoint({ startX: x, startY: y });
  store.addPoint({ startX: x, startY: y });
};

const updatePreviewLine = (event) => {
  if (!store.isDrawing || !currentPoint.value) return;

  const rect = event.currentTarget.getBoundingClientRect();
  mouseX.value = event.clientX - rect.left;
  mouseY.value = event.clientY - rect.top;
};

const checkPolygonClosure = (index) => {
  if (store.points.length > 2 && index === 0) {
    store.finalizePolygon();
  }
};

const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    store.finishDrawing();
  }
};
</script>
