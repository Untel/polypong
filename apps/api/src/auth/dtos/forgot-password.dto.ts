/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   forgot-password.dto.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/14 00:54:05 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/14 00:54:06 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}
