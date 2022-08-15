/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   multer.config.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/15 02:11:19 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/15 02:14:21 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { registerAs } from '@nestjs/config';
import { MulterModuleOptions } from '@nestjs/platform-express';
import multer from 'multer';
import path from 'path';
import RequestWithUser from 'src/auth/interfaces/requestWithUser.interface';

export const MulterConfig = registerAs(
  'multer',
  (): MulterModuleOptions => ({
    storage: multer.diskStorage({
      destination: (req, _file, callback) => {
        let path = 'uploads';
        if (req.path.includes('user/setAvatar')) {
          path += '/avatar';
        }
        callback(null, path);
      },
      filename: (req: RequestWithUser, file, cb) => {
        let filename = '';
        if (req.path.includes('user/setAvatar')) {
          filename = `avatar_${req.user.id}`;
        } else {
          filename = file.originalname + '_' + Date.now();
        }
        cb(null, filename + path.extname(file.originalname));
      },
    }),
  }),
);
