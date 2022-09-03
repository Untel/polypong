/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ball.class.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: edal--ce <edal--ce@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/30 16:59:43 by adda-sil          #+#    #+#             */
/*   Updated: 2022/09/03 13:51:56 by edal--ce         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Circle, Vector } from 'collider2d';
import {
  Line,
  lineLength,
  Point,
  lineAngle,
  angleToDegrees,
  angleToRadians,
  angleReflect,
} from 'geometric';
import GameTools from './gametools.class';
import Triangle from 'triangle-solver';
import { Wall } from './wall.class';
import { Paddle } from './paddle.class';
import Game from './game.class';
export class Ball extends Circle {
  _speed = 1;
  maxSpeed = 1.5;
  direction: Vector;
  angle: number;
  lastHitten?: Paddle;
  closestP: Point = [0, 0];
  target: {
    hit: Point;
    wall: Wall;
  };
  color: string;
  targetInfo: any;
  adjacent: any;
  alpha: number;
  freezeTime: number;
  game: Game;

  constructor(game: Game, startPos: Vector = new Vector(0, 0), radius = 2) {
    super(startPos, radius);
    this.game = game;
    this.color = `#${GameTools.genRanHex(6)}`;
    this.direction = new Vector(0, 0);
    this.freezeTime = 150;
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
    return Object.assign({}, this);
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

  findTarget(ignorePreviousWall = true) {
    const walls = this.game.walls;
    const reach = this.direction.clone().scale(100);
    const fakePos = this.position.clone().add(reach);
    if (walls.length < 3) return;
    const line: Line = [
      [fakePos.x, fakePos.y],
      [this.position.x, this.position.y],
    ];
    if (this.target) this.target.wall.clearBall(this);
    const [[x1, y1], [x2, y2]] = line;
    for (let i = 0; i < walls.length; i++) {
      const wall: Wall = walls[i];
      if (ignorePreviousWall && wall === this.target?.wall) {
        continue;
      }
      const edge: Line = wall.line;
      const [[x3, y3], [x4, y4]] = edge;
      const intersection = GameTools.lineIntersection(
        [
          [x1, y1],
          [x2, y2],
        ],
        [
          [x3, y3],
          [x4, y4],
        ],
      );

      if (intersection) {
        this.target = {
          hit: [intersection.x, intersection.y],
          wall,
        };
        if (!this.unFreeze(0)) wall.addBall(this);

        const incidenceAngle = angleToDegrees(this.angle);

        //This is code used to find the position the ball is going to hit the line but not cross it
        const normvector: Vector = new Vector(
          this.target.wall.line[0][0] - this.target.wall.line[1][0],
          this.target.wall.line[0][1] - this.target.wall.line[1][1],
        ).normalize();

        const alpha: number = wall.angle - incidenceAngle;
        GameTools.angleNormalize(alpha, 0, 360);

        //Come constants used to solve the pythagorean equation
        const values = {
          b: 3,
          B: alpha,
          A: 90,
        };
        const t: Triangle = new Triangle(values);
        t.solve();
        normvector.scale(t.sides.c);

        this.targetInfo = {
          actualhit: [
            normvector.x + this.target.hit[0],
            normvector.y + this.target.hit[1],
          ],
          // limit: test.sides.a,
          edgeIndex: i,
          edge,
          ...intersection,
        };
        break;
      }
    }
    this.game.socket.emit(
      'object',
      this.game.balls.findIndex((b) => b === this),
      'ball',
      this.netScheme,
    );
  }
  move() {
    if (this.unFreeze(1)) return;
    this.position.x = this.position.x + this.direction.x;
    this.position.y = this.position.y + this.direction.y;
  }

  reset(position: Vector = new Vector(0, 0)) {
    this.setAngle(GameTools.getRandomFloatArbitrary(0, Math.PI * 2));
    this.position.x = position.x;
    this.position.y = position.y;
  }

  unFreeze(value = 150) {
    if (this.freezeTime === 0) return false;
    this.freezeTime = this.freezeTime - value < 0 ? 0 : this.freezeTime - value;
    if (this.freezeTime > 0) return true;
    if (this.target?.wall) this.target.wall.addBall(this);
    return false;
  }

  collideWithBall(compared: Ball) {
    if (this.unFreeze(0)) return;
    const dist = lineLength([this.point, compared.point]);
    if (dist < this.radius + compared.radius) {
      const delta = compared.position.clone().sub(this.position);
      const diff = delta.dot(compared.direction.clone().sub(this.direction));
      return diff < 0;
    }
  }

  swapAngles(compared: Ball) {
    const tmpAngle = this.angle;
    this.setAngle(compared.angle);
    compared.setAngle(tmpAngle);
  }

  bounceTargetWall() {
    const incidenceAngleDeg = angleToDegrees(this.angle);
    const surfaceAngleDeg = lineAngle(this.target.wall.line); //paddle.angle;
    const newDegree = angleReflect(incidenceAngleDeg, surfaceAngleDeg);
    const newAngle = angleToRadians(newDegree);
    this.setAngle(newAngle);
    this.findTarget();
  }

  bouncePaddle(paddle: Paddle, hitloc: number[]) {
    const incidenceAngleDeg = angleToDegrees(this.angle) % 360;
    const surfaceAngleDeg = paddle.angle; //paddle.angle;
    const newDegree = angleReflect(incidenceAngleDeg, surfaceAngleDeg);

    /**
     * @TODO Le but ici etait de rajouter plus ou moins d'angle suivant ou on tape
     * sur la raquette. Cependant ca mene a des bugs sur certaines map en passant la balle derriere
     * le paddle. Peut etre remettre ca en 1v1 only?
     */
    const hitLen = lineLength([paddle.line[1], [hitloc[0], hitloc[1]]]);
    // On calcul le pourcentage de hit sur le paddle -0.5 pour avoir un % compris entre -.5 et .5
    // Comme ca taper au millieu devrait etre 0 et ne pas rajouter d'angle
    // x2 pour aller de -1 a x1;
    const percent = (hitLen / paddle.width - 0.5) * 2;
    // const maxAngle = Math.abs((surfaceAngleDeg - incidenceAngleDeg) / 2);
    // console.log('Hit percent', percent);
    const maxAngle = 25;
    const addDeg = maxAngle * percent;

    const newAngle = angleToRadians(
      newDegree + GameTools.angleNormalize(addDeg, 0, 360),
    );
    // console.log(`New angle is : ${newAngle} made from ${angleToRadians(newDegree)} and ${addDeg}`)
    this.lastHitten = paddle;
    this.color = paddle.color;
    this.setAngle(newAngle);
    this.findTarget();
  }

  increaseSpeed(ratio = this.speed * 0.1) {
    if (this.unFreeze(0)) return;
    this.speed += ratio;
    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
      // console.log("Max ball speed reached");
    }
  }

  stop() {
    this.speed = 0;
    this.direction = new Vector(0, 0);
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
    const x = this.target?.hit[0] ? this.target.hit[0] : 0;
    const y = this.target?.hit[1] ? this.target.hit[1] : 0;
    if (this.target) {
      return {
        color: this.color,
        position: {
          x: this.position.x,
          y: this.position.y,
        },
        radius: this.radius,
        target: {
          x: x,
          y: y,
        },
      };
    }
  }
}
