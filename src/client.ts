import {
  ClientAction,
  ClientPacket,
  ServerAction,
  ServerPacket,
} from '@brajkowski/connect4-multiplayer-common';

export class Connect4Client {
  private ws: WebSocket;
  private sessionName: string;
  private username: string;
  private onOpenCallback?: () => any;
  private sessionCreatedCallback?: (sessionName: string) => any;
  private joinedSessionCallback?: (opponentUsername: string) => any;
  private sessionNotFoundCallback?: () => any;
  private onOpponentJoinCallback?: (username: string) => any;
  private onOpponentMoveCallback?: (column: number) => any;
  private onOpponentQuitCallback?: () => any;
  private onGameRestartCallback?: (thisClientStartsFirst: boolean) => any;
  private onSessionEndedCallback?: () => any;
  private onCloseCallback?: () => any;

  open(address: string) {
    this.ws = new WebSocket(address);
    this.ws.onopen = (event) => {
      this.onOpenCallback?.();
    };
    this.ws.onclose = (event) => {
      this.onCloseCallback?.();
    };
    this.ws.onmessage = (event) => {
      this.onMessage(event.data);
    };
  }

  close() {
    this.ws.close();
  }

  createSession(username: string) {
    this.username = username;
    const packet: ClientPacket = {
      user: this.username,
      action: ClientAction.CREATE_SESSION,
    };
    this.ws.send(JSON.stringify(packet));
  }

  joinSession(session: string, username: string) {
    this.sessionName = session;
    this.username = username;
    const packet: ClientPacket = {
      session: this.sessionName,
      user: this.username,
      action: ClientAction.JOIN_SESSION,
    };
    this.ws.send(JSON.stringify(packet));
  }

  makeMove(column: number) {
    const packet: ClientPacket = {
      session: this.sessionName,
      user: this.username,
      action: ClientAction.MOVE,
      column: column,
    };
    this.ws.send(JSON.stringify(packet));
  }

  quit() {
    const packet: ClientPacket = {
      session: this.sessionName,
      user: this.username,
      action: ClientAction.QUIT,
    };
    this.ws.send(JSON.stringify(packet));
    this.close();
  }

  onOpen(callback: () => any): void {
    this.onOpenCallback = callback;
  }

  onSessionCreated(callback: (sessionName: string) => any): void {
    this.sessionCreatedCallback = callback;
  }

  onJoinedSession(callback: (opponentUsername: string) => any): void {
    this.joinedSessionCallback = callback;
  }

  onSessionNotFound(callback: () => any): void {
    this.sessionNotFoundCallback = callback;
  }

  onOpponentJoin(callback: (username: string) => any): void {
    this.onOpponentJoinCallback = callback;
  }

  onOpponentMove(callback: (column: number) => any): void {
    this.onOpponentMoveCallback = callback;
  }

  onOpponentQuit(callback: () => any): void {
    this.onOpponentQuitCallback = callback;
  }

  onGameRestart(callback: (thisClientStartsFirst: boolean) => any): void {
    this.onGameRestartCallback = callback;
  }

  onSessionEnded(callback: () => any): void {
    this.onSessionEndedCallback = callback;
  }

  onClose(callback: () => any): void {
    this.onCloseCallback = callback;
  }

  private onMessage(data: any) {
    const packet: ServerPacket = JSON.parse(data.toString());
    switch (packet.action) {
      case ServerAction.SESSION_CREATED:
        this.sessionName = packet.newSession;
        this.sessionCreatedCallback?.(this.sessionName);
        break;
      case ServerAction.JOINED_SESSION:
        this.joinedSessionCallback?.(packet.user);
        break;
      case ServerAction.SESSION_NOT_FOUND:
        this.sessionNotFoundCallback?.();
      case ServerAction.OPPONENT_JOIN:
        this.onOpponentJoinCallback?.(packet.user);
        break;
      case ServerAction.OPPONENT_MOVE:
        this.onOpponentMoveCallback?.(packet.column);
        break;
      case ServerAction.OPPONENT_QUIT:
        this.close();
        this.onOpponentQuitCallback?.();
        break;
      case ServerAction.GAME_RESTART:
        this.onGameRestartCallback?.(packet.thisClientStartsFirst);
        break;
      case ServerAction.SESSION_ENDED:
        this.close();
        this.onSessionEndedCallback?.();
        break;
    }
  }
}
