/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum GameStatus {
  PLAYING = 'PLAYING',
  WON = 'WON',
}

export enum GuessResult {
  TOO_HIGH = 'TOO_HIGH',
  TOO_LOW = 'TOO_LOW',
  CORRECT = 'CORRECT',
  INVALID = 'INVALID',
}

export interface GuessHistory {
  value: number;
  result: GuessResult;
  timestamp: number;
}

export interface GameState {
  targetNumber: number;
  guesses: GuessHistory[];
  status: GameStatus;
  message: string;
}
