import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
interface StreamResponse {
  token?: string;
  done?: boolean;
  error?: string;
}

import { Observable } from 'rxjs';
@Component({
  selector: 'app-question-stream',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './question-stream.component.html',
  styleUrl: './question-stream.component.css'
})
export class QuestionStreamComponent {
  // Same implementation as previous artifact
  question = '';
  response = '';
  isLoading = false;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  askQuestion() {
    // Reset previous state
    this.response = '';
    this.error = null;
    this.isLoading = true;

    // Create EventSource for streaming
    const eventSource = new EventSource(this.getStreamUrl());

    eventSource.onmessage = (event) => {
      const data: StreamResponse = JSON.parse(event.data);

      if (data.token) {
        // Append streaming tokens
        this.response += data.token;
      }

      if (data.done) {
        // Stream completed
        eventSource.close();
        this.isLoading = false;
      }

      if (data.error) {
        // Handle errors
        this.error = data.error;
        eventSource.close();
        this.isLoading = false;
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      this.error = 'Connection error';
      eventSource.close();
      this.isLoading = false;
    };
  }

  private getStreamUrl(): string {
    return 'http://localhost:3001/ask';
  }
}