/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Ball.js                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: edal--ce <edal--ce@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/05/02 22:24:39 by edal--ce          #+#    #+#             */
/*   Updated: 2022/05/13 15:27:40 by edal--ce         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { GameEngine, BaseTypes, TwoVector, DynamicObject, KeyboardControls, SimplePhysicsEngine } from 'lance-gg';
import { PongGame } from './PongGame';
export class Ball extends DynamicObject<PongGame, SimplePhysicsEngine> {

	lastPaddle: number;

	constructor(gameEngine, options, props) {
		super(gameEngine, options, props);
		this.position = (props && props.position) || new TwoVector(0, 0);
		this.width = 10;
		this.height = 10;
	}

	reset() {
		this.position = new TwoVector(this.gameEngine.width / 2, this.gameEngine.height / 2);
		this.velocity = new TwoVector(0, 0);
	}


	//Not sure of what this does
	// avoid gradual synchronization of velocity
	get bending() {
		return {
			velocity: { percent: 1.0 },
			position: { percent: 1.0 }
		};
	}

	collidesWith(other) {
		return true;
	}
	bounce_side() {
		// console.log('boing dx:', this.velocity.x);
		// console.log('boing dy:', this.velocity.y);
		// console.log("pos: ", this.position)
		this.velocity.x = (this.velocity.x > 0) ? (this.velocity.x + 0.5) * -1 : (this.velocity.x - 0.5) * -1
		// if (this.velocity.x > 0)
		// 	this.velocity.x += 0.5;
		// else
		// 	this.velocity.x += 0.5;
		// this.velocity.x *= -1;
		// this.accelerate(2);
		// this.position.x 
		// this.velocity = new TwoVector(this.velocity.x * -1, this.velocity.y);
	}
	bounce_top() {
		// console.log('boing dx:', this.velocity.x);
		// console.log('boing dy:', this.velocity.y);
		// this.velocity = new TwoVector(this.velocity.x, this.velocity.y * -1);
		// console.log("pos: ", this.position)
		this.velocity.y *= -1;
	}
	syncTo(other) {
		super.syncTo(other);
		this.lastPaddle = other.lastPaddle;
		// other.velocity = this.velocity;
	}
	launch() {
		this.velocity = new TwoVector(2, 1)
		// this.velocity = new TwoVector(Math.floor(Math.random() * 5), Math.floor(Math.random() * 5));
	}
}
