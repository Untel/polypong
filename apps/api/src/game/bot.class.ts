import { Paddle } from './paddle.class';
import Player from './player.class';
import { Ball } from './ball.class';
import { Wall } from './wall.class';
import { lineLength, Line, pointLeftofLine, pointRightofLine, lineMidpoint, pointOnLine } from 'geometric';
import GameTools from './gametools.class';
export class Bot extends Player {
    botPaddle: Paddle;
    maxSpeed: number;
    edge: Line;
    wall: Wall;
    tasks: Ball[] = [];
    // id: number;
    // dir: number;
    level: number;
    constructor(wall: Wall, id: number, level: number = 2) {
        super(id);
        this.level = level;
        // this.botPaddle = paddle;
        // this.wall = paddle.
        this.wall = wall;
        wall.addBot(this);
        // this.id = id;
    }
    think() {
        switch (this.level) {
            case 1:
                this.level1();
                break;
            case 2:
                this.level2();
                this.level1();
        }
        // console.log("thinking")


        // }
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
    popBall(target: Ball) {
        this.tasks.splice(this.tasks.indexOf(target), 1)
    }
    addBall(target: Ball) {
        this.tasks.push(target);
    }

}
