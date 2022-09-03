import { Circle, Collider2d, Vector } from 'collider2d';
import { Paddle } from 'src';
import { Ball } from './ball.class';
import Game from './game.class';

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
    };
  }

  abstract name;
  abstract timeout;
  abstract effect(ball: Ball);
}

export class AddBallPower extends Power {
  name: 'add-ball';
  timeout: 0;

  constructor(game: Game, position: Vector = new Vector(0, 0), radius = 2) {
    super(game, position, radius);
    this.name = 'add-ball';
  }
  effect() {
    this.game.addBall();
  }
}

export class ReduceAllOtherPaddlesPower extends Power {
  name: 'reduce-enemies';
  timeout: 6000;

  constructor(game: Game, position: Vector = new Vector(0, 0), radius = 2) {
    super(game, position, radius);
    this.name = 'reduce-enemies';
    this.timeout = 6000;
  }

  fade(paddle: Paddle) {
    paddle.setRelativeSize();
  }

  effect(ball: Ball) {
    this.game.paddles.forEach((paddle) => {
      if (paddle.color != ball.lastHitten?.color) {
        paddle.setRelativeSize(0.15);
        paddle.affectPower(this);
      }
    });
  }
}

export class AugmentPaddlePower extends Power {
  name: 'upsize-allies';
  timeout: 6000;

  constructor(game: Game, position: Vector = new Vector(0, 0), radius = 2) {
    super(game, position, radius);
    this.name = 'upsize-allies';
    this.timeout = 6000;
  }

  fade(paddle: Paddle) {
    paddle.setRelativeSize();
  }

  effect(ball: Ball) {
    this.game.paddles.forEach((paddle) => {
      if (paddle.color === ball.lastHitten?.color) {
        paddle.setRelativeSize(0.7);
        paddle.affectPower(this);
      }
    });
  }
}

export class SeeTrajectories extends Power {
  name: 'see-trajectories';
  timeout: 15000;

  constructor(game: Game, position: Vector = new Vector(0, 0), radius = 2) {
    super(game, position, radius);
    this.name = 'see-trajectories';
    this.timeout = 15000;
  }

  fade(paddle: Paddle) {}

  effect(ball: Ball) {}
}

export class SadiSlap extends Power {
  name: 'sadi-slap';
  timeout: null;

  constructor(game: Game, position: Vector = new Vector(0, 0), radius = 2) {
    super(game, position, radius);
    this.name = 'sadi-slap';
    this.timeout = null;
  }

  effect(ball: Ball) {
    ball.setAngle(Math.random() * (Math.PI * 2));
    ball.findTarget(false);
  }
}

export const PowerList = [
  AddBallPower,
  SadiSlap,
  ReduceAllOtherPaddlesPower,
  AugmentPaddlePower,
];
