import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Question } from '../models/question.interface';
import { UserResponse } from '../models/user-response.interface';
import { GameResult } from '../models/game-result.interface';

export interface QuizStatus {
  isActive: boolean;
  currentQuestion: number;
  totalQuestions: number;
  createdAt: string;
}

export interface Participant {
  name: string;
  joinedAt: string;
}

export interface RankingEntry {
  name: string;
  score: number;
  totalQuestions: number;
  totalPoints: number;
  percentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly BASE_URL = 'http://localhost:3001/api';
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  // Subject para el estado del quiz en tiempo real
  private quizStatusSubject = new BehaviorSubject<QuizStatus>({
    isActive: false,
    currentQuestion: 0,
    totalQuestions: 0,
    createdAt: new Date().toISOString()
  });

  public quizStatus$ = this.quizStatusSubject.asObservable();

  constructor(private http: HttpClient) {
    // Cargar estado inicial del quiz
    this.loadQuizStatus();
  }

  // ============================================================================
  // QUIZ STATUS
  // ============================================================================

  getQuizStatus(): Observable<QuizStatus> {
    return this.http.get<QuizStatus>(`${this.BASE_URL}/quiz-status`)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateQuizStatus(status: Partial<QuizStatus>): Observable<any> {
    return this.http.patch(`${this.BASE_URL}/quiz-status`, status, this.httpOptions)
      .pipe(
        map(response => {
          // Actualizar el subject local
          this.loadQuizStatus();
          return response;
        }),
        catchError(this.handleError)
      );
  }

  setQuizStatus(status: QuizStatus): Observable<any> {
    return this.http.post(`${this.BASE_URL}/quiz-status`, status, this.httpOptions)
      .pipe(
        map(response => {
          this.quizStatusSubject.next(status);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  private loadQuizStatus(): void {
    this.getQuizStatus().subscribe({
      next: (status) => this.quizStatusSubject.next(status),
      error: (error) => console.error('Error loading quiz status:', error)
    });
  }

  // ============================================================================
  // QUESTIONS
  // ============================================================================

  getQuestions(): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.BASE_URL}/questions`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getQuestionById(id: string): Observable<Question> {
    return this.http.get<Question>(`${this.BASE_URL}/questions/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  saveQuestions(questions: Question[]): Observable<any> {
    return this.http.post(`${this.BASE_URL}/questions`, questions, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // ============================================================================
  // PARTICIPANTS
  // ============================================================================

  getParticipants(): Observable<Participant[]> {
    return this.http.get<Participant[]>(`${this.BASE_URL}/participants`)
      .pipe(
        catchError(this.handleError)
      );
  }

  registerParticipant(participant: Participant): Observable<any> {
    return this.http.post(`${this.BASE_URL}/participants`, participant, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // ============================================================================
  // RESPONSES
  // ============================================================================

  getResponses(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.BASE_URL}/responses`)
      .pipe(
        catchError(this.handleError)
      );
  }

  saveResponse(response: UserResponse): Observable<any> {
    return this.http.post(`${this.BASE_URL}/responses`, response, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // ============================================================================
  // RANKING
  // ============================================================================

  getRanking(): Observable<RankingEntry[]> {
    return this.http.get<RankingEntry[]>(`${this.BASE_URL}/ranking`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  clearAllData(): Observable<any> {
    return this.http.delete(`${this.BASE_URL}/clear-data`)
      .pipe(
        map(response => {
          // Resetear estado local
          this.loadQuizStatus();
          return response;
        }),
        catchError(this.handleError)
      );
  }

  healthCheck(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/health`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    
    let errorMessage = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Error ${error.status}: ${error.error?.error || error.message}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
