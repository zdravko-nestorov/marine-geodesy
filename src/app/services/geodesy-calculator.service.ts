import {EventEmitter, Injectable} from '@angular/core';
import {InputData} from '../models/input-data';
import {Coordinates} from '../models/coordinates';
import {Depths} from '../models/depths';
import {OutputData} from '../models/output-data';
import {AppUtils} from '../utils/app-utils';
import {Geodesy} from '../models/geodesy';
import {AppConstants} from '../constants/app-constants';

@Injectable({
  providedIn: 'root'
})
export class GeodesyCalculatorService {

  coordinatesFileProcessed: EventEmitter<void> = new EventEmitter<void>();
  depthsFileProcessed: EventEmitter<void> = new EventEmitter<void>();

  errorMessage: string;
  successMessage: string;
  isLoading: boolean;

  private coordinatesData: InputData = new InputData();
  private coordinatesArr: Coordinates[] = [];

  private depthsData: InputData = new InputData();
  private depthsArr: Depths[] = [];

  private geodesyData: OutputData = new OutputData();
  private geodesyArr: Geodesy[] = [];

  inputDataChange(inputData: InputData, type: string): void {
    switch (type) {
      case 'coordinates':
        this.coordinatesData = inputData;
        break;
      default:
        this.depthsData = inputData;
        break;
    }
  }

  outputDataChange(outputData: OutputData): void {
    this.geodesyData = outputData;
  }

  validateAndProcessData(): void {
    this.resetData();
    this.validateAndProcessCoordinates();
    this.validateAndProcessDepths();
    this.validateOutputData();
  }

  calculateAndFinalizeData(): void {
    // In case of an error, do not make any calculations
    if (this.errorMessage) {
      this.finalizeData();
      return;
    }

    // Try to calculate the final data
    try {
      this.calculateOutputData();
      this.saveOutputData();
      this.successMessage = AppConstants.SUCCESS_CALCULATION;
    } catch (e) {
      this.errorMessage = AppConstants.ERROR_CALCULATION;
    } finally {
      this.finalizeData();
    }
  }

  private resetData(): void {
    // User information
    this.successMessage = '';
    this.errorMessage = '';
    this.isLoading = true;

    // Output data
    this.coordinatesArr = [];
    this.depthsArr = [];
    this.geodesyArr = [];
  }

  /**
   * COORDINATES FILE
   */
  private validateAndProcessCoordinates(): void {
    if (!this.validateCoordinatesDelta()) {
      this.errorMessage += AppConstants.ERROR_COORDINATES_CLOCK_DELTA;
    }
    this.processCoordinates();
  }

  private validateCoordinatesDelta(): boolean {
    const coordinatesDelta: string = this.coordinatesData.delta;
    // Coordinates delta can be EMPTY or math the pattern "hh:mm:ss"
    return !coordinatesDelta || new RegExp(AppConstants.PATTERN_COORDINATES_CLOCK_DELTA).test(coordinatesDelta);
  }

  private validateCoordinatesFile(): boolean {
    return !this.coordinatesArr.find(coordinates => !coordinates.isValid());
  }

  private processCoordinates(): void {
    // Process the file line by line
    const processLine = (lineItems: string[]): void => {
      const coordinates: Coordinates = this.mapToCoordinates(lineItems);
      this.coordinatesArr.push(coordinates);
    };

    // Handle successfully read file
    const onSuccess = (): void => {
      if (!this.validateCoordinatesFile()) {
        this.errorMessage += AppConstants.ERROR_COORDINATES_FILE_CONTENT;
      }
      this.emitCoordinatesFileProcessed();
    };

    // Handle unsuccessfully read file
    const onError = (): void => {
      this.errorMessage += AppConstants.ERROR_COORDINATES_FILE;
      this.emitCoordinatesFileProcessed();
    };

    // Parse the coordinates file
    AppUtils.parseFile(this.coordinatesData.file, processLine, onSuccess, onError);
  }

  private mapToCoordinates(lineItems: string[]): Coordinates {
    const time: string = lineItems[0];
    const timeDiffWithDeltaInMillis: number = AppUtils.timeWithDeltaInMillis(lineItems[0], ':', this.coordinatesData.delta);
    const x: string = lineItems[1];
    const y: string = lineItems[2];
    return new Coordinates(time, timeDiffWithDeltaInMillis, x, y);
  }

