/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   wall.class.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: edal--ce <edal--ce@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/30 17:00:29 by adda-sil          #+#    #+#             */
/*   Updated: 2022/07/11 10:06:03 by edal--ce         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Vector } from 'collider2d';
import { Line, lineLength, lineAngle } from 'geometric';
import { Ball } from './ball.class';
import { Bot } from './bot.class';
import { Paddle } from './paddle.class';

export class Wall {
  paddle: Paddle | null;
  bot: Bot | null;
  line: Line;
  width: number;
  angle: number;

  constructor(line: Line, paddle?: Paddle) {
    this.paddle = paddle;
    // this.bot = bot;
    this.angle = lineAngle(line); //degrees
    this.line = line;
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
    };
  }
}
