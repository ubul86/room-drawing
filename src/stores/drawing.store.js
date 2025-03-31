import { defineStore } from 'pinia';

export const useDrawingStore = defineStore('drawing', {
    state: () => ({
        isDrawing: false,
        points: [],
        currentPoint: null,
        lines: [],
        polygonPoints: []
    }),
    actions: {
        startDrawing() {
            this.isDrawing = true;
            this.points = [];
            this.lines = [];
            this.polygonPoints = [];
        },
        addPoint(point) {
            this.points.push(point);
        },
        addLine(line) {
            this.lines.push(line);
        },
        setCurrentPoint(point) {
            this.currentPoint = point;
        },
        finalizePolygon() {
            this.polygonPoints = this.points.map(p => ({ x: p.startX, y: p.startY }));
            this.points = [];
            this.lines = [];
            this.currentPoint = null;
            this.isDrawing = false;
        },
        finishDrawing() {
            this.isDrawing = false;
            this.currentPoint = null;
        }
    }
});
