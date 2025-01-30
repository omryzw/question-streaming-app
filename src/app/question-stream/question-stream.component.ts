import { Component , NgZone,inject,signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MarkdownRendererService } from '../services/markdown-renderer.service';
import { v4 as uuidv4 } from 'uuid';
import { SafeHtmlPipe } from '../pipes/safe-html.pipe';
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
  imports: [CommonModule, FormsModule, HttpClientModule,SafeHtmlPipe],
  templateUrl: './question-stream.component.html',
  styleUrl: './question-stream.component.scss'
})
export class QuestionStreamComponent {
  // apiURL = 'https://mrsmith.onrender.com';
  apiURL = 'http://localhost:3001';
  // question = '';
  // response = '';
  // isLoading = false;
  // error: string | null = null;

  question = signal('');
  response = signal('');
  isLoading = signal(false);
  error = signal('');

  private http = inject(HttpClient);
  private ngZone = inject(NgZone);
  
  followUpQuestions :any = []
  
  private conversationId = '';
  private userId = '';


  constructor(public mdRenderer: MarkdownRendererService) {
    this.conversationId  = uuidv4();
    this.userId = uuidv4();
    // this.streamResponse("hello")
  }

  selectFollowUp(question: string) {
    this.question.set(question) ;
    // this.askQuestion();
    this.followUpQuestions = [
     
    ]; // Clear previous suggestions
  }
  
  async streamResponse() {

    this.isLoading.set(true);
    this.response.set('');
    this.error.set('');

    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-r1:32b',
          prompt: this.question(),
          stream: true // Ensure streaming is enabled
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const processStream = async () => {
        if (!reader) return;

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            this.ngZone.run(() => {
              this.isLoading.set(false);
              // Add any completion logic here
            });
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n');
          buffer = parts.pop() || ''; // Save incomplete chunk

          for (const part of parts) {
            const trimmed = part.trim();
            if (!trimmed) continue;

            try {
              const data = JSON.parse(trimmed);
              this.ngZone.run(() => {
                if (data.response) {
                  this.response += data.response;
                }
                if (data.done) {
                  this.isLoading.set(false);
                  // this.getFollowUpQuestions(); // Your completion method
                }
                if (data.error) {
                  throw new Error(data.error);
                }
              });
            } catch (err) {
              this.ngZone.run(() => this.handleError(err));
            }
          }
        }
      };

      await processStream();
    } catch (err) {
      this.ngZone.run(() => this.handleError(err));
    }
  }

  private handleError(error: any) {
    console.error('Stream error:', error);
    this.isLoading.set( false);
    this.error = error.message || 'Error processing stream';
  }


  private handleErrorog(error: any, eventSource: EventSource) {
    console.error(error);
    this.error.set( error instanceof Error ? error.message : 'Connection error');
    eventSource.close();
    this.isLoading.set( false);
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
        this.error.set('Failed to get follow-up questions');
      },
    });
  }


// Frontend Component

}