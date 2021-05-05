import {
  ClientAction,
  ClientPacket,
  ServerAction,
  ServerPacket,
} from '@brajkowski/connect4-multiplayer-common';

export class Connect4Client {
  private ws: WebSocket;
  private session: string;
  private user: string;
  private sessionCreatedCallback?: (sessionName: string) => any;
  private onOpponentJoinCallback?: (username: string) => any;
  private onOpponentMoveCallback?: (column: number) => any;

  open(address: string) {
    this.ws = new WebSocket(address);
    this.ws.onmessage = (event) => {
      this.onMessage(event.data);
    };
  }

  close() {
    this.ws.close();
  }

  createSession(user: string) {
    this.user = user;
    const packet: ClientPacket = {
      user: this.user,
      action: ClientAction.CREATE_SESSION,
    };
    this.ws.send(JSON.stringify(packet));
  }

  joinSession(session: string, user: string) {
    this.session = session;
    this.user = user;
    const packet: ClientPacket = {
      session: this.session,
      user: this.user,
      action: ClientAction.JOIN_SESSION,
    };
    this.ws.send(JSON.stringify(packet));
  }

  makeMove(column: number) {
    const packet: ClientPacket = {
      session: this.session,
      user: this.user,
      action: ClientAction.MOVE,
      column: column,
    };
    this.ws.send(JSON.stringify(packet));
  }

  onSessionCreated(callback: (sessionName: string) => any): void {
    this.sessionCreatedCallback = callback;
  }

  onOpponentJoin(callback: (username: string) => any): void {
    this.onOpponentJoinCallback = callback;
  }

  onOpponentMove(callback: (column: number) => any): void {
    this.onOpponentMoveCallback = callback;
  }

  private onMessage(data: any) {
    const packet: ServerPacket = JSON.parse(data.toString());
    switch (packet.action) {
      case ServerAction.SESSION_CREATED:
        this.session = packet.newSession;
        this.sessionCreatedCallback?.(this.session);
        break;
      case ServerAction.OPPONENT_JOIN:
        this.onOpponentJoinCallback?.(packet.user);
        break;
      case ServerAction.OPPONENT_MOVE:
        this.onOpponentMoveCallback?.(packet.column);
        break;
    }
  }
}
