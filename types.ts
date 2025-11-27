export type SizeTarget = 'big' | 'small';

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

export interface GameObject {
  name: string;
  emoji: string;
  colorHex: string;
  isBig: boolean; // 这个物品是大还是小
}

export interface GameQuestion {
  object1: GameObject;
  object2: GameObject;
  targetAttribute: 'big' | 'small'; // 要找的是大的还是小的
  correctObject: 1 | 2; // 正确的物品是第一个还是第二个
}