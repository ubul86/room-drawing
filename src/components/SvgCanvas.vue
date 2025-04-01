<template>
  <div class="svg-container">
    <svg
        ref="svgRef"
        @click="addPoint"
        @mousemove="updatePreviewLine"
        @keydown="handleKeydown"
        tabindex="0"
        viewBox="0 0 500 500"
        preserveAspectRatio="xMidYMid meet"
        >

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

      <polygon
          v-if="polygonPoints.length > 0"
          :points="polygonPoints.map(p => `${p.x},${p.y}`).join(' ')"
          fill="rgba(0,0,255,0.3)" stroke="blue" stroke-width="2"
      />

      <circle
          v-if="previewPoint"
          :cx="previewPoint.x"
          :cy="previewPoint.y"
          r="5"
          fill="rgba(255,0,0,0.5)"
          @click="addPreviewPoint"
      />

      <circle
          v-for="(point, index) in points"
          :key="'circle-' + index"
          :cx="point.startX"
          :cy="point.startY"
          :r=" !polygonPoints.length ? 5 : 15 "
          fill="red"
          v-if="togglePoints"
          :class="{ pulse: index === 0 && points.length > 1 && !polygonPoints.length }"
          @mousedown="startDrag(index, $event)"
          @click.stop="checkPolygonClosure(index)" />


    </svg>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useDrawingStore } from '../stores/drawing.store.js';

const store = useDrawingStore();
const points = computed(() => store.points);
const lines = computed(() => store.lines);
const isDrawing = computed(() => store.isDrawing);
const currentPoint = computed(() => store.currentPoint);
const polygonPoints = computed(() => store.polygonPoints);
const togglePoints = computed(() => store.togglePoints);
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
  if (!store.isDrawing || !currentPoint.value) {
    return;
  }

  const rect = event.currentTarget.getBoundingClientRect();
  mouseX.value = event.clientX - rect.left;
  mouseY.value = event.clientY - rect.top;
};

const checkPolygonClosure = (index) => {
  if (draggedPointIndex.value) {
    return;
  }
  if (store.points.length > 2 && index === 0) {
    store.finalizePolygon();
  }
};

const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    store.finishDrawing();
  }
};

const svgRef = ref(null);

onMounted(() => {
  resizeSvg();
  window.addEventListener('resize', resizeSvg);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeSvg);
});

const resizeSvg = () => {
  if (svgRef.value) {
    const { width, height } = svgRef.value.getBoundingClientRect();
    svgRef.value.setAttribute("viewBox", `0 0 ${width} ${height}`);
  }
};

const draggedPointIndex = ref(null);

const startDrag = (index, event) => {
  draggedPointIndex.value = index;
  event.preventDefault();
};

const movePoint = (event) => {
  if (draggedPointIndex.value === null) return;

  const rect = svgRef.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  store.updatePoint(draggedPointIndex.value, { startX: x, startY: y });
};

const stopDrag = () => {
  draggedPointIndex.value = null;
};

onMounted(() => {
  window.addEventListener('mousemove', movePoint);
  window.addEventListener('mouseup', stopDrag);
  svgRef.value.addEventListener('mousemove', updatePreviewPoint);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', movePoint);
  window.removeEventListener('mouseup', stopDrag);
  svgRef.value.removeEventListener('mousemove', updatePreviewPoint);
});

const previewPoint = ref(null);

const updatePreviewPoint = (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  let closestSegment = null;
  let minDistance = Infinity;
  let projectedPoint = null;
  let insertIndex = -1;

  for (let i = 0; i < polygonPoints.value.length; i++) {
    const p1 = polygonPoints.value[i];
    const p2 = polygonPoints.value[(i + 1) % polygonPoints.value.length];

    const projection = projectPointOnSegment(x, y, p1, p2);
    const dist = Math.hypot(x - projection.x, y - projection.y);

    if (dist < minDistance) {
      minDistance = dist;
      closestSegment = { p1, p2, index: i };
      projectedPoint = projection;
      insertIndex = i + 1;
    }
  }

  previewPoint.value = minDistance < 10 ? { ...projectedPoint, index: insertIndex } : null;
};
const projectPointOnSegment = (px, py, p1, p2) => {
  const A = px - p1.x;
  const B = py - p1.y;
  const C = p2.x - p1.x;
  const D = p2.y - p1.y;

  const lenSq = C * C + D * D;
  let param = lenSq !== 0 ? (A * C + B * D) / lenSq : -1;

  let xx, yy;
  if (param < 0) {
    xx = p1.x;
    yy = p1.y;
  } else if (param > 1) {
    xx = p2.x;
    yy = p2.y;
  } else {
    xx = p1.x + param * C;
    yy = p1.y + param * D;
  }

  return { x: xx, y: yy };
};

const addPreviewPoint = () => {
  if (!previewPoint.value) return;

  const newPoint = { startX: previewPoint.value.x, startY: previewPoint.value.y };

  store.addPoint(newPoint, previewPoint.value.index);
  store.addPolygonPoint(newPoint, previewPoint.value.index)
};

</script>

<style>
@keyframes pulse {
  0% {
    r: 5;
    opacity: 1;
  }
  50% {
    r: 10;
    opacity: 0.5;
  }
  100% {
    r: 5;
    opacity: 1;
  }
}

.pulse {
  animation: pulse 1s infinite;
}

.svg-container {
  width: 100%;
  height: calc(100vh - 50px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.svg-container svg {
  width: 100%;
  height: 100%;
  border: 1px solid black;
}

</style>