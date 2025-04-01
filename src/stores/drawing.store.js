import { defineStore } from 'pinia';

export const useDrawingStore = defineStore('drawing', {
    state: () => ({
        isDrawing: false,
        points: [],
        currentPoint: null,
        lines: [],
        polygonPoints: [],
        togglePoints: false
    }),
    actions: {
        startDrawing() {
            this.isDrawing = true;
            this.togglePoints = true;
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
            this.lines = [];
            this.currentPoint = null;
            this.isDrawing = false;
            this.togglePoints = false;
        },
        finishDrawing() {
            this.isDrawing = false;
            this.currentPoint = null;
        },
        showPoints() {
            this.togglePoints = !this.togglePoints;
        },
        updatePoint(index, newPoint) {
            this.points[index] = newPoint;
            if (this.polygonPoints.length > 0) {
                this.polygonPoints[index] = { x: newPoint.startX, y: newPoint.startY };
            }
        }
    }
});
