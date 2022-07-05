/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ball.class.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: edal--ce <edal--ce@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/30 16:59:43 by adda-sil          #+#    #+#             */
/*   Updated: 2022/07/05 01:44:28 by edal--ce         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Circle, Vector } from 'collider2d';
import { Line, lineLength, Point, lineAngle, angleToDegrees, angleToRadians, angleReflect } from 'geometric';
import GameTools from './gametools.class';
import Triangle from 'triangle-solver'
import { Wall } from './wall.class';
export class Ball extends Circle {
  _speed = 1;
  direction: Vector;
  angle: number;
  // target: {
  //   hit: Point,
  //   index: number,
  // };
  target: any;
  // newTarget: any;
  newTarget: any;
  targetInfo: any;
  adjacent: any;
  alpha: any;

  constructor(startPos: Vector = new Vector(0, 0), radius = 3) {
    super(startPos, radius);
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
    const fakeBall = this.clone();
    for (let i = 0; i < 100; i++) fakeBall.move();

    const line: Line = [
      [fakeBall.position.x, fakeBall.position.y],
      // [tx, ty],
      [this.position.x, this.position.y],
    ];

    const [[x1, y1], [x2, y2]] = line;
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
          edge,
          index: i,
        };
        let values = { //letter pairs i.e. a-A are opposite to each other as seen on picture above
          // a: 3, //lowercase letters corresponds to sides length 
          // c: Int,
          // A: 90, //uppercase letters corresponds to angle in degrees
          // C: angleToDegrees(this.angle),
          // B: 25
        }
        // let test = new Triangle(values);
        // console.log("new,", test)

        // test.solve();
        // console.log("solved,", test)
        // console.log(test);

        // let test: any = Triangle.triangleBySideAndTwoNearAngles(3, angleToDegrees(this.angle), 90);
        // console.log("resolved, ", test);
        let intersectionVector: Vector = new Vector(intersection.x - this.position.x, intersection.y - this.position.y);
        console.log("Intersection vector / normalized", [intersectionVector, intersectionVector.normalize()]);
        // console.log("Normalized             ", intersectionVector.normalize());
        console.log("Dist to target :", lineLength([[this.position.x, this.position.y], [this.target.hit[0], this.target.hit[1]]]));
        const incidenceAngle = angleToDegrees(this.angle)
        console.log("Incidence angle is :", incidenceAngle);
        console.log("Surface angle  is :", wall.angle);
        let alpha: number;

        // if (incidenceAngle > wall.angle) {
        //   alpha = (incidenceAngle - wall.angle) % 90;
        //   values = {
        //     b: 3,
        //     B: alpha,
        //     A: 90
        //   };
        //   console.log("block1", alpha)
        // }
        // else {
        alpha = wall.angle - incidenceAngle;
        if (alpha < 0)
          alpha += 360;
        // alpha =
        if (alpha > 90)
          alpha = 180 - alpha
        console.log("final angle is ", alpha);

        values = {
          b: 3,
          B: alpha,
          A: 90
        }
        // console.log("block2", alpha)

        // }

        let test = new Triangle(values);
        // console.log(test)
        test.solve()
        // console.log(test)
        console.log("Dist between hit and acutal is ", test.sides.a)
        // this.limit = test.sides.a;
        //   alpha
        // console.log("incid is bigger ", (incidenceAngle - wall.angle) % 90)
        // else
        // console.log("wall is bigger ", )

        // console.log("reflected would be ", angleReflect(angleToDegrees(this.angle), wall.angle))
        // console.log("final would be ", 180 - angleReflect(angleToDegrees(this.angle), wall.angle))

        // const newDegree = 90 - angleReflect(this.angle, surfac eAngleDeg);

        // console.log("Target angle is :", wall.angle);
        // console.log("diff  = ", (wall.angle - angleToDegrees(this.angle)) % 180);
        // var sub1 = angleToDegrees(this.angle) - wall.angle;
        // if (sub1 > 180)
        //   sub1 -= 180
        // console.log("sub1  = ", sub1);

        this.targetInfo = {
          limit: test.sides.a,
          edgeIndex: i,
          edge,
          ...intersection,
        };
        break;
      }
      this.target = { hit: [0, 0], index: 0 };
      this.targetInfo = null;
    }
    // this.adjustTarget(this.target.edge);
  }
  applyNew() {

  }
  adjustTarget(wall) {
    // console.log([this.angle, lineAngle(wall)])
    // console.log("Ball angle :", angleToDegrees(this.angle));
    // console.log("Walllangle  :", lineAngle(wall));
    let alpha = (lineAngle(wall) - angleToDegrees(this.angle)) % 360;
    // console
    if (alpha < 0)
      alpha += 360
    if (alpha > 90)
      alpha = 180 - alpha;
    // console.log("angle attaque", alpha)
    var hypothenuse = this.radius / Math.sin(alpha * (Math.PI / 180))
    // console.log("hypothenuse len", hypothenuse);

    var adjacent = (this.radius / Math.tan(alpha * (Math.PI / 180)));
    // console.log("adjacent len", adjacent);
    // console.log("opposé", this.radius)
    // console.log("check pytha", (hypothenuse * hypothenuse), " vs ", (adjacent * adjacent) + (this.radius * this.radius))

    var dt: any;

    var vec1: Vector = new Vector(this.target.hit[0] - wall[0][0], this.target.hit[1] - wall[0][1]);

    var vec2: Vector = new Vector(this.target.hit[0] - wall[1][0], this.target.hit[1] - wall[1][1]);
    // console.log("check out vectors :", [vec1, vec2]);
    dt = adjacent
    // var v1: [number, number];
    // var v2: [number, number];
    // // v1.push()
    // v1[0] = 0;
    // v1[1] = this.radius;

    // let rvx = GameTools.vectorRotate(0, this.radius, alpha * (Math.PI / 180));
    let rvx = GameTools.vectorRotate(adjacent, this.radius, angleToRadians(alpha))// * (Math.PI / 180));
    // console.log("rvx", rvx);
    // console.log("rvy", rvy);

    // rvx[0] += rvy[0];
    // rvx[1] += rvy[1];
    this.alpha = alpha;
    this.adjacent = adjacent;
    this.newTarget = [this.target.hit[0] + rvx[0], this.target.hit[1] + rvx[1]]
    // console.log("old target", this.target.hit)
    // this.target.hit = newTarget;
    // // console.log("ratios"
    // console.log("new target", this.newTarget)
    // console.log("ratios,", this.newTarget[0] / this.target.hit[0], "and ", this.newTarget[1] / this.target.hit[1]);
    // v1[0] = ad
    // g("v2, ", v2);

    // var newEnd = lineLength(this.target.hit)
    // alpha = alpha >= 0 ? alpha : alpha + 360;
    // console.log("wall : ", wall)
    // let x1, x2, y1, y2
    // x1 = this.position.x;
    // y1 = this.position.y;
    // x2 = this.target.hit[0];
    // y2 = this.target.hit[1];

    // var dx = x2 - x1
    // var dy = y2 - y1
    // var ang = Math.atan2(dy, dx) * 180 / Math.PI;
    // console.log("ang is", ang);
    // console.log(`Effective attack angle is ${alpha}`)


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
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      newTarget: this.newTarget,
      radius: this.radius,
      target: {
        ...this.target,
        hit: {
          x: this.target.hit[0],
          y: this.target.hit[1],
        },
      },
      targetInfo: this.targetInfo,
      targetDistance: this.targetDistance,
    };
  }
}
