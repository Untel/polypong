import { OAuthService } from '../services/oauth.service';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-oauth2';
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class IntraStrategy extends PassportStrategy(Strategy, 'intra') {
  logger = new Logger('IntraStrategy');

  constructor(private readonly OAuthService: OAuthService) {
    super({
      authorizationURL: process.env.INTRA_AUTHORIZATION_URL,
      tokenURL: process.env.INTRA_TOKEN_ENDPOINT,
      clientID: process.env.INTRA_CLIENT_ID,
      clientSecret: process.env.INTRA_SECRET,
      callbackURL: process.env.INTRA_CALLBACK,
      scope: ['public'],
      proxy: true,
    });
  }

  async getUserProfile(accessToken: any) {
    this.logger.log(`validate - getUserProfile`);
    const { data } = await axios.get(
      `https://api.intra.42.fr/v2/me`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      },
    );
    return data;
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {

    this.logger.log(`validate`);
    const data = await this.getUserProfile(accessToken);
    this.logger.log(`data = ${data}`);
    this.logger.log(`email = ${data.email}`);
    const { email, first_name, last_name, image_url } = data;
    this.logger.log(`image_url = ${data.image_url}`);
    const user = await this.OAuthService.socialLogin({
      user: {
        email: email,
        name: `${first_name} ${last_name}`,
        avatar: image_url,
      },
      socialChannel: 'intra',
    });

    return { ...user };
  }
}
