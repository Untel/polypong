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
  color: string;
  level: number;

  constructor(datas: Partial<Bot> = {}) {
    Object.assign(this, datas);
    console.log("This bot level is", this.level);
    this.level++;
  }
  attachWall(wall: Wall) {
    this.wall = wall;
    this.wall.addBot(this);
  }
  think() {
    switch (this.level) {
        case 1:
            this.level1();
            break;
        case 2:
            this.level2();
            this.level1();
            break;
        case 3:
          this.level2();
          this.level1();
          break;
    }
  }
  level2() {
    if (this.tasks.length !== 0 || this.wall.paddle.ratio === 0.5) {
        return;
    }
    let offset: number;
    const ratio: number = this.wall.paddle.ratio;
    offset = (this.wall.paddle.ratio > 0.5) ? -0.01 : + 0.01;
    if ((offset > 0 && (offset + ratio > 0.5)) || (offset < 0 && (offset + ratio < 0.5))) {
        this.wall.paddle.updatePercentOnAxis(0.5);
    }
    else {
        this.wall.paddle.updatePercentOnAxis(ratio + offset);
    }

}
  level1(id: number = 0) {
    if (this.tasks.length === 0) {
        return;
    }

    const focus: Ball = this.tasks[id];
    // console.log(this.tasks.length);

    let rSideDist = lineLength([this.wall.paddle.line[1], focus.targetInfo.actualhit]);
    let lSideDist = lineLength([this.wall.paddle.line[0], focus.targetInfo.actualhit]);

    if (Math.abs(rSideDist - lSideDist) < 0.5) {
        return;
    }
    if (rSideDist > lSideDist) {
        this.wall.paddle.updatePercentOnAxis(
            (this.wall.paddle.ratio - 0.01) >= 0 ?
                (this.wall.paddle.ratio - 0.01) : 0)
    }
    else //if (lSideDist > rSideDist) {
    {
        this.wall.paddle.updatePercentOnAxis(
            (this.wall.paddle.ratio + 0.01) <= 1 ?
                this.wall.paddle.ratio + 0.01 : 1)
    }
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
