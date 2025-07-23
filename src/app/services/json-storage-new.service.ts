import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface QuizStatus {
  isActive: boolean;
  currentQuestion: number;
  totalQuestions: number;
  createdAt: string;
}

export interface Participant {
  name: string;
}

export interface GameResult {
  name: string;
  score: number;
  totalQuestions: number;
  percentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class JsonStorageService {
  private readonly API_URL = 'http://localhost:3000/api';
  
  // Estados reactivos
  private quizStatusSubject = new BehaviorSubject<QuizStatus>({
    isActive: false,
    currentQuestion: 0,
    totalQuestions: 0,
    createdAt: new Date().toISOString()
  });
  
  public quizStatus$ = this.quizStatusSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadQuizStatus();
  }

  // ===============================
  // ESTADO DEL QUIZ
  // ===============================
  
  private loadQuizStatus(): void {
    this.getQuizStatus().subscribe(status => {
      this.quizStatusSubject.next(status);
    });
  }

  getQuizStatus(): Observable<QuizStatus> {
    return this.http.get<QuizStatus>(`${this.API_URL}/quiz-status`);
  }

  updateQuizStatus(status: QuizStatus): Observable<any> {
    return this.http.post(`${this.API_URL}/quiz-status`, status);
  }

  // ===============================
  // PREGUNTAS
  // ===============================

  getQuestions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/questions`);
  }

  saveQuestions(questions: any[]): Observable<any> {
    return this.http.post(`${this.API_URL}/questions`, questions);
  }

  // ===============================
  // PARTICIPANTES
  // ===============================

  getParticipants(): Observable<Participant[]> {
    return this.http.get<Participant[]>(`${this.API_URL}/participants`);
  }

  addParticipant(participant: Participant): Observable<any> {
    return this.http.post(`${this.API_URL}/participants`, participant);
  }

  // ===============================
  // RESPUESTAS
  // ===============================

  getResponses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/responses`);
  }

  addResponse(response: any): Observable<any> {
    return this.http.post(`${this.API_URL}/responses`, response);
  }

  // ===============================
  // RANKING
  // ===============================

  getRanking(): Observable<GameResult[]> {
    return this.http.get<GameResult[]>(`${this.API_URL}/ranking`);
  }

  // ===============================
  // UTILIDADES
  // ===============================

  clearAllData(): Observable<any> {
    return this.http.delete(`${this.API_URL}/clear-data`);
  }

  checkBackendHealth(): Observable<any> {
    return this.http.get(`${this.API_URL}/health`);
  }

  // ===============================
  // MÉTODOS DE COMPATIBILIDAD (Para mantener API existente)
  // ===============================

  setData<T>(key: string, data: T[]): void {
    console.warn('setData is deprecated, use specific API methods instead');
  }

  getData<T>(key: string): T[] {
    console.warn('getData is deprecated, use specific API methods instead');
    return [];
  }

  addItem<T>(key: string, item: T): void {
    console.warn('addItem is deprecated, use specific API methods instead');
  }

  clearAll(): void {
    this.clearAllData().subscribe();
  }

  get storageKeys() {
    return {
      QUESTIONS: 'quiz-questions',
      RESPONSES: 'quiz-responses',
      RESULTS: 'quiz-results'
    };
  }
}
