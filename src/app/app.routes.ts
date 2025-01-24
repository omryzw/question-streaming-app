// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { QuestionStreamComponent } from './question-stream/question-stream.component';

export const routes: Routes = [
  { 
    path: '',
    component: QuestionStreamComponent,
    title: 'ChatGPT Clone'
  }
];