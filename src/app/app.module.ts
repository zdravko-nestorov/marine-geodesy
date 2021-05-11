import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {InputDataComponent} from './components/input-data/input-data.component';
import {CardComponent} from './components/card/card.component';
import {OutputDataComponent} from './components/output-data/output-data.component';
import {FormsModule} from '@angular/forms';
import {AppFormComponent} from './components/app-form/app-form.component';

@NgModule({
  declarations: [
    AppComponent,
    AppFormComponent,
    CardComponent,
    InputDataComponent,
    OutputDataComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
