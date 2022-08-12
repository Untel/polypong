import { Player } from 'src/stores/lobbies.store';

export interface Position {
  x: number;
  y: number;
}

export type Line = Array<Array<number>>;
export interface Paddle {
  line: Line;
  color: string;
}

export interface Wall {
  line: Line,
  player?: Player
}

export interface PolygonMap {
  inradius: number;
  verticles: number[];
  angles: number[];
  walls: Wall[];
}
export interface Ball {
  color: string;
  position: Position;
  target: {
    hit: Position;
  };
}

export interface Power {
  position: Position;
}
