/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   paddle.class.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/30 17:00:15 by adda-sil          #+#    #+#             */
/*   Updated: 2022/07/04 00:11:31 by adda-sil         ###   ########.fr       */
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
  color: string;
  line: Line;
  width: number;
  angle: number;
  index: number;
  interpolationStart: LineInterpolator;
  interpolationEnd: LineInterpolator;
  bounceAngle: number;

  constructor(axis: Line, index: number, relativeSize = 0.2, bounce = 45) {
    this.index = index;
    this.color = GameTools.colors[index % GameTools.colors.length];
    this.angle = lineAngle(axis);
    this.bounceAngle = bounce;
    // On cree un sous line sur laquelle le paddle va pouvoir glisser
    // qui correspond a 1 - width% de la line actuelle (+ width% de taille du Paddle)
    const preInterpolate = lineInterpolate(axis);
    const effectiveAxisStart: Line = [axis[0], preInterpolate(1 - relativeSize)];
    const effectiveAxisEnd: Line = [preInterpolate(relativeSize), axis[1]];
    this.interpolationStart = lineInterpolate(effectiveAxisStart);
    this.interpolationEnd = lineInterpolate(effectiveAxisEnd);
    this.updatePercentOnAxis(0.5);
    this.width = lineLength(this.line);
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
