import { Type } from 'class-transformer';
import { User } from 'src/user';
import Lobby, { LobbyId } from './lobby.class';

export default class Player {
  // socketId: string;
  @Type(() => User)
  user: User;
  inLobby: LobbyId | null;

  constructor(user: User) {
    this.user = user;
  }

  public get id() {
    return this.user.id;
  }
}
