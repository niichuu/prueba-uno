import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type QuizStatus = 'creating' | 'active' | 'finished';

@Injectable({
  providedIn: 'root'
})
export class QuizStateService {
  private statusSubject = new BehaviorSubject<QuizStatus>('creating');
  public status$ = this.statusSubject.asObservable();

  private currentQuestionSubject = new BehaviorSubject<string | null>(null);
  public currentQuestion$ = this.currentQuestionSubject.asObservable();

  constructor() {}

  setQuizStatus(status: QuizStatus): void {
    this.statusSubject.next(status);
  }

  setCurrentQuestion(questionId: string): void {
    this.currentQuestionSubject.next(questionId);
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
