import Lobby, { LobbyId } from "./lobby.class";

export default class Player {
  socketId: string;
  inLobby: LobbyId | null;

  constructor(socketId) {
    this.socketId = socketId;
  }
}
