import { Vector, Polygon } from 'collider2d';
import {
  polygonRegular,
  lineAngle,
  Line,
  Point,
  angleToDegrees,
} from 'geometric';
// import Polygon from 'polygon';

export default class MyPolygon {
  shape;
  sides = [];
  verticles = [];
  edges = [];
  angles = [];
  edgeWidth = 0;
  center;

  constructor(npoints, x = 0, y = 0, radius = 50) {
    this.center = new Vector(x, y);
    if (npoints === 2) {
      // this.verticles = [
      //   [-50, 50],
      //   [50, 50],
      //   [50, -50],
      //   [-50, -50],
      // ];
      const a = x - y;
      const b = x + y;
      this.verticles = [
        [a, b],
        [b, b],
        [b, a],
        [a, a],
      ];
    } else {
      const angle = (Math.PI * 2) / npoints;
      for (let i = 0; i < npoints; i++) {
        const sx = /*Math.fround*/(x + Math.cos(angle * i) * radius);
        const sy = /*Math.fround*/(y + Math.sin(angle * i) * radius);
        this.verticles.push([sx, sy]);
        this.sides.push(new Vector(sx, sy))
        console.log('sx, sy ', [sx, sy]);
      }
      this.shape = new Polygon(this.center, this.sides);
    }

    for (let i = 0; i < this.verticles.length; i++) {
      const next = i === this.verticles.length - 1 ? 0 : i + 1;
      const line: Line = [this.verticles[i], this.verticles[next]];
      this.angles.push(lineAngle(line))
      this.edges[i] = line;
    }

    console.log("-- Edges", this.shape);
    this.edgeWidth = radius;
  }
}
