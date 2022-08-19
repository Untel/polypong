/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   user.decorator.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/09 13:34:16 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/19 03:34:01 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
