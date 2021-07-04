import {Component, OnInit} from '@angular/core';
import {GeodesyCalculatorService} from '../../services/geodesy-calculator.service';
import {InputData} from '../../models/input-data';
import {OutputData} from '../../models/output-data';
import {AppConstants} from '../../constants/app-constants';

@Component({
  selector: 'app-form',
  templateUrl: './app-form.component.html',
  styleUrls: ['./app-form.component.css']
})
export class AppFormComponent implements OnInit {

  public PATTERN_COORDINATES_CLOCK_DELTA = AppConstants.PATTERN_COORDINATES_CLOCK_DELTA;
  public PATTERN_DEPTHS_HEIGHT_BASE = AppConstants.PATTERN_DEPTHS_HEIGHT_BASE;
  public PATTERN_DEPTHS_HEIGHT_DELTA = AppConstants.PATTERN_DEPTHS_HEIGHT_DELTA;

  constructor(
    private geodesyCalculatorService: GeodesyCalculatorService) {
  }

  get successMessage(): string {
    return this.geodesyCalculatorService.successMessage;
  }

  get warningMessage(): string {
    return this.geodesyCalculatorService.warningMessage;
  }

  get errorMessage(): string {
    return this.geodesyCalculatorService.errorMessage;
  }

  get isLoading(): boolean {
    return this.geodesyCalculatorService.isLoading;
  }

  ngOnInit(): void {
    this.geodesyCalculatorService.depthsFileProcessed.subscribe(
      () => this.geodesyCalculatorService.calculateAndFinalizeData()
    );
  }

  inputDataChange(inputData: InputData, type: string): void {
    this.geodesyCalculatorService.inputDataChange(inputData, type);
  }

  outputDataChange(outputData: OutputData): void {
    this.geodesyCalculatorService.outputDataChange(outputData);
  }

  validateAndProcessData(): void {
    this.geodesyCalculatorService.validateAndProcessData();
  }

  reloadCurrentPage(): void {
    window.location.reload();
  }
}
