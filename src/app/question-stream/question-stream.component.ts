import { Component , NgZone,inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';
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
  // apiURL = 'https://mrsmith.onrender.com';
  apiURL = 'http://localhost:3001';
  question = '';
  response = '';
  isLoading = false;
  error: string | null = null;

  private http = inject(HttpClient);
  private ngZone = inject(NgZone);
  
  followUpQuestions :any = []
  
  private conversationId = '';
  private userId = '';


  constructor() {
    this.conversationId  = uuidv4();
    this.userId = uuidv4();
  }

  selectFollowUp(question: string) {
    this.question = question;
    this.askQuestion();
    this.followUpQuestions = [
     
    ]; // Clear previous suggestions
  }
  askQuestion() {
    this.response = '';
    this.error = null;
    this.isLoading = true;
    // clear the follow-up questions
    this.followUpQuestions = [];
  
    const requestBody: QuestionRequest = {
      orignalQuestionByUser: this.question,
      conversationId: this.conversationId,
      userId: this.userId,
    };
  
    // First, initialize the stream with POST
    this.http.post<{ streamId: string }>(`${this.apiURL}/ask`, requestBody).subscribe({
      next: (data) => {
        const eventSource = new EventSource(`${this.apiURL}/stream/${data.streamId}`);

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
                this.getFollowUpQuestions();
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
  

  getFollowUpQuestions() {
    this.http.get<{ }>(`${this.apiURL}/followUpQuestions?conversationId=${this.conversationId}`).subscribe({
      next: (data:any) => {
        console.log(data)
        this.ngZone.run(() => { // Wrap in NgZone
          this.followUpQuestions = data.followUpQuestions.map((question:any) => ({ summary: question.summary, fullQuestion: question.fullQuestion }));
        });
      },
      error: (err) => {
        console.error('GET request failed:', err);
        this.error = 'Failed to get follow-up questions';
      },
    });
  }


// Frontend Component

}