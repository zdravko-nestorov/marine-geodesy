import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {OutputData} from '../../models/output-data';

@Component({
  selector: 'app-output-data',
  templateUrl: './output-data.component.html',
  styleUrls: ['./output-data.component.css']
})
export class OutputDataComponent implements OnInit {

  @Input('filenameTitle') filenameTitle: string;
  @Input('filenamePattern') filenamePattern: string;
  @Input('filenameDefaultValue') filenameDefaultValue: string;
  @Output('outputDataChange') outputDataChange: EventEmitter<OutputData> = new EventEmitter<OutputData>();

  private outputData: OutputData = new OutputData();

  ngOnInit(): void {
    this.outputData.filename = this.filenameDefaultValue;
    this.outputDataChange.emit(this.outputData);
  }

  handleFilenameChange(filename: string): void {
    this.outputData.filename = filename;
    this.outputDataChange.emit(this.outputData);
  }
}
