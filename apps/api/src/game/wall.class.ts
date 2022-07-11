/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   wall.class.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: edal--ce <edal--ce@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/30 17:00:29 by adda-sil          #+#    #+#             */
/*   Updated: 2022/07/05 00:01:57 by edal--ce         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Vector } from 'collider2d';
import { Line, lineLength, lineAngle } from 'geometric';
import { Paddle } from './paddle.class';

export class Wall {
  paddle: Paddle | null;
  line: Line;
  width: number;
  angle: number;
  constructor(line: Line, paddle?: Paddle) {
    this.paddle = paddle;
    this.angle = lineAngle(line); //degrees
    this.line = line;
    this.width = lineLength(line);
  }

  public get netScheme() {
    return {
      width: this.width,
      line: this.line,
    };
  }
}
