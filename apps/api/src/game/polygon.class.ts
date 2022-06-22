import {
  polygonRegular,
  lineAngle,
  Line,
  Point,
  angleToDegrees,
} from 'geometric';
// import Polygon from 'polygon';

export default class Polygon {
  verticles = [];
  edges = [];
  angles = [];
  edgeWidth = 0;

  constructor(npoints, x = 0, y = 0, radius = 50) {
    const angle = (Math.PI * 2) / npoints;
    for (let a = Math.PI; a <= Math.PI * 3; a += angle) {
      const sx = x + Math.cos(a) * radius;
      const sy = y + Math.sin(a) * radius;
      this.verticles.push([sx, sy]);
      console.log('sx, sy ', [sx, sy]);
      this.angles.push(angleToDegrees(a));
    }

    for (let i = 0; i < this.verticles.length - 1; i++) {
      const next = i === this.verticles.length - 1 ? 0 : i + 1;
      const line = [this.verticles[i], this.verticles[next]];
      this.edges[i] = line;
    }

    this.edgeWidth = radius;
  }
}
