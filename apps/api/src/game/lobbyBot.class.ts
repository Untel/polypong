import { faker } from '@faker-js/faker';

export class LobbyBot {
  name: string;
  avatar: string;
  level: number;
  color: string;

  constructor(datas: Partial<LobbyBot> = {}) {
    Object.assign(this, datas);
    if (!this.level) this.level = 0;
    if (!this.name) this.name = `Beep Bop ${faker.name.fullName()}`;
    if (!this.avatar) this.avatar = faker.image.cats(300, 300, true);
    if (!this.color) this.color = faker.color.rgb({ prefix: '#' });
  }
}
