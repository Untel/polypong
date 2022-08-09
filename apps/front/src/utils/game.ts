export interface Position {
  x: number;
  y: number;
}

export type Line = Array<Array<number>>;
export interface Paddle {
  line: Line;
  color: string;
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
