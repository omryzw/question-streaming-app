import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { QuestionStreamComponent } from './question-stream/question-stream.component';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet,QuestionStreamComponent],
  template: `
  <app-question-stream></app-question-stream>
`,
  // templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'question-streaming-app';
}
