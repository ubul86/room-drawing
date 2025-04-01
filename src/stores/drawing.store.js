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
        addPoint(point, index = null) {
            if (!index) {
                this.points.push(point);
            }
            else {
                this.points.splice(index, 0, point);
            }
        },
        addPolygonPoint(point, index = null) {
            if (!index) {
                this.polygonPoints.push({ x: point.startX, y: point.startY })
            }
            else {
                this.polygonPoints.splice(index, 0, { x: point.startX, y: point.startY });
            }
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
