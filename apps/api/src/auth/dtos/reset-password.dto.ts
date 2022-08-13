/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   reset-password.dto.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/14 00:54:16 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/14 00:54:35 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  password: string;
}
