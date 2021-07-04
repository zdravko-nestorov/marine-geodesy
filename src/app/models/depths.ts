export class Depths {
  id: number;
  timeDiff: string;
  timeDiffInMillis: number;
  height: number;
  heightWithDelta: number;
  heightWithBaseAndDelta: number;

  constructor(id: number,
              timeDiff: string,
              timeDiffInMillis: number,
              height: number,
              heightWithDelta: number,
              heightWithBaseAndDelta: number) {

    this.id = id;
    this.timeDiff = timeDiff;
    this.timeDiffInMillis = timeDiffInMillis;
    this.height = height;
    this.heightWithDelta = heightWithDelta;
    this.heightWithBaseAndDelta = heightWithBaseAndDelta;
  }

  isValid(): boolean {
    return !!(this.id && this.timeDiff && this.timeDiffInMillis && this.height && this.heightWithDelta && this.heightWithBaseAndDelta);
  }
}
