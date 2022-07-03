/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   paddle.class.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: edal--ce <edal--ce@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/30 17:00:15 by adda-sil          #+#    #+#             */
/*   Updated: 2022/07/03 07:26:02 by edal--ce         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Circle, Vector } from 'collider2d';
import {
  Line,
  lineAngle,
  Point,
  lineInterpolate,
  lineLength,
  LineInterpolator,
} from 'geometric';
// import distance from './gametools.class'

const colors = ['red', 'blue', 'magenta', 'purple', 'green'];
// import { distance, colors } from 'gametools';
export class Paddle {
  color: string;
  line: Line;
  interpolationStart: LineInterpolator;
  interpolationEnd: LineInterpolator;
  width: number;
  angle: number;
  index: number;
  bounceAngle: number;
  paddleWidth: number;
  ratio: number;
  t_axis: Line;
  static distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  }
  constructor(axis: Line, index: number, width = 0.2, bounce = 45) {
    this.width = width;
    this.index = index;
    this.color = colors[index % colors.length];
    this.angle = lineAngle(axis);
    this.bounceAngle = bounce;
    this.t_axis = axis;
    // On cree un sous line sur laquelle le paddle va pouvoir glisser
    // qui correspond a 1 - width% de la line actuelle (+ width% de taille du Paddle)
    console.log("axis:", axis);
    console.log("axis lengt:", lineLength(axis));


    const preInterpolate = lineInterpolate(axis);
    console.log("preinterpolator, ", preInterpolate)
    const effectiveAxisStart: Line = [axis[0], preInterpolate(1 - this.width)];
    const effectiveAxisEnd: Line = [preInterpolate(this.width), axis[1]];
    // this.paddleWidth = distance()
    this.interpolationStart = lineInterpolate(effectiveAxisStart);
    this.interpolationEnd = lineInterpolate(effectiveAxisEnd);
    // console.log()
    this.updatePercentOnAxis(0.5);
    // console.log("line ", this.line);
    // this.paddleWidth = Paddle.distance(this.line[0][0], this.line[0][1], this.line[1][0], this.line[1][1])
    // console.log("width ; ", this.paddleWidth)
    console.log("paddle lengt:", lineLength(this.line));;
  }

  updatePercentOnAxis(ratio: number) {
    this.ratio = ratio;
    const newPosStart = this.interpolationStart(ratio);
    const newPosEnd = this.interpolationEnd(ratio);
    this.line = [newPosStart, newPosEnd];
  }

  public get netScheme() {
    return {
      line: this.line,
      color: this.color,
      // angle: this.angle,
    };
  }
}
