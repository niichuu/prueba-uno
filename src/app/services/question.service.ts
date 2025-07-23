import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Question, QuestionOption } from '../models/question.interface';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private questionsSubject = new BehaviorSubject<Question[]>([]);
  public questions$ = this.questionsSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadQuestions();
  }

  private loadQuestions(): void {
    this.apiService.getQuestions()
      .pipe(
        tap(questions => this.questionsSubject.next(questions)),
        catchError(error => {
          console.error('Error loading questions:', error);
          // Si falla, mantener array vacío
          this.questionsSubject.next([]);
          return of([]);
        })
      )
      .subscribe();
  }

  createQuestion(questionData: Omit<Question, 'id'>): Observable<Question> {
    console.log('🔧 QuestionService.createQuestion iniciado:', questionData);
    
    const question: Question = {
      ...questionData,
      id: this.generateId()
    };

    console.log('🆔 Pregunta con ID generado:', question);

    const currentQuestions = this.questionsSubject.value;
    const updatedQuestions = [...currentQuestions, question];
    
    console.log('📊 Estado actual de preguntas:', currentQuestions.length);
    console.log('📊 Preguntas actualizadas:', updatedQuestions.length);
    
    return this.apiService.saveQuestions(updatedQuestions)
      .pipe(
        tap(() => {
          console.log('✅ Preguntas guardadas en API exitosamente');
          this.questionsSubject.next(updatedQuestions);
        }),
        map(() => {
          console.log('📤 Retornando pregunta creada:', question);
          return question;
        }),
        catchError(error => {
          console.error('❌ Error en QuestionService.createQuestion:', error);
          throw error;
        })
      );
  }

  getAllQuestions(): Question[] {
    return this.questionsSubject.value;
  }

  getQuestionById(id: string): Question | null {
    return this.questionsSubject.value.find(q => q.id === id) || null;
  }

  getQuestionByIdAsync(id: string): Observable<Question> {
    // Primero intentar obtener de la caché local
    const localQuestion = this.getQuestionById(id);
    if (localQuestion) {
      return of(localQuestion);
    }
    
    // Si no está en caché, obtener del servidor
    return this.apiService.getQuestionById(id)
      .pipe(
        catchError(error => {
          console.error('Error getting question by ID:', error);
          throw error;
        })
      );
  }

  saveAllQuestions(questions: Question[]): Observable<any> {
    return this.apiService.saveQuestions(questions)
      .pipe(
        tap(() => {
          this.questionsSubject.next(questions);
        }),
        catchError(error => {
          console.error('Error saving questions:', error);
          throw error;
        })
      );
  }

  refreshQuestions(): Observable<Question[]> {
    return this.apiService.getQuestions()
      .pipe(
        tap(questions => this.questionsSubject.next(questions)),
        catchError(error => {
          console.error('Error refreshing questions:', error);
          throw error;
        })
      );
  }

  getCorrectAnswer(questionId: string): QuestionOption | null {
    const question = this.getQuestionById(questionId);
    if (!question) return null;
    
    return question.options.find(option => option.isCorrect) || null;
  }

  private generateId(): string {
    return `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }
}
