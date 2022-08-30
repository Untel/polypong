import { CoalitionChoice } from './coalition';

export interface User {
  id: number,
  name: string,
  coalition: CoalitionChoice,
  email: string,
  avatar: string,
  inLobby?: boolean,
  inGame?: boolean,
  isTwoFactorAuthenticationEnabled?: boolean,
}
