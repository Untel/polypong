/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gametools.class.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: edal--ce <edal--ce@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/30 17:00:01 by adda-sil          #+#    #+#             */
/*   Updated: 2022/09/03 12:41:53 by edal--ce         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Circle } from 'collider2d';
import { Line, Point } from 'geometric';
import { Ball } from './ball.class';

export default class GameTools {
  // static colors =  ['red', 'blue', 'magenta', 'purple', 'green'];

  static calculateRatio(num_1: number, num_2: number) {
    for (let num: number = num_2; num > 1; num--) {
      if (num_1 % num == 0 && num_2 % num == 0) {
        num_1 = num_1 / num;
        num_2 = num_2 / num;
      }
    }
    // var ratio = num_1+":"+num_2;
    const ratio = num_1 / num_2;
    return ratio;
  }
  static angleNormalize(val: number, r_start: number, r_end: number) {
    const width: number = r_end - r_start; //
    const offsetValue: number = val - r_start; // value relative to 0

    return offsetValue - Math.floor(offsetValue / width) * width + r_start;
    // + start to reset back to start of original range
  }
  static lineIntersection(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) {
    const s1_x = p1_x - p0_x;
    const s1_y = p1_y - p0_y;
    const s2_x = p3_x - p2_x;
    const s2_y = p3_y - p2_y;

    const s =
      (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) /
      (-s2_x * s1_y + s1_x * s2_y);
    const t =
      (s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) /
      (-s2_x * s1_y + s1_x * s2_y);

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
      return {
        x: p0_x + t * s1_x,
        y: p0_y + t * s1_y,
      };
    }

    return null; // No collision
  }
  static getRandomArbitrary(min, max): number {
    return Math.floor(Math.random() * (max - min) + min);
  }
  static getRandomFloatArbitrary(min, max): number {
    return Math.random() * (max - min) + min;
  }

  static pDistance(x: number, y: number, p1: number[], p2: number[]): number {
    const A = x - p1[0];
    const B = y - p1[1];
    const C = p2[0] - p1[0];
    const D = p2[1] - p1[1];

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq != 0)
      //in case of 0 length line
      param = dot / len_sq;

    let xx, yy;

    if (param < 0) {
      xx = p1[0];
      yy = p1[1];
    } else if (param > 1) {
      xx = p2[0];
      yy = p2[1];
    } else {
      xx = p1[0] + param * C;
      yy = p1[1] + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  static distance(x1: number, y1: number, x2: number, y2: number): number {
    const x2x1: number = x2 - x1;
    const y2y1: number = y2 - y1;
    return Math.sqrt(Math.pow(x2x1, 2) + Math.pow(y2y1, 2));
  }
  static percentage(small: number, big: number): number {
    return (small / big) * 100;
  }

  static genRanHex = (size) =>
    [...Array(size)]
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('');

  static linePoint(line :Line, point : Point){
    const x1: number = line[0][0]
    const y1: number = line[0][1]
    const x2: number = line[1][0]
    const y2: number = line[1][1]
    const px: number = point[0];
    const py: number = point[1];
    const lineLen: number = GameTools.distance(x1, y1, x2, y2);

    const d1: number = GameTools.distance(px, py, x1, y1);
    const d2: number = GameTools.distance(px, py, x2, y2);

    const buffer = 0.1;

    if (d1 + d2 >= lineLen - buffer && d1 + d2 <= lineLen + buffer) {
      return true;
    }
    return false;
  }

  static pointCircle(
    px: number,
    py: number,
    cx: number,
    cy: number,
    r: number,
  ) {
    const distX: number = px - cx;
    const distY: number = py - cy;

    const distance = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));
    if (distance <= r) {
      return true;
    }
    return false;
  }

  static wallBallCollision(w: Line, b: Ball, impact: Point) {
    return this.lineCircleCollision(w, b, impact);
  }

  static lineCircleCollision(line : Line, c : Circle, closestP : Point = [0,0]){

    const x1: number = line[0][0];
    const y1: number = line[0][1];
    const x2: number = line[1][0];
    const y2: number = line[1][1];
    const cx: number = c.position.x;
    const cy: number = c.position.y;
    const r: number = c.radius;
    const inside1 : boolean = this.pointCircle(x1,y1, cx,cy,r); // Need pointcircle
    const inside2 : boolean = this.pointCircle(x2,y2, cx,cy,r);
    if (inside1 || inside2) return true;

    let distX: number = x1 - x2;
    let distY: number = y1 - y2;
    const len: number = Math.sqrt(distX * distX + distY * distY); // Just the length of the line, may be ommited
    const dot: number =
      ((cx - x1) * (x2 - x1) + (cy - y1) * (y2 - y1)) / Math.pow(len, 2);

    const closestPt : Point = [(x1 + dot * (x2 - x1)),(y1 + dot * (y2 - y1)) ]
    closestP[0] = closestPt[0];
    closestP[1] = closestPt[1];
    const onSegment = this.linePoint(line, closestPt); //Need linepoint
    if (!onSegment) return false;

    distX = closestPt[0] - cx;
    distY = closestPt[1] - cy;
    const distance: number = Math.sqrt(distX * distX + distY * distY); //Pythagore

    if (distance <= r) {
      return true;
    }
    return false;
  }
}
