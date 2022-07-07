/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gametools.class.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/30 17:00:01 by adda-sil          #+#    #+#             */
/*   Updated: 2022/07/07 12:24:49 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Vector } from "collider2d";

export default class GameTools {
  // static colors =  ['red', 'blue', 'magenta', 'purple', 'green'];
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

  static vectorRotate(vx: number, vy: number, degree: number) {

    // const L = Math.norm([vx,vy]) this.distance(0, 0, vx, vy);
    // L =
    let vec: Vector = new Vector(vx, vy)
    // console.log("vector L is ", L);
    console.log('vec is ', vec);

    // {
    // ang = -ang * (Math.PI / 180);
    var cos = Math.cos(degree);
    var sin = Math.sin(degree);
    let rotated = Array(Math.round(10000 * (vx * cos - vy * sin)) / 10000, Math.round(10000 * (vx * sin + vy * cos)) / 10000);
    // };
    // console.log("rotated :", rotated)
    return rotated;

  }

  static pDistance(x: number, y: number, p1: number[], p2: number[]): number {

    const A = x - p1[0];
    const B = y - p1[1];
    const C = p2[0] - p1[0];
    const D = p2[1] - p1[1];

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq != 0) //in case of 0 length line
      param = dot / len_sq;

    var xx, yy;

    if (param < 0) {
      xx = p1[0];
      yy = p1[1];
    }
    else if (param > 1) {
      xx = p2[0];
      yy = p2[1];
    }
    else {
      xx = p1[0] + param * C;
      yy = p1[1] + param * D;
    }

    var dx = x - xx;
    var dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }


  static distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  }
  static percentage(small: number, big: number): number {
    return (small / big) * 100;
  }

  static genRanHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

}
