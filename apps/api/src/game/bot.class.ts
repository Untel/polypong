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
    this.maxSpeed = this.level + 1;
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

    const paddlePoint = lineMidpoint(this.wall.paddle.line);    
    const dBall: Vector = new Vector(focus[0] - this.wall.line[0][0],focus[1] - this.wall.line[0][1] )
    const dPaddle : Vector = new Vector(paddlePoint[0]- this.wall.line[0][0], paddlePoint[1]- this.wall.line[0][1])

 
    const bLen = dBall.len()
    const pLen = dPaddle.len()
  

    if (Math.abs(pLen - bLen) < 1) {
      console.log("stop");
    return;
    }
    if (pLen >  bLen) {
      this.wall.paddle.updatePercentOnAxis(
        this.wall.paddle.ratio - (0.01 * this.maxSpeed) >= 0 ? this.wall.paddle.ratio - (0.01 * this.maxSpeed) : 0,
      );
      console.log("move right");
    }
    else 
    {
      this.wall.paddle.updatePercentOnAxis(
        this.wall.paddle.ratio + (0.01 * this.maxSpeed) <= 1 ? this.wall.paddle.ratio + (0.01 * this.maxSpeed) : 1,
      );
      console.log("move left");
    }
  }

  popBall(target: Ball) {
    this.tasks.splice(this.tasks.indexOf(target), 1);
  }
  addBall(target: Ball) {
    this.tasks.push(target);
  }
}
