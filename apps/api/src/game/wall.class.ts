/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   wall.class.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/30 17:00:29 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/11 17:35:29 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Vector } from 'collider2d';
import { Line, lineLength, lineAngle } from 'geometric';
import { Ball } from './ball.class';
import { Bot } from './bot.class';
import { Paddle } from './paddle.class';
import Player from './player.class';

export class Wall {
  paddle: Paddle | null;
  bot: Bot | null;
  line: Line;
  width: number;
  angle: number;
  player: Player | null;

  constructor(line: Line, paddle?: Paddle, player?: Player | Bot) {
    this.paddle = paddle;
    // console.log('New wall with paddle', paddle);
    if (player instanceof Player) this.player = player;
    else if (player instanceof Bot) this.bot = player;
    this.line = line;
    this.angle = lineAngle(line); //degrees
    this.width = lineLength(line);
  }
  addBot(bot: Bot) {
    this.bot = bot;
  }
  clearBall(target: Ball) {
    if (this.bot) {
      this.bot.popBall(target);
    }
  }
  addBall(target: Ball) {
    if (this.bot) {
      this.bot.addBall(target);
    }
  }

  public get netScheme() {
    return {
      width: this.width,
      line: this.line,
      player: this.player,
    };
  }
}
