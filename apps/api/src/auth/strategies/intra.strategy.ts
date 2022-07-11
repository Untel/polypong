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
      proxy: false,
    });
  }

  async getUserProfile(accessToken: string) {
    this.logger.log(`validate - getUserProfile`);
    const { data } = await axios.get(`https://api.intra.42.fr/v2/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return data;
  }

  async getUserCoalition(userId: number, accessToken: string) {
    this.logger.log(`validate - getUserCoalition`);
    const { data } = await axios.get(
      `https://api.intra.42.fr/v2/users/${userId}/coalitions`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return data;
  }

  async validate(
    accessToken: string,
    redirect: string
  ): Promise<any> {
    this.logger.log(`validate`, redirect);
    const data = await this.getUserProfile(accessToken);
    // this.logger.log(`data = ${data}`);
    // this.logger.log(`email = ${data.email}`);
    const { email, first_name, last_name, image_url, login, id, cursus } = data;
    // console.log("LOGIN DATA", Object.keys(data), data.patroned, data.patroning, data.roles);
    // this.logger.log(JSON.stringify(data));

    const dataCoa = await this.getUserCoalition(+id, accessToken);
    const coalition = dataCoa.reduce(
      (acc, next) =>
        acc ||
        (next.name === 'The Alliance' && 'alliance') ||
        (next.name === 'The Federation' && 'federation') ||
        (next.name === 'The Order' && 'order') ||
        (next.name === 'The Assembly' && 'assembly'),
      null,
    );
    // console.log('Has coa', coalition);
    const user = await this.OAuthService.socialLogin({
      email: email,
      name: login,
      avatar: image_url,
      coalition,
      socialChannel: 'intra',
    });

    // console.log("User is", user);

    return { ...user };
  }
}
