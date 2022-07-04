/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ball.class.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/30 16:59:43 by adda-sil          #+#    #+#             */
/*   Updated: 2022/07/04 02:22:16 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Circle, Vector } from 'collider2d';
import e from 'express';
import { angleReflect, angleToDegrees, angleToRadians, Line, lineAngle, lineLength, Point } from 'geometric';
import GameTools from './gametools.class';
import { Paddle } from './paddle.class';
import { Wall } from './wall.class';

export class Ball extends Circle {
  _speed = 1;
  maxSpeed = 1.5;
  direction: Vector;
  angle: number;
  lastHitten?: Paddle;
  target: {
    hit: Point,
    wall: Wall,
  };
  color: string;

  constructor(startPos: Vector = new Vector(0, 0), radius = 2) {
    super(startPos, radius);
    this.color = `#${GameTools.genRanHex(6)}`;
  }

  public get speed() {
    return this._speed;
  }
  public set speed(value: number) {
    // this._speed = FRAME_RATE / value * 100;
    // Do somethings with framerate here to have same value if we are in 60 or 30 fps
    this._speed = value;
  }

  clone() {
    const newBall = new Ball(
      new Vector(this.position.x, this.position.y),
      this.radius,
    );
    newBall.setAngle(this.angle);
    return newBall;
  }

  setAngle(angle: number) {
    this.angle = angle;
    const x = Math.cos(angle) * this.speed;
    const y = Math.sin(angle) * this.speed;
    this.direction = new Vector(x, y);
  }

  /**
   * Sert a predire la prochaine fois ou la balle devrait rebondir
   * Permet nottament de ne pas tester 60 * par secondes si la balle collide avec un des N cotes du polygon, ou un des N paddle.
   * Une fois qu'on a le prochain point d'impact, il suffit calculer la distance entre la balle et la Target
   * @see public get targetDistance()
   */
  findTarget(walls: Wall[]) {
    const reach = this.direction.clone().scale(100);
    const fakePos = this.position.clone().add(reach);
    const line: Line = [
      [fakePos.x, fakePos.y],
      [this.position.x, this.position.y],
    ];

    const [[x1, y1], [x2, y2]] = line;
    let collided = false;
    for (let i = 0; i < walls.length; i++) {
      const wall: Wall = walls[i];
      const edge: Line = wall.line;
      const [[x3, y3], [x4, y4]] = edge;
      const intersection = GameTools.lineIntersection(
        x1,
        y1,
        x2,
        y2,
        x3,
        y3,
        x4,
        y4,
      );

      if (intersection) {
        this.target = {
          hit: [intersection.x, intersection.y],
          wall,
        };
        collided = true;
        break;
      }
    }
    if (!collided) {
      console.log("something strange happened", this.angle);
      // this.reset();
    }
  }

  move() {
    this.position.x = this.position.x + this.direction.x;
    this.position.y = this.position.y + this.direction.y;
  }

  reset(position: Vector = new Vector(0, 0)) {
    this.setAngle(GameTools.getRandomFloatArbitrary(0, Math.PI * 2));
    this.position.x = position.x;
    this.position.y = position.y;
  }

  collideWithBall(compared: Ball) {
    const dist = lineLength([this.point, compared.point]);
    if (dist < (this.radius + compared.radius)) {
      const delta = compared.position.clone().sub(this.position);
      const diff = delta.dot(compared.direction.clone().sub(this.direction));
      return (diff < 0);
    }
  }

  swapAngles(compared: Ball) {
    const tmpAngle = this.angle;
    this.setAngle(compared.angle);
    compared.setAngle(tmpAngle);
  }

  bounceTargetWall(walls: Wall[]) {
    const incidenceAngleDeg = angleToDegrees(this.angle);
    const surfaceAngleDeg = lineAngle(this.target.wall.line); //paddle.angle;
    const newDegree = angleReflect(incidenceAngleDeg, surfaceAngleDeg);
    const newAngle = angleToRadians(newDegree);
    this.setAngle(newAngle);
    this.findTarget(walls);
  }

  bouncePaddle(paddle: Paddle, walls: Wall[]) {
    const incidenceAngleDeg = angleToDegrees(this.angle);
    const surfaceAngleDeg = paddle.angle; //paddle.angle;
    let newDegree = angleReflect(incidenceAngleDeg, surfaceAngleDeg);
    const hitLen = lineLength([paddle.line[1], this.target.hit]);
    // On calcul le pourcentage de hit sur le paddle -0.5 pour avoir un % compris entre -.5 et .5
    // Comme ca taper au millieu devrait etre 0 et ne pas rajouter d'angle
    const percent = hitLen / paddle.width - .5;
    const addDeg = (percent * paddle.bounceAngle);
    newDegree += addDeg;
    const newAngle = angleToRadians(newDegree);
    this.lastHitten = paddle;
    this.color = paddle.color;
    this.setAngle(newAngle);
    this.findTarget(walls);
  }

  increaseSpeed(ratio = 1.1) {
    this.speed *= ratio;
    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
      // console.log("Max ball speed reached");
    }
  }

  /**
   * Distance entre la balle et son prochain point d'impact
   * @see public get findTarget()
   */
  public get targetDistance() {
    const length = lineLength([
      [this.position.x, this.position.y],
      this.target.hit,
    ]);
    return length;
  }

  public get point(): Point {
    return [this.position.x, this.position.y];
  }
  public get netScheme() {
    return {
      color: this.color,
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      radius: this.radius,
      target: {
        hit: {
          x: this.target.hit[0],
          y: this.target.hit[1],
        },
      },
    };
  }
}