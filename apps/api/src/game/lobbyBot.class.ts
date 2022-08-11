import { faker } from '@faker-js/faker';
import * as gravatar from 'gravatar';

export class LobbyBot {
  name: string;
  color: string;
  avatar: string;
  level: number;

  constructor(datas: Partial<LobbyBot> = {}) {
    Object.assign(this, datas);
    if (!this.level) this.level = 0;
    if (!this.name) this.name = `Beep Bop ${faker.name.fullName()}`;
    if (!this.avatar) this.avatar = faker.image.cats(300, 300, true);
    if (!this.color) this.color = 'red' || faker.color.rgb({ prefix: '#' });
  }
}
