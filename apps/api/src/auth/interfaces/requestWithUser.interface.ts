/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   requestWithUser.interface.ts                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/14 00:54:48 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/14 00:54:49 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Request } from 'express';
import { User } from 'src/user/user.entity';

interface RequestWithUser extends Request {
  user: User;
}

export default RequestWithUser;
