const TWO_PI = Math.PI * 2;
import { polygonRegular, lineAngle, Line, Point, angleToDegrees } from 'geometric';
// import Polygon from 'polygon';

export default class Polygon {
  verticles = [];
  edges = [];
  angles = [];

  constructor(npoints, x = 0, y = 0, radius = 50) {
    let angle = TWO_PI / npoints;
    for (let a = 0; a <= TWO_PI; a += angle) {
      let sx = x + Math.cos(a) * radius;
      let sy = y + Math.sin(a) * radius;
      this.verticles.push([sx, sy]);
      this.angles.push(angleToDegrees(a));
    }

    for (let i = 0; i < this.verticles.length; i++) {
      const next = i === this.verticles.length - 1 ? 0 : i + 1;
      const line = [this.verticles[i], this.verticles[next]];
      this.edges[i] = line;
    }
  }
}
