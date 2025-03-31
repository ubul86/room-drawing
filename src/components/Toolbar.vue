<template>
  <div>
    <button @click="startDrawing">Rajzolás indítása</button>
  </div>
</template>

<script setup>
import { useDrawingStore} from "../stores/drawing.store.js";

const store = useDrawingStore();

// Rajzolás indítása
const startDrawing = () => {
  store.startDrawing();
};
</script>