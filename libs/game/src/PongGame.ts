import { GameEngine, TwoVector, SimplePhysicsEngine } from 'lance-gg';
// import { Ball, Wall, Paddle } from '.';

import { Ball } from './Ball'
import { Wall } from './Wall'
import { Paddle } from './Paddle'

console.log("I am the pong game");

const PADDING = 10;
const WIDTH = 400;
const HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 50;

export class ObjectSize {
	width: number;
	height: number;
}

export class PongSettings extends ObjectSize {

}

export class PongGame extends GameEngine<SimplePhysicsEngine, PongSettings> {

	width: number;
	height: number;

	constructor(options: any) {
		super(options);
		this.worldSettings = {
			height: 800,
			width: 800,
		};
		this.width = 800;
		this.height = 800;
		this.on('collisionStart', this.ColisionEngine.bind(this));
		this.on('postStep', this.test.bind(this));
		this.physicsEngine = new SimplePhysicsEngine({
			gameEngine: this,
			collisions: { type: 'bruteForce', autoResolve: false },
			gravity: new TwoVector(0, 0),
		});
	}

	test(stepnb, isreenact) {
		let ball = this.world.queryObject({ instanceType: Ball });
		if (!ball)
			return;
		if (ball.position.x < 0 || ball.position.x > this.width) {
			ball.bounce_side();
			ball.position.x = (ball.position.x < 0) ? 0 : this.width;
		}
		if (ball.position.y < 0 || ball.position.y > this.height) {
			ball.bounce_top();
			ball.position.y = (ball.position.y < 0) ? 0 : this.width;
		}
	}

	start() {
		super.start();
	}

	correct(event) {
		let ball = this.world.queryObject({ instanceType: Ball });
		if (ball.position.x > this.width)
			ball.position.x = this.width - 1;
		if (ball.position.x < 0)
			ball.position.x = 1;
	}

	registerClasses(serializer) {
		serializer.registerClass(Paddle);
		serializer.registerClass(Ball);
		serializer.registerClass(Wall);
	}

	before() {

	}

	gameLogic() {

	}

	ColisionEngine(e) {
		let collisionObjects = Object.keys(e).map(k => e[k]);

		let ball = collisionObjects.find(o => o instanceof Ball);
		let paddle = collisionObjects.find(o => o instanceof Paddle);
		let wall = collisionObjects.find(o => o instanceof Wall);

		if (ball && paddle) {
			if (ball.position.x > this.width - PADDING) {
				console.log("weird hit");
				ball.bounce_top();
			}
			else if (ball.position.x < - 1) {
				console.log("weird hit 2");
				ball.bounce_top();;
			}
			else
				ball.bounce_side();
			ball.last_player = paddle.playerId;
		}
		else if (ball && wall) {
			if (wall.playerId === -1) {
				ball.bounce_top()
			}
			else {
				this.emit('goal', ball.last_player);
				// console.log("Hitting wall id :",wall.playerId )
				ball.bounce_side();
			}
		}
	}

	processInput(inputData, playerId, isServer) {
		super.processInput(inputData, playerId, isServer);
		if (isServer === false) {
			// console.log("Player input ", playerId);
			return;
		}
		let playerPaddle = this.world.queryObject({ instanceType: Paddle, playerId: playerId });
		let ball = this.world.queryObject({ instanceType: Ball });
		if (inputData.input === 'enter') {
			ball.reset();
		}
		if (inputData.input === 'space') {
			ball.launch();
		}
		if (playerPaddle) {
			if (inputData.input === 'up' && playerPaddle.position.y > 0)
				playerPaddle.moveUp();
			else if (inputData.input === 'down' && playerPaddle.position.y < this.height - PADDLE_HEIGHT)
				playerPaddle.moveDown();
		}
	}
}