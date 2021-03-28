import { Connect4Client } from './client';
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
let isOwnerMove = true;

function prompt(prompt: string): Promise<number> {
  return new Promise((resolve) =>
    rl.question(prompt, (response: number) => {
      resolve(response);
    })
  );
}

function promptMoveLoop() {
  prompt('Pending move, enter value 1-7: ').then((response) => {
    console.log(response);
    isOwnerMove ? owner.makeMove(response) : opponent.makeMove(response);
    isOwnerMove = !isOwnerMove;
    promptMoveLoop();
  });
}

const session = 'test-session';
const ownerUsername = 'owner';
const opponentUsername = 'opponent';
const address = 'ws://localhost:8080';
const owner = new Connect4Client();
const opponent = new Connect4Client();

owner.open(address);
opponent.open(address);

setTimeout(() => {
  owner.createSession(session, ownerUsername);
}, 500);
setTimeout(() => {
  opponent.joinSession(session, opponentUsername);
  promptMoveLoop();
}, 600);
