/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Wall.js                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: edal--ce <edal--ce@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/05/02 22:24:36 by edal--ce          #+#    #+#             */
/*   Updated: 2022/05/05 16:00:08 by edal--ce         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { GameEngine, BaseTypes, TwoVector, DynamicObject, KeyboardControls, SimplePhysicsEngine } from 'lance-gg';
import { PongGame } from './PongGame';
export class Wall extends DynamicObject<PongGame, SimplePhysicsEngine> {

    height: number;
    width: number;
    playerId: number;
    position: TwoVector;

    constructor(gameEngine, options, props) {
        super(gameEngine, options, props);
        this.height = (props && props.height); //|| new TwoVector(0, 0);
        this.width = (props && props.width); //|| new TwoVector(0, 0);
        this.position = (props && props.position) || new TwoVector(0, 0);
        this.playerId = (props && props.playerId) || 0;
        this.isStatic = 1;
    }

    syncTo(other) {
        super.syncTo(other);
    }
    static get netScheme() {
        return Object.assign({
            playerId: { type: BaseTypes.TYPES.INT16 },
        }, super.netScheme);
    }
}
