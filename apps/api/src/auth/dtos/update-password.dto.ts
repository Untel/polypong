/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   update-password.dto.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/14 00:54:25 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/14 00:54:26 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { IsNotEmpty } from 'class-validator';

export class UpdatePasswordDto {
  @IsNotEmpty()
  oldPassword: string;

  @IsNotEmpty()
  newPassword: string;
}