  private emitCoordinatesFileProcessed(): void {
    this.coordinatesFileProcessed.emit();
  }

  /**
   * DEPTHS FILE
   */
  private validateAndProcessDepths(): void {
    if (!this.validateDepthsDelta()) {
      this.errorMessage += AppConstants.ERROR_DEPTHS_HEIGHT_DELTA;
    }
    this.processDepths();
  }

  private validateDepthsFile(): boolean {
    return !this.depthsArr.find(depths => !depths.isValid());
  }

  private validateDepthsDelta(): boolean {
    const depthsDelta: string = this.depthsData.delta;
    return !depthsDelta || new RegExp(AppConstants.PATTERN_DEPTHS_HEIGHT_DELTA).test(depthsDelta);
  }

  private processDepths(): void {
    // Process the file line by line
    const processLine = (lineItems: string[]): void => {
      const depths = this.mapToDepths(lineItems);
      this.depthsArr.push(depths);
    };

    // Handle successfully read file
    const onSuccess = (): void => {
      if (!this.validateDepthsFile()) {
        this.errorMessage += AppConstants.ERROR_DEPTHS_FILE_CONTENT;
      }
      this.emitDepthsFileProcessed();
    };

    // Handle unsuccessfully read file
    const onError = (): void => {
      this.errorMessage += AppConstants.ERROR_DEPTHS_FILE;
      this.emitDepthsFileProcessed();
    };

    // Parse the depths file
    AppUtils.parseFile(this.depthsData.file, processLine, onSuccess, onError);
  }

  private mapToDepths(lineItems: string[]): Depths {
    const id: number = +lineItems[0];
    const timeDiff: string = lineItems[1];
    const timeDiffInMillis: number = AppUtils.timeInMillis(timeDiff);
    const height: number = +lineItems[2];
    const heightWithDelta: number = AppUtils.heightWithDelta(height, +this.depthsData.delta);
    return new Depths(id, timeDiff, timeDiffInMillis, height, heightWithDelta);
  }

  private emitDepthsFileProcessed(): void {
    this.depthsFileProcessed.emit();
  }

  /**
   * GEODESY OUTPUT FILE
   */
  private validateOutputData(): void {
    if (!this.validateOutputFile()) {
      this.errorMessage += AppConstants.ERROR_OUTPUT_FILE;
    }
  }

  private validateOutputFile(): boolean {
    const outputFilename: string = this.geodesyData.filename;
    return !!outputFilename && new RegExp(AppConstants.PATTERN_OUTPUT_FILENAME).test(outputFilename);
  }

  /**
   * GEODESY CALCULATION
   */
  private calculateOutputData(): void {
    let count: any = 1;
    let firstDepthIndex: any = 0;

    for (const coordinate of this.coordinatesArr) {
      // Find first matching depth index, based on the calculated time difference (calculated only once)
      firstDepthIndex = this.findFirstDepthIndex(firstDepthIndex, coordinate);

      // Once the index is found take every consequent item from coordinates and depths array
      if (firstDepthIndex) {
        const geodesy: Geodesy = this.mapToGeodesy(count++, coordinate, firstDepthIndex++);
        this.geodesyArr.push(geodesy);
      }
    }
  }

  private findFirstDepthIndex(firstDepthIndex: number, coordinate: Coordinates): number {
    return firstDepthIndex || this.depthsArr.findIndex(item => item.timeDiffInMillis === coordinate.timeDiffWithDeltaInMillis);
  }

  private mapToGeodesy(count: number, coordinate: Coordinates, firstDepthIndex: number): Geodesy {
    const x: string = coordinate.x;
    const y: string = coordinate.y;
    const heightWithDelta: string = this.depthsArr[firstDepthIndex].heightWithDelta.toFixed(2);
    return new Geodesy(count, y, x, heightWithDelta);
  }

  /**
   * FINALIZE OUTPUT FILE
   */
  private saveOutputData(): void {
    AppUtils.exportToCsv(this.geodesyData.filename, this.geodesyArr);
  }

  private finalizeData(): void {
    this.errorMessage = this.errorMessage && this.errorMessage.startsWith('<br/>') && this.errorMessage.substring(5);
    this.isLoading = false;
  }
}