/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   paddle.class.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: edal--ce <edal--ce@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/30 17:00:15 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/25 06:43:47 by edal--ce         ###   ########.fr       */
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
import GameTools from './gametools.class';
import { Power } from './power.class';
export class Paddle {
  axis: Line;
  color: string;
  line: Line;
  width: number;
  angle: number;
  maxAngle: number;
  index: number;
  ratio: number;
  interpolationStart: LineInterpolator;
  interpolationEnd: LineInterpolator;
  bounceAngle: number;
  initialSize: number;

  effects: { [key: string]: { count: number } };

  constructor(axis: Line, color: string, relativeSize = 0.4, bounce = 45) {
    this.initialSize = relativeSize;
    this.axis = axis;
    this.effects = {};
    this.color = color;
    this.angle = lineAngle(axis);
    this.angle = GameTools.angleNormalize(this.angle, 0, 360);
    this.bounceAngle = bounce;
    this.setRelativeSize(relativeSize);
    this.updatePercentOnAxis(0.5);
  }

  setRelativeSize(relativeSize?) {
    const relSize = relativeSize || this.initialSize;
    // console.log("REL SIZE", relSize, relativeSize, this.initialSize);
    // On cree un sous line sur laquelle le paddle va pouvoir glisser
    // qui correspond a 1 - width% de la line actuelle (+ width% de taille du Paddle)
    const preInterpolate = lineInterpolate(this.axis);
    const effectiveAxisStart: Line = [
      this.axis[0],
      preInterpolate(1 - relSize),
    ];
    const effectiveAxisEnd: Line = [preInterpolate(relSize), this.axis[1]];
    this.interpolationStart = lineInterpolate(effectiveAxisStart);
    this.interpolationEnd = lineInterpolate(effectiveAxisEnd);
  }

  updatePercentOnAxis(ratio: number) {
    this.ratio = ratio;
    const newPosStart = this.interpolationStart(ratio);
    const newPosEnd = this.interpolationEnd(ratio);
    this.line = [newPosStart, newPosEnd];
    this.width = lineLength(this.line);
    //Potential bug here
  }

  affectPower(power: Power) {
    if (!this.effects[power.name]) {
      this.effects[power.name] = { count: 0 };
      if (power.timeout) {
        this.timeoutEffect(power);
      }
    } else {
      this.effects[power.name].count += 1;
    }
  }

  timeoutEffect(power) {
    setTimeout(() => {
      const effect = this.effects[power.name];
      if (effect.count <= 0) {
        delete this.effects[power.name];
        power.fade(this);
      } else {
        effect.count -= 1;
        this.timeoutEffect(power);
      }
    }, power.timeout);
  }

  public get netScheme() {
    return {
      line: this.line,
      color: this.color,
      effects: this.effects,
    };
  }
}
