/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   verify-email-token.dto.ts                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/14 00:54:29 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/14 00:54:30 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { IsNotEmpty } from 'class-validator';

export class VerifyEmailTokenDto {
  @IsNotEmpty()
  token: string;
}
