export class Coordinates {
  time: string;
  timeDiffWithDeltaInMillis: number;
  x: string;
  y: string;

  constructor(time: string,
              timeDiffWithDeltaInMillis: number,
              x: string,
              y: string) {

    this.time = time;
    this.timeDiffWithDeltaInMillis = timeDiffWithDeltaInMillis;
    this.x = x;
    this.y = y;
  }

  isValid(): boolean {
    return !!(this.time && this.timeDiffWithDeltaInMillis && this.x && this.y);
  }
}
