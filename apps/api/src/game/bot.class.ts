import { Paddle } from './paddle.class';
import { Ball } from './ball.class';
import { Wall } from './wall.class';
import {
  lineLength,
  Line,
  Point,
} from 'geometric';
import { LobbyBot } from './lobbyBot.class';
import { copyFileSync } from 'fs';
export class Bot {
  botPaddle: Paddle;
  maxSpeed: number;
  edge: Line;
  wall: Wall;
  tasks: Ball[] = [];
  dir: number;
  name: string;
  color: string;
  level: number;

  constructor(datas: Partial<Bot | LobbyBot> = {}) {
    Object.assign(this, datas);
  }
  attachWall(wall: Wall) {
    this.wall = wall;
    this.wall.addBot(this);
  }
  think() {
    switch (this.level) {
      case 0:
        this.level1();
        break;
      case 1:
        this.level2();
        this.level1();
        break;
      case 2:
        this.level3();
        break;
      default:
        this.level1();
    }
  }
  level3() {
    if (this.tasks.length === 0)
    {
      this.level2();
      return;
    }
    this.tasks.sort((b) => b.targetDistance / b.direction.len());
    this.level1(this.tasks[0].closestP)
  }
  level2() {
    if (this.tasks.length !== 0 || this.wall.paddle.ratio === 0.5) {
      return;
    }
    const offset = this.wall.paddle.ratio > 0.5 ? -0.01 : +0.01;
    const ratio = this.wall.paddle.ratio;
    if (
      (offset > 0 && offset + ratio > 0.5) ||
      (offset < 0 && offset + ratio < 0.5)
    ) {
      this.wall.paddle.updatePercentOnAxis(0.5);
    } else {
      this.wall.paddle.updatePercentOnAxis(ratio + offset);
    }
  }
  level1(id = [0,0]) {
    if (this.tasks.length === 0) {
      return;
    }
    let focus : number[] = id;

    if (id[0] === id[1] && id[0] === 0)
      focus = this.tasks[0].targetInfo.actualhit;  
    const rSideDist = lineLength([
      this.wall.paddle.line[1],
      [focus[0], focus[1]]
    ]);
    const lSideDist = lineLength([
      this.wall.paddle.line[0],
      [focus[0], focus[1]]
    ]);
    console.log("focus :", focus);
    console.log("paddle :", this.wall.paddle.line)
    console.log("left :", lSideDist);
    console.log("right :", rSideDist);

    if (Math.abs(rSideDist - lSideDist) < 0.5) {
      // console.log("returnnig at ",Math.abs(rSideDist - lSideDist))
      return;
    }
    if (rSideDist > lSideDist) {
      this.wall.paddle.updatePercentOnAxis(
        this.wall.paddle.ratio - (0.01 * this.level) >= 0 ? this.wall.paddle.ratio - (0.01 * this.level) : 0,
      );
      console.log("move left");
    }
    else if (rSideDist < lSideDist) {
      this.wall.paddle.updatePercentOnAxis(
        this.wall.paddle.ratio + (0.01 * this.level) <= 1 ? this.wall.paddle.ratio + (0.01 * this.level) : 1,
      );
      console.log("move right");
    }
    // console.log("ret");
  }

  // think() {
  //   // console.log("thinking")
  //   if (this.tasks.length === 0) return; //Maybe go towards center instead?
  //   const focus: Ball = this.tasks[0];
  //   // let distToTgt = lineLength([lineMidpoint(this.wall.paddle.line), focus.targetInfo.actualhit]);
  //   const rSideDist = lineLength([
  //     this.wall.paddle.line[1],
  //     focus.targetInfo.actualhit,
  //   ]);
  //   const lSideDist = lineLength([
  //     this.wall.paddle.line[0],
  //     focus.targetInfo.actualhit,
  //   ]);

  //   if (Math.abs(rSideDist - lSideDist) < 0.5) {
  //     return;
  //   }
  //   if (rSideDist > lSideDist) {
  //     this.wall.paddle.updatePercentOnAxis(
  //       this.wall.paddle.ratio - 0.01 >= 0 ? this.wall.paddle.ratio - 0.01 : 0,
  //     );
  //   } //if (lSideDist > rSideDist) {
  //   else {
  //     this.wall.paddle.updatePercentOnAxis(
  //       this.wall.paddle.ratio + 0.01 <= 1 ? this.wall.paddle.ratio + 0.01 : 1,
  //     );
  //   }

  //   // }
  // }
  popBall(target: Ball) {
    this.tasks.splice(this.tasks.indexOf(target), 1);
  }
  addBall(target: Ball) {
    this.tasks.push(target);
  }
}
