/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   wall.class.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/30 17:00:29 by adda-sil          #+#    #+#             */
/*   Updated: 2022/06/30 17:00:30 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Vector } from 'collider2d';
import { Line } from 'geometric';
import { Paddle } from './paddle.class';

export class Wall {
  paddle: Paddle | null;
  line: Line;
  constructor(line: Line, paddle?: Paddle) {
    this.paddle = paddle;
    this.line = line;
  }
}
