<template>
  <button @click="startDrawing">
    {{ isDrawing || (!isDrawing && points.length > 0) ? 'Rajzolás újraindítása' : 'Rajzolás indítása' }}
  </button>
  <button @click="showPoints">
    {{ togglePoints ? 'Pontok kikapcsolása' : 'Pontok bekapcsolása' }}
  </button>
</template>

<script setup>
import { useDrawingStore} from "../stores/drawing.store.js";
import { computed } from "vue";

const store = useDrawingStore();

const points = computed(() => store.points);
const isDrawing = computed(() => store.isDrawing);
const togglePoints = computed(() => store.togglePoints);

const startDrawing = () => {
  store.startDrawing();
};

const showPoints = () => {
  store.showPoints();
}

</script>