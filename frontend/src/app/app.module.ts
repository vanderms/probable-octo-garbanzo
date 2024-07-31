import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { ApplicationBarComponent } from './components/application-bar/application-bar.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { TaskFormComponent } from './components/task-form/task-form.component';
import { LetDirective } from './directives/let/let.directive';
import { ControlsBarComponent } from './components/controls-bar/controls-bar.component';

@NgModule({
  declarations: [
    AppComponent,
    ApplicationBarComponent,
    ToolbarComponent,
    CanvasComponent,
    TaskFormComponent,
    LetDirective,
    ControlsBarComponent,
  ],
  imports: [BrowserModule, HttpClientModule, ReactiveFormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
