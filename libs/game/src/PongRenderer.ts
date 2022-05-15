import { GameEngine, ClientEngine, Renderer, BaseTypes, TwoVector, DynamicObject, KeyboardControls, SimplePhysicsEngine } from 'lance-gg';
// import { Ball, Paddle,  Wall, PongGame, PongClientEngine } from '.';
import { Ball } from "./Ball"
import { PongGame } from "./PongGame"
import { PongClientEngine } from "./PongClientEngine"

export class PongRenderer extends Renderer<PongGame, PongClientEngine> {

	constructor(PongGame, PongClientEngine) {
		super(PongGame, PongClientEngine);
	}
	
	init() {
		this.gameEngine.emit('client__rendererReady');
		return Promise.resolve();
	}


	draw(t, dt) {
		function drawBorder(el, obj) {
			el.style.width = obj.width;
			el.style.height = obj.height;
			el.style.top = 0;
			el.style.left = 0;

		}
		function drawPaddle(el, obj) {
			el.textContent = obj.score;
			el.style.width = obj.width;// + 5;
			el.style.height = obj.height;
			el.style.top = obj.position.y;
			el.style.left = obj.position.x;
			// el.style.top = obj.position.y- (obj.height / 2) + 'px';
			// el.style.left = obj.position.x- (obj.width / 2) + 'px';
		}
		function drawWall(el, obj) {
			el.style.width = obj.width;// + 5;
			el.style.height = obj.height;
			el.style.top = obj.position.y;
			el.style.left = obj.position.x;
			// el.style.top = obj.position.y- (obj.height / 2) + 'px';
			// el.style.left = obj.position.x- (obj.width / 2) + 'px';
		}
		function dball(el, obj) {
			el.style.top = obj.position.y; //- (obj.height / 2) + 'px';
			el.style.left = obj.position.x;// - (obj.width / 2) + 'px';
			el.style.width = obj.width;
			el.style.height = obj.height;
			// console.log("dball");
		}
		super.draw(t, dt);
		// let now = Date.now();

		// if (!this.isReady) return; // assets might not have been loaded yet
		let worldWidth = (this.gameEngine.worldSettings as any).width;
		let worldHeight = (this.gameEngine.worldSettings as any).height;

		// let
		// console.log(this.gameEngine)
		drawBorder(qs('.world'), this.gameEngine);
		// this.drawScore();
		// this.updateScore();
		this.gameEngine.world.forEachObject((objData) => {
			if (objData instanceof Ball)
				dball(qs('.ball'), objData);
			else {
				switch (objData.id) {
					case 1:
						drawPaddle(qs('.paddle1'), objData);
						break;
					case 2:
						drawPaddle(qs('.paddle2'), objData);
						break;
				}
			}
		});
	}
}
function qs(selector) { return document.querySelector(selector); }