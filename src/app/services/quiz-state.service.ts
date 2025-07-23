import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';

export type QuizStatus = 'creating' | 'active' | 'finished';

@Injectable({
  providedIn: 'root'
})
export class QuizStateService {
  private statusSubject = new BehaviorSubject<QuizStatus>('creating');
  public status$ = this.statusSubject.asObservable();

  private currentQuestionSubject = new BehaviorSubject<string | null>(null);
  public currentQuestion$ = this.currentQuestionSubject.asObservable();

  constructor(private apiService: ApiService) {
    // Cargar estado inicial desde el servidor
    this.loadInitialState();
  }

  private loadInitialState(): void {
    this.apiService.getQuizStatus().subscribe({
      next: (status) => {
        const quizStatus: QuizStatus = status.isActive ? 'active' : 
          (status.currentQuestion > 0 ? 'finished' : 'creating');
        this.statusSubject.next(quizStatus);
        
        if (status.currentQuestion > 0) {
          this.currentQuestionSubject.next(status.currentQuestion.toString());
        }
      },
      error: (error) => console.error('Error loading quiz state:', error)
    });
  }

  setQuizStatus(status: QuizStatus): void {
    this.statusSubject.next(status);
    
    // Sincronizar con el servidor
    const isActive = status === 'active';
    this.apiService.updateQuizStatus({ isActive }).subscribe({
      error: (error) => console.error('Error updating quiz status:', error)
    });
  }

  setCurrentQuestion(questionId: string): void {
    this.currentQuestionSubject.next(questionId);
    
    // Sincronizar con el servidor - convertir questionId a número si es necesario
    const currentQuestion = parseInt(questionId, 10) || 1;
    this.apiService.updateQuizStatus({ currentQuestion }).subscribe({
      error: (error) => console.error('Error updating current question:', error)
    });
  }

  getCurrentStatus(): QuizStatus {
    return this.statusSubject.value;
  }

  getCurrentQuestionId(): string | null {
    return this.currentQuestionSubject.value;
  }

  isQuizActive(): boolean {
    return this.getCurrentStatus() === 'active';
  }

  resetQuiz(): void {
    this.setQuizStatus('creating');
    this.currentQuestionSubject.next(null);
  }
}
