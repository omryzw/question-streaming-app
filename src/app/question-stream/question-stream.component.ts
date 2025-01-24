import { Component , NgZone,inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

interface StreamResponse {
  token?: string;
  done?: boolean;
  error?: string;
}

interface QuestionRequest {
  orignalQuestionByUser: string;
  conversationId: string;
  userId: string;
}

@Component({
  selector: 'app-question-stream',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './question-stream.component.html',
  styleUrl: './question-stream.component.scss'
})
export class QuestionStreamComponent {
  question = '';
  response = '';
  isLoading = false;
  error: string | null = null;

  private http = inject(HttpClient);
  private ngZone = inject(NgZone);
  
 
  
  private conversationId = '31c19f4a-4192-443b-a10d-38f407bcae22';
  private userId = '31c26e5a-2184-431b-a80d-18f307bcae1';

  askQuestion() {
    this.response = '';
    this.error = null;
    this.isLoading = true;
  
    const requestBody: QuestionRequest = {
      orignalQuestionByUser: this.question,
      conversationId: this.conversationId,
      userId: this.userId,
    };
  
    // First, initialize the stream with POST
    this.http.post<{ streamId: string }>('http://localhost:3001/ask', requestBody).subscribe({
      next: (data) => {
        const eventSource = new EventSource(`http://localhost:3001/stream/${data.streamId}`);

        eventSource.onmessage = (event) => {
          this.ngZone.run(() => { // Wrap in NgZone
            try {
              const data: StreamResponse = JSON.parse(event.data);
              if (data.token) {
                this.response += data.token; // Angular now detects this change
              }
              if (data.done) {
                eventSource.close();
                this.isLoading = false;
              }
              if (data.error) {
                throw new Error(data.error);
              }
            } catch (err) {
              this.handleError(err, eventSource);
            }
          });
        };
  
        eventSource.onerror = (error) => {
          this.ngZone.run(() => { // Wrap in NgZone
            this.handleError('EventSource error', eventSource);
          });
        };
      

        },
        error: (err) => {
          console.error('POST request failed:', err);
          this.error = 'Failed to initialize the stream';
          this.isLoading = false;
        },
      });
  }
  private handleError(error: any, eventSource: EventSource) {
    console.error(error);
    this.error = error instanceof Error ? error.message : 'Connection error';
    eventSource.close();
    this.isLoading = false;
  }
  

// Frontend Component

}