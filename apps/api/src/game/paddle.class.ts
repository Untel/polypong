/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   paddle.class.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/30 17:00:15 by adda-sil          #+#    #+#             */
/*   Updated: 2022/09/09 04:04:46 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {
  Line,
  lineAngle,
  lineInterpolate,
  lineLength,
  angleToDegrees,
  LineInterpolator,
  Point,
  angleReflect,
  angleToRadians,
} from 'geometric';
import { Ball } from './ball.class';
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
  see = false;
  skill = true;
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

  bounceBall(ball: Ball, hitloc: Point) {
    if (!this.skill) return ball.bounceTargetWall();
    const npad = GameTools.angle180range(this.angle);
    const nball = GameTools.angle180range(angleToDegrees(ball.angle));
    const out =
      (lineLength([this.line[0], hitloc]) / lineLength(this.line) - 0.5) * 90;
    let newDegree = angleReflect(nball, npad) - out;
    newDegree = GameTools.angle180range(newDegree);
    const maxA =
      npad > GameTools.angle180range(npad + 180)
        ? npad
        : GameTools.angle180range(npad + 180);
    const minA = maxA === npad ? GameTools.angle180range(npad + 180) : npad;
    const dtmax = Math.abs(maxA - newDegree);
    const dtmin = Math.abs(minA - newDegree);

    if (minA < nball && nball < maxA) {
      // It's coming from inside
      if (minA < newDegree && newDegree < maxA) {
        if (dtmax > dtmin) newDegree = minA - 10;
        else newDegree = maxA + 10;
        console.log('Corrected ball');
      }
    } else {
      if (!(minA < newDegree && newDegree < maxA)) {
        if (dtmax > dtmin) newDegree = minA + 10;
        else newDegree = maxA - 10;
        console.log('Corrected ball');
      }
    }
    ball.setAngle(angleToRadians(newDegree));
    ball.findTarget();
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
      see: this.see,
      // effects: this.effects,
    };
  }
}
