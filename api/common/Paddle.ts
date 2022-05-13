/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Paddle.js                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: edal--ce <edal--ce@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/05/02 22:24:33 by edal--ce          #+#    #+#             */
/*   Updated: 2022/05/11 15:22:13 by edal--ce         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { GameEngine, BaseTypes, TwoVector, DynamicObject, KeyboardControls, SimplePhysicsEngine } from 'lance-gg';
import { Ball, PongGame } from '.';
// import { Game } from './PongGameGame'

const PADDING = 10;
const WIDTH = 400;
const HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 50;

export class Paddle extends DynamicObject<PongGame, SimplePhysicsEngine> {

    score: number;

    constructor(gameEngine, options, props) {
        super(gameEngine, options, props);
        this.width = 10;
        this.height = 50;
        this.position = (props && props.position) || new TwoVector(0, 0);
        this.score = 0;
        this.isStatic = 1;
        // this.health = 0;
        // this.position = props?.position ?? new TwoVector(0, 0);
    }

    //Everything is already synced up
    static get netScheme() {
        return Object.assign({
            score: { type: BaseTypes.TYPES.INT16 }
        }, super.netScheme);
    }

    get bending() {
        return {
            velocity: { percent: 0.0 },
            position: { percent: 1.0 }
        };
    }
    //

    // collidesWith(other) {

    //     return (other instanceof Ball);
    //     // if (other instanceof Ball)
    //     //     return true;
    //     // else
    //     //     return false;
    // }

    onAddToWorld() {
        console.log(this);
    }

    syncTo(other) {
        super.syncTo(other);
        this.score = other.score
        // console.log('-------------------------------------');
        // console.log(this);
        // console.log('-------------------------------------');

        // this.score = other.score;
    }

    moveUp() {
        this.position.y -= 5;
        if (this.position.y < 0)
            this.position.y = 0;
    }
    moveDown() {
        this.position.y += 5;
        if (this.position.y > this.gameEngine.height - PADDLE_HEIGHT)
            this.position.y = this.gameEngine.height - PADDLE_HEIGHT;
    }

}
