import { Paddle } from './paddle.class';
import Player from './player.class';
import { Ball } from './ball.class';
import { Wall } from './wall.class';
import {
  lineLength,
  Line,
  pointLeftofLine,
  pointRightofLine,
  lineMidpoint,
  pointOnLine,
} from 'geometric';
import GameTools from './gametools.class';
export class Bot {
  botPaddle: Paddle;
  maxSpeed: number;
  edge: Line;
  wall: Wall;
  tasks: Ball[] = [];
  dir: number;
  name: string;

  constructor() {
    this.name = 'Beep boop';
  }
  attachWall(wall: Wall) {
    this.wall = wall;
    this.wall.addBot(this);
  }
  think() {
    // console.log("thinking")
    if (this.tasks.length === 0) return; //Maybe go towards center instead?
    const focus: Ball = this.tasks[0];
    // let distToTgt = lineLength([lineMidpoint(this.wall.paddle.line), focus.targetInfo.actualhit]);
    const rSideDist = lineLength([
      this.wall.paddle.line[1],
      focus.targetInfo.actualhit,
    ]);
    const lSideDist = lineLength([
      this.wall.paddle.line[0],
      focus.targetInfo.actualhit,
    ]);

    if (Math.abs(rSideDist - lSideDist) < 0.5) {
      return;
    }
    if (rSideDist > lSideDist) {
      this.wall.paddle.updatePercentOnAxis(
        this.wall.paddle.ratio - 0.01 >= 0 ? this.wall.paddle.ratio - 0.01 : 0,
      );
    } //if (lSideDist > rSideDist) {
    else {
      this.wall.paddle.updatePercentOnAxis(
        this.wall.paddle.ratio + 0.01 <= 1 ? this.wall.paddle.ratio + 0.01 : 1,
      );
    }

    // }
  }
  popBall(target: Ball) {
    this.tasks.splice(this.tasks.indexOf(target), 1);
  }
  addBall(target: Ball) {
    this.tasks.push(target);
  }
}
