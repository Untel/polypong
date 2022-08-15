/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   config.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/15 01:10:30 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/15 01:10:30 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { ConfigService } from '@nestjs/config';

export function asyncConfig(moduleName: string) {
  return {
    useFactory: (configService: ConfigService) => configService.get(moduleName),
    inject: [ConfigService],
  };
}
