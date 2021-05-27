# Connect 4 Multiplayer: Client

[![Build](https://github.com/brajkowski/connect4-multiplayer-client/actions/workflows/build.yml/badge.svg)](https://github.com/brajkowski/connect4-multiplayer-client/actions/workflows/build.yml)
[![npm:latest](https://img.shields.io/npm/v/@brajkowski/connect4-multiplayer-client/latest?color=limegreen&logo=npm)](https://www.npmjs.com/package/@brajkowski/connect4-multiplayer-client)
[![npm:beta](https://img.shields.io/npm/v/@brajkowski/connect4-multiplayer-client/beta?logo=npm)](https://www.npmjs.com/package/@brajkowski/connect4-multiplayer-client)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

A websocket-based client that connects users to connect 4 multiplayer game sessions.

## Installation

Using npm:

```
$ npm i --save @brajkowski/connect4-multiplayer-client
```

## Usage

This client is designed to connect to an instance of the [connect4-multiplayer-server](https://github.com/brajkowski/connect4-multiplayer-server).
To use the client, simply create an instance and open a connection to the server:

```ts
const client: Connect4Client = new Connect4Client();
client.open('wss://my-multiplayer-server-instance.myhost.com');
```

From there you can either create a new multiplayer session or join an existing session:

```ts
client.createSession(username);
// or
client.joinSession(sessionName, username);
```

The [Connect4Client](src/client.ts) object provides methods to perform actions such as placing a chip or leaving the session:

```ts
client.makeMove(0); // Sends action to server to place chip in first column.
client.quit(); // Gracefully leave the multiplayer session and alert the server.
```

Finally there are several methods to write custom callbacks in order to handle actions that are coming from the server:

```ts
onOpen(callback: () => any)
onSessionCreated(callback: (sessionName: string) => any)
onSessionJoined(callback: (opponentUsername: string) => any)
onSessionNotFound(callback: () => any)
onOpponentJoin(callback: (username: string) => any)
onOpponentMove(callback: (column: number) => any)
onOpponentQuit(callback: () => any)
onGameRestart(callback: (thisClientStartsFirst: boolean) => any)
onSessionEnded(callback: () => any)
onClose(callback: () => any)
```

### Example: Tying it all together

```ts
const client: Connect4Client = new Connect4Client();
client.onOpen(() => client.createSession(username));
client.onSessionCreated((sessionName) => shareSessionName(sessionName));
client.onOpponentJoin((username) => {
  setOpponentUsername(username);
  promptUserForMove(); // The session creator always goes first.
});
client.onOpponentMove((column) => {
  trackOpponentChipPlacement(column);
  promptUserForMove();
});
client.onGameRestart((thisClientStartsFirst) => {
  resetGameState();
  if (thisClientStartsFirst) promptUserForMove(); // Server decides who goes first.
});
client.open('wss://my-multiplayer-server-instance.myhost.com');
```

## Building from Source

Using npm:

```
$ npm run build
```

will produce the compiled library under `/dist`.
