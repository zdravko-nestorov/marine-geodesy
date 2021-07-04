import {saveAs} from 'file-saver';
import {AppConstants} from '../constants/app-constants';

export class AppUtils {

  public static parseFile(file: File, processLine: (items: string[]) => void, onSuccess: any, onError: any): void {
    const fileReader: FileReader = new FileReader();
    this.attachFileListeners(fileReader, processLine, onSuccess, onError);
    this.readFileContent(file, fileReader, onError);
  }

  public static exportToCsv(filename: string, rows: object[]): void {
    const csvContent: string = this.createFileContent(rows);
    this.saveFileContent(filename, csvContent);
  }

  public static timeInMillis(time: string): number {
    const timeParts: string[] = time.split(' ');
    return (+timeParts[0] * 1000 * 60 * 60) + (+timeParts[1] * 1000 * 60) + (+timeParts[2] * 1000);
  }

  public static timeWithDeltaInMillis(time: string, separator?: string, delta?: string): number {
    const date: Date = this.timeToDatetime(time, separator);
    return this.timeDifferenceInMillis(date, delta);
  }

  public static heightWithDelta(height: number, delta: number): number {
    delta = delta || 0;
    return Math.abs(height) + delta;
  }

  public static heightWithBaseAndDelta(height: number, base: number, delta: number): number {
    base = base || 0;
    return Math.abs(base - this.heightWithDelta(height, delta));
  }

  private static attachFileListeners(fileReader: FileReader, processLine: (items: string[]) => void, onSuccess: any, onError: any): void {
    // Process the file line by line
    fileReader.onload = () => {
      try {
        this.processFileContent(fileReader, processLine);
        onSuccess();
      } catch (e) {
        onError();
      }
    };

    // Handle read file errors
    fileReader.onerror = () => {
      onError();
    };
  }

  private static processFileContent(fileReader: FileReader, processLine: (items: string[]) => void): void {
    const lines: string[] = fileReader.result.toString().split('\r\n');
    for (const line of lines) {
      if (!line) {
        continue;
      }

      const lineItems: string[] = line.split(AppConstants.CSV_INPUT_SEPARATOR);
      processLine(lineItems);
    }
  }

  private static readFileContent(file: File, fileReader: FileReader, onError: any): void {
    try {
      fileReader.readAsText(file);
    } catch (e) {
      onError();
    }
  }

  private static createFileContent(rows: object[]): string {
    if (!rows || !rows.length) {
      return;
    }

    const keys: string[] = Object.keys(rows[0]);
    return rows
      .map(row => keys
        .map(key => {
          let cell: string = !row[key] ? '' : row[key];
          cell = cell.toString().replace(/"/g, '""');
          if (cell.search(/([",\n])/g) >= 0) {
            cell = `"${cell}"`;
          }
          return cell;
        })
        .join(AppConstants.CSV_OUTPUT_SEPARATOR))
      .join('\n');
  }

  private static saveFileContent(filename: string, content: string): void {
    const blob = new Blob([content], {type: AppConstants.CSV_MIME_TYPE});
    saveAs(blob, filename);
  }

  private static timeToDatetime(time: string, separator?: string): Date {
    separator = separator || AppConstants.TIME_SEPARATOR;
    const timeParts: string[] = time.split(separator);
    return new Date(AppConstants.START_OF_DAY.getFullYear(), AppConstants.START_OF_DAY.getMonth(), AppConstants.START_OF_DAY.getDate(),
      +timeParts[0], +timeParts[1], +timeParts[2], 0);
  }

  private static timeDifferenceInMillis(date: Date, delta: string): number {
    const deltaDate: Date = delta ? this.timeToDatetime(delta) : AppConstants.START_OF_DAY;
    return date.getTime() - deltaDate.getTime();
  }
}
