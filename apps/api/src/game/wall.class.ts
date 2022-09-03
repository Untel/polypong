/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   wall.class.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: edal--ce <edal--ce@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/30 17:00:29 by adda-sil          #+#    #+#             */
/*   Updated: 2022/09/03 07:50:23 by edal--ce         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Exclude, Type } from 'class-transformer';
import { Vector } from 'collider2d';
import { Line, lineLength, lineAngle, lineMidpoint } from 'geometric';
import { Ball } from './ball.class';
import { Bot } from './bot.class';
import { Paddle } from './paddle.class';
import Player from './player.class';

export class Wall {
  @Type(() => Paddle)
  paddle: Paddle | null;
  bot: Bot | null;
  line: Line;
  width: number;
  angle: number;
  @Exclude()
  // @Type(() => Player)
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
  getMiddlePoint() {
    return (lineMidpoint(this.line));
  }

  public get netScheme() {
    return {
      width: this.width,
      line: this.line,
      player: { user: { id: this.player?.id } },
    };
  }
}
