import { Circle, Collider2d, Vector } from "collider2d";
import { Ball } from "./ball.class";
import Game from "./game.class";
import GameTools from "./gametools.class";

const collider = new Collider2d();

export abstract class Power extends Circle {
  game: Game;
  constructor(game: Game, position: Vector = new Vector(0, 0), radius = 2) {
    super(position, radius);
    this.game = game;
  }

  collideWithBall(ball: Ball) {
    const collide = collider.testCircleCircle(this, ball);
    return collide;
  }

  public get netScheme() {
    const { position, name } = this;
    return {
      position: {
        x: position.x,
        y: position.y,
      },
      name,
    }
  }

  abstract name;
  abstract timeout;
  abstract effect(ball: Ball);
}

export class AddBallPower extends Power {
  name: 'add-ball';
  timeout: 0;
  effect() {
    this.game.addBall();
  }
}

export class ReduceAllOtherPaddlesPower extends Power {
  name: 'reduce-enemies';
  timeout: 3000;

  expire(ball: Ball) {
    this.game.paddles.forEach((paddle) => {
        paddle.setRelativeSize(.2);
    });
  }

  effect(ball: Ball) {
    this.game.paddles.forEach((paddle) => {
      if (paddle != ball.lastHitten) {
        paddle.setRelativeSize(.13);
      }
    });
  }
}

export const PowerList = [
  AddBallPower,
  ReduceAllOtherPaddlesPower,
]
