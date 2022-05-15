/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PongServerEngine.js                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: edal--ce <edal--ce@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/05/05 03:33:04 by edal--ce          #+#    #+#             */
/*   Updated: 2022/05/11 16:38:33 by edal--ce         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { TwoVector, SimplePhysicsEngine, ServerEngine, GameEngine } from 'lance-gg';
// import { Ball, Paddle, PongGame, Wall } from ".";

import { Ball } from "./Ball";
import { Paddle } from "./Paddle";
import { PongGame } from "./PongGame";
import { Wall } from "./Wall";

const PADDING = 10;
const WIDTH = 400;
const HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 50;

export class PongServerEngine extends ServerEngine<SimplePhysicsEngine> {
	constructor(io, gameEngine: PongGame, inputOptions) {
		super(io, gameEngine, inputOptions);
		// this.options.timeoutInterval = 0;
		this.gameEngine.on('goal', this.goal.bind(this));
	}

	start() {
		super.start();
		this.init();
	}

	init() {
		this.gameEngine.addObjectToWorld(new Ball(this.gameEngine, null, { position: new TwoVector(50, 50), velocity: new TwoVector(0, 0) }));
		this.gameEngine.addObjectToWorld(new Paddle(this.gameEngine, null, { playerID: 0, position: new TwoVector(0, 0) }));
		this.gameEngine.addObjectToWorld(new Paddle(this.gameEngine, null, { playerID: 0, position: new TwoVector((this.gameEngine.worldSettings as any).width - PADDLE_WIDTH, 0) }));

		// let leftWall = new Wall(this.gameEngine, null, { playerId: 0, position: new TwoVector(0, 0), width: 1, height: this.gameEngine.height + 5 });
		// let rightWall = new Wall(this.gameEngine, null, { playerId: 0, position: new TwoVector(this.gameEngine.width, 0), width: 1, height: this.gameEngine.height + 5 });
		// let topWall = new Wall(this.gameEngine, null, { playerId: -1, position: new TwoVector(0, 0), width: this.gameEngine.width + 5, height: 1 });
		// let bottomWall = new Wall(this.gameEngine, null, { playerId: -1, position: new TwoVector(0, this.gameEngine.height), width: this.gameEngine.width + 5, height: 1 });


		// this.gameEngine.addObjectToWorld(leftWall);
		// this.gameEngine.addObjectToWorld(rightWall);
		// this.gameEngine.addObjectToWorld(topWall);
		// this.gameEngine.addObjectToWorld(bottomWall);
	}

	onPlayerConnected(ev) {
		super.onPlayerConnected(ev);
		let paddles = this.gameEngine.world.queryObjects({ instanceType: Paddle, playerId: 0 });
		let walls = this.gameEngine.world.queryObjects({ instanceType: Wall, playerId: 0 });
		if (paddles.length > 0 && walls.length > 0) {
			paddles[0].playerId = ev.playerId;
			walls[0].playerId = ev.playerId;
		}
	}

	onPlayerDisconnected(ev, e) {
		super.onPlayerDisconnected(ev, e);
		let paddles = this.gameEngine.world.queryObjects({ instanceType: Paddle, playerId: e });
		let walls = this.gameEngine.world.queryObjects({ instanceType: Wall, playerId: e });
		if (paddles.length > 0) {
			walls[0].playerId = 0;
			paddles[0].playerId = 0;
		}
	}

	goal(id) {
		let paddles = this.gameEngine.world.queryObject({ instanceType: Paddle, playerId: id });
		if (paddles) {
			paddles.score++;
		}
	}
}