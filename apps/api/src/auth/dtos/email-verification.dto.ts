/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   email-verification.dto.ts                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/14 00:54:02 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/14 00:54:03 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { IsEmail } from 'class-validator';

export class EmailVerificationDto {
  @IsEmail()
  email: string;
}
