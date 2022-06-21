export class Position {
  x: number = 0;
  y: number = 0;
  w: number = 0;
  h: number = 0;
}

export class Paddle {
  pos: Position = { x: 0, y: 0, w: 0, h: 0 };
  angle: number = 0;
  line: Array<Array<number>> = [[0, 0], [0, 0]];
}

export class Ball {
  position: Position = { x: 0, y: 0, w: 0, h: 0 };
}
