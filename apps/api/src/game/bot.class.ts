import { Paddle } from './paddle.class';
import { Ball } from './ball.class';
import { Wall } from './wall.class';
import {
  lineLength,
  Line,
  Point,
  lineMidpoint,
} from 'geometric';
import { LobbyBot } from './lobbyBot.class';
import { copyFileSync } from 'fs';
import { Vector } from 'collider2d';
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
  precision: number;

  constructor(datas: Partial<Bot | LobbyBot> = {}) {
    Object.assign(this, datas);
    this.maxSpeed = this.level + 1;
    this.precision = 0.05;
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
    // this.level1(this.tasks[0].closestP)
    this.level1();
  }
  level2() {
    if (this.tasks.length !== 0)
    {
      this.level1();
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
  level1(coords = [0,0]) {
    if (this.tasks.length === 0) {
      return;
    }
    let focus : Point = [coords[0], coords[1]];
    if (!coords[0] && !coords[1])
      focus = this.tasks[0].targetInfo.actualhit;

    let dir : number = 0;
    const leftSideDist = lineLength([focus,this.wall.line[0]]);
    const totalDist = lineLength(this.wall.line);
    const paddleMidpoint = lineMidpoint(this.wall.paddle.line);
    const paddleMidpointDist = lineLength([paddleMidpoint, this.wall.line[0]]);

    const paddleMidRatio = GameTools.calculateRatio(paddleMidpointDist, totalDist);
    const ratio = GameTools.calculateRatio(leftSideDist, totalDist);
    if (ratio > paddleMidRatio + (this.precision / 2))
      dir = 1;
    else if (ratio < paddleMidRatio - (this.precision / 2))
      dir = -1;
    // God mode
    // let newPercent = ratio;
    let newPercent = this.wall.paddle.ratio + (dir * this.precision);
    newPercent = (newPercent < 0) ? 0 : newPercent;
    newPercent = (newPercent > 1) ? 1 : newPercent;
    this.wall.paddle.updatePercentOnAxis(newPercent);
  }

  popBall(target: Ball) {
    this.tasks.splice(this.tasks.indexOf(target), 1);
  }
  addBall(target: Ball) {
    this.tasks.push(target);
  }
}
