/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   paddle.class.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/30 17:00:15 by adda-sil          #+#    #+#             */
/*   Updated: 2022/07/04 02:23:28 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Circle, Vector } from 'collider2d';
import {
  Line,
  lineAngle,
  Point,
  lineInterpolate,
  LineInterpolator,
  lineLength,
} from 'geometric';
import GameTools from './gametools.class';
export class Paddle {
  axis: Line;
  color: string;
  line: Line;
  width: number;
  angle: number;
  maxAngle: number;
  index: number;
  interpolationStart: LineInterpolator;
  interpolationEnd: LineInterpolator;
  bounceAngle: number;

  constructor(axis: Line, index: number, relativeSize = 0.2, bounce = 45) {
    this.index = index;
    this.axis = axis;
    // this.color = GameTools.colors[index % GameTools.colors.length];
    this.color = `#${GameTools.genRanHex(6)}`;
    this.angle = lineAngle(axis);
    this.bounceAngle = bounce;

    this.setRelativeSize(relativeSize);
    this.updatePercentOnAxis(0.5);
    this.width = lineLength(this.line);
  }

  setRelativeSize(relativeSize = 0.2) {
    // On cree un sous line sur laquelle le paddle va pouvoir glisser
    // qui correspond a 1 - width% de la line actuelle (+ width% de taille du Paddle)
    const preInterpolate = lineInterpolate(this.axis);
    const effectiveAxisStart: Line = [this.axis[0], preInterpolate(1 - relativeSize)];
    const effectiveAxisEnd: Line = [preInterpolate(relativeSize), this.axis[1]];
    this.interpolationStart = lineInterpolate(effectiveAxisStart);
    this.interpolationEnd = lineInterpolate(effectiveAxisEnd);
  }

  updatePercentOnAxis(ratio: number) {
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
