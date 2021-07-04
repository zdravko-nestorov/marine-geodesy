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

  successMessage: string;
  warningMessage: string;
  errorMessage: string;
  isLoading: boolean;

  private coordinatesData: InputData = new InputData();
  private coordinatesArr: Coordinates[] = [];

  private depthsData: InputData = new InputData();
  private depthsArr: Depths[] = [];

  private geodesyData: OutputData = new OutputData();
  private geodesyArr: Geodesy[] = [];

  inputDataChange(inputData: InputData, type: string): void {
    if (type === 'coordinates') {
      this.coordinatesData = inputData;
    } else {
      this.depthsData = inputData;
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
      this.finalizeCalculation();
      return;
    }

    // Try to calculate the final data
    try {
      this.calculateAndSaveOutputData();
    } catch (e) {
      this.errorMessage = AppConstants.ERROR_CALCULATION;
    } finally {
      this.finalizeCalculation();
    }
  }

  private resetData(isLoading: boolean = true): void {
    // User information
    this.successMessage = '';
    this.warningMessage = '';
    this.errorMessage = '';
    this.isLoading = isLoading;

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
    if (!this.validateDepthsBase()) {
      this.errorMessage += AppConstants.ERROR_DEPTHS_HEIGHT_BASE;
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

  private validateDepthsBase(): boolean {
    const depthsBase: string = this.depthsData.base;
    return !depthsBase || new RegExp(AppConstants.PATTERN_DEPTHS_HEIGHT_BASE).test(depthsBase);
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
    const heightWithBaseAndDelta: number = AppUtils.heightWithBaseAndDelta(height, +this.depthsData.base, +this.depthsData.delta);
    return new Depths(id, timeDiff, timeDiffInMillis, height, heightWithDelta, heightWithBaseAndDelta);
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
  private calculateAndSaveOutputData(): void {
    this.calculateOutputData();

    // Check if no matching coordinates and depths are found
    if (!this.geodesyArr || !this.geodesyArr.length) {
      this.warningMessage = AppConstants.NO_CALCULATION;
      return;
    }

    // Save the output data
    this.saveOutputData();

    // Check if all coordinates has matching depths
    if (this.geodesyArr.length === this.coordinatesArr.length) {
      this.successMessage = AppConstants.SUCCESS_CALCULATION;
      return;
    }

    // Some of the coordinates has no matching depths
    this.successMessage = AppConstants.PARTIAL_CALCULATION;
  }

  private calculateOutputData(): void {
    let count: any = 1;
    let firstDepthIndex: any = -1;

    for (const coordinate of this.coordinatesArr) {
      // Find first matching depth index, based on the calculated time difference (calculated only once)
      firstDepthIndex = this.findFirstDepthIndex(firstDepthIndex, coordinate);
      if (firstDepthIndex < 0) {
        continue;
      }

      // Once the index is found take every consequent item from coordinates and depths array
      const geodesy: Geodesy = this.mapToGeodesy(count++, coordinate, firstDepthIndex++);
      if (geodesy) {
        this.geodesyArr.push(geodesy);
      }
    }
  }

  private findFirstDepthIndex(firstDepthIndex: number, coordinate: Coordinates): number {
    if (firstDepthIndex && firstDepthIndex >= 0) {
      return firstDepthIndex;
    }
    return this.depthsArr.findIndex(item => item.timeDiffInMillis === coordinate.timeDiffWithDeltaInMillis);
  }

  private mapToGeodesy(count: number, coordinate: Coordinates, firstDepthIndex: number): Geodesy {
    if (firstDepthIndex >= this.depthsArr.length) {
      return null;
    }
    const x: string = coordinate.x;
    const y: string = coordinate.y;
    const height: string = this.depthsArr[firstDepthIndex].heightWithBaseAndDelta.toFixed(2);
    return new Geodesy(count, y, x, height);
  }

  private saveOutputData(): void {
    AppUtils.exportToCsv(this.geodesyData.filename, this.geodesyArr);
  }

  /**
   * FINALIZE CALCULATION
   */
  private finalizeCalculation(): void {
    this.errorMessage = this.errorMessage && this.errorMessage.startsWith('<br/>') ? this.errorMessage.substring(5) : this.errorMessage;
    this.isLoading = false;
  }
}
