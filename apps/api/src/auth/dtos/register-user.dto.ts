/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   register-user.dto.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/14 00:54:13 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/14 00:54:14 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { IsEmail, IsNotEmpty } from 'class-validator';
import { CoalitionChoice } from 'src/user/user.entity';

export class RegisterUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  coalition: CoalitionChoice;
}
