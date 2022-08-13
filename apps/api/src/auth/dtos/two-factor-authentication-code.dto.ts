/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   two-factor-authentication-code.dto.ts              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/14 00:54:22 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/14 00:54:23 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { IsNotEmpty, IsString } from 'class-validator';

export class TwoFactorAuthenticationCodeDto {
  @IsString()
  @IsNotEmpty()
  twoFactorAuthenticationCode: string;
}
