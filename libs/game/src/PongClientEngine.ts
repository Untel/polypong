/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PongClientEngine.js                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: edal--ce <edal--ce@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/05/03 05:01:44 by edal--ce          #+#    #+#             */
/*   Updated: 2022/05/11 15:31:45 by edal--ce         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { ClientEngine, ClientEngineInputOptions, KeyboardControls } from 'lance-gg';
import { PongRenderer, PongGame } from '.';

export class PongClientEngine extends ClientEngine<PongGame> {

	controls: KeyboardControls;
	gameEngine: PongGame;
	constructor(gameEngine: PongGame, options: ClientEngineInputOptions = {}) {


		// this.options = Object.assign({
		// 	autoConnect: true,
		// 	healthCheckInterval: 1000,
		// 	healthCheckRTTSample: 10,
		// 	stepPeriod: 1000 / GAME_UPS,
		// 	scheduler: 'render-schedule',
		// 	serverURL: null,
		// }, inputOptions);

		options.verbose = true;
		super(gameEngine, options, PongRenderer);
		// console.log("test");
		this.gameEngine = gameEngine;
		// PongGame.on('goal_c', this.renderer.updateScore.bind(this));
		this.controls = new KeyboardControls(this);
		// this.socket.on('goal', this.test.bind(this));
		// this.controls.bindKey('left', 'left', { repeat: true });
		// this.controls.bindKey('right', 'right', { repeat: true });
		this.controls.bindKey('up', 'up', { repeat: true });
		this.controls.bindKey('down', 'down', { repeat: true });
		this.controls.bindKey('space', 'space', { repeat: true });
		this.controls.bindKey('enter', 'enter', { repeat: true });
	}

	init() {
		// this.gameEngine.world.objects[0].syncto
	}

	start() {
		super.start();
		// this.GameEngine.on('client__draw', this.renderer.clientSideDraw.bind(this));

		this.gameEngine.once('renderer.ready', () => {

		});
		return Promise.resolve();
	}
	// change(e) {
	// 	// this.gameEngine.world.queryObject(Ball).position = e[0];
	// 	console.log(this.gameEngine.world.queryObject({ instanceType: Ball }))
	// 	this.gameEngine.world.queryObject({ instanceType: Ball }).position.x = e[0].x;
	// 	this.gameEngine.world.queryObject({ instanceType: Ball }).position.y = e[0].y;
	// 	this.gameEngine.world.queryObject({ instanceType: Ball }).velocity.x = e[1].x;
	// 	this.gameEngine.world.queryObject({ instanceType: Ball }).velocity.y = e[1].y;

	// 	// this.gameEngine.world.objects[0].position = e[0];
	// 	// this.gameEngine.world.objects[0].velocity = e[1];
	// 	// console.log(e);
	// }

	connect(opts = {}) {
		return super.connect(opts).then(() => {
			// this.socket.on('goal_c', (e) => {
			// 	// console.log("goal", e);
			// 	// this.gameEngine.p1_score = e;
			// 	// this.gameEngine.p2_score = f;
			// 	if (e)
			// 		this.renderer.updateScore(e);
			// });
			// this.socket.on('change', (e) => {
			// 	// this.change(e);
			// });
			// this.socket.on('score upd', (e) => {
			// 	console.log("goal")
			// })
			// this.socket.on('disconnect', (e) => {
			// 	console.log('disconnected');
			// 	document.body.classList.add('disconnected');
			// 	document.body.classList.remove('gameActive');
			// 	document.querySelector('#reconnect').disabled = false;
			// });

			// if ('autostart' in Utils.getUrlVars()) {
			// 	this.socket.emit('requestRestart');
			// }
		});
	}
}
