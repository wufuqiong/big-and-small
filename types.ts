export type SizeTarget = 'big' | 'small';

export interface GameQuestion {
  objectName: string;
  emoji: string;
  targetAttribute: SizeTarget;
  colorHex: string; // Background color for the card
}

export interface AudioData {
  base64: string;
}

export enum GameState {
  WELCOME,
  LOADING,
  PLAYING,
  SUCCESS,
  FAILURE,
  GAME_OVER
}

export interface ScoreState {
  current: number;
  highScore: number;
}