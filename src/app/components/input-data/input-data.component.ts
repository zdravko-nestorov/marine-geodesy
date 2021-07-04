import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {InputData} from '../../models/input-data';

@Component({
  selector: 'app-input-data',
  templateUrl: './input-data.component.html',
  styleUrls: ['./input-data.component.css']
})
export class InputDataComponent implements OnInit {

  @Input('fileTitle') fileTitle: string;

  @Input('baseTitle') baseTitle: string;
  @Input('basePattern') basePattern: string;
  @Input('basePlaceholder') basePlaceholder: string;
  @Input('baseDefaultValue') baseDefaultValue: string;

  @Input('deltaTitle') deltaTitle: string;
  @Input('deltaPattern') deltaPattern: string;
  @Input('deltaPlaceholder') deltaPlaceholder: string;
  @Input('deltaDefaultValue') deltaDefaultValue: string;

  @Output('inputDataChange') inputDataChange: EventEmitter<InputData> = new EventEmitter<InputData>();

  private inputData: InputData = new InputData();

  get baseHidden(): boolean {
    return !this.baseTitle;
  }

  ngOnInit(): void {
    this.inputData.base = this.baseDefaultValue;
    this.inputData.delta = this.deltaDefaultValue;
    this.inputDataChange.emit(this.inputData);
  }

  handleFileChange(files: FileList): void {
    this.inputData.file = files.item(0);
    this.inputDataChange.emit(this.inputData);
  }

  handleBaseChange(base: string): void {
    this.inputData.base = base;
    this.inputDataChange.emit(this.inputData);
  }

  handleDeltaChange(delta: string): void {
    this.inputData.delta = delta;
    this.inputDataChange.emit(this.inputData);
  }
}
