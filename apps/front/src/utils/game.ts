export class Position {
  x = 0;

  y = 0;
}

export class Paddle {
  pos: Position = { x: 0, y: 0 };

  angle = 0;

  line: Array<Array<number>> = [[0, 0], [0, 0]];
}

export class Ball {
  position: Position = { x: 0, y: 0 };

  target: any;
}
