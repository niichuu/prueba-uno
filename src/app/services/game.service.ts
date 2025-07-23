import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, map, tap, catchError } from 'rxjs';
import { Question } from '../models/question.interface';
import { UserResponse } from '../models/user-response.interface';
import { GameResult } from '../models/game-result.interface';
import { ApiService } from './api.service';
import { QuestionService } from './question.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private currentGameSubject = new BehaviorSubject<{
    questions: Question[];
    currentQuestionIndex: number;
    responses: UserResponse[];
    isGameActive: boolean;
  }>({
    questions: [],
    currentQuestionIndex: 0,
    responses: [],
    isGameActive: false
  });

  public currentGame$ = this.currentGameSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private questionService: QuestionService
  ) {
    // Inicializar con datos del servidor
    this.loadInitialData();
  }

  private loadInitialData(): void {
    // Cargar estado del quiz y datos necesarios
    this.apiService.getQuizStatus().subscribe({
      next: (status) => {
        if (status.isActive) {
          this.loadActiveGameData();
        }
      },
      error: (error) => console.error('Error loading initial data:', error)
    });
  }

  private loadActiveGameData(): void {
    // Si hay un quiz activo, cargar las preguntas
    this.questionService.refreshQuestions().subscribe({
      next: (questions) => {
        const currentGame = this.currentGameSubject.value;
        this.currentGameSubject.next({
          ...currentGame,
          questions,
          isGameActive: true
        });
      },
      error: (error) => console.error('Error loading game data:', error)
    });
  }

  startGame(userId: string, userName: string): Observable<any> {
    // Activar el quiz en el servidor
    return this.apiService.updateQuizStatus({ isActive: true }).pipe(
      tap(() => {
        // Cargar las preguntas para el juego
        this.questionService.refreshQuestions().subscribe({
          next: (questions) => {
            this.currentGameSubject.next({
              questions,
              currentQuestionIndex: 0,
              responses: [],
              isGameActive: true
            });
          },
          error: (error) => console.error('Error loading questions:', error)
        });
      }),
      catchError(error => {
        console.error('Error starting game:', error);
        throw error;
      })
    );
  }

  submitAnswer(userId: string, userName: string, questionId: string, selectedOptionId: string): Observable<boolean> {
    const currentGame = this.currentGameSubject.value;
    if (!currentGame.isGameActive) {
      return of(false);
    }

    const question = this.questionService.getQuestionById(questionId);
    if (!question) {
      return of(false);
    }

    const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
    if (!selectedOption) {
      return of(false);
    }

    const response: UserResponse = {
      userId,
      userName,
      selectedOptionId,
      selectedOptionText: selectedOption.text,
      questionId
    };

    const updatedGame = {
      ...currentGame,
      responses: [...currentGame.responses, response]
    };

    this.currentGameSubject.next(updatedGame);

    // Guardar respuesta en el servidor
    return this.apiService.saveResponse(response).pipe(
      map(() => true),
      catchError(error => {
        console.error('Error saving response:', error);
        return of(false);
      })
    );
  }

  getCurrentQuestion(): Question | null {
    const currentGame = this.currentGameSubject.value;
    if (!currentGame.isGameActive || currentGame.currentQuestionIndex >= currentGame.questions.length) {
      return null;
    }
    
    return currentGame.questions[currentGame.currentQuestionIndex];
  }

  isGameComplete(): boolean {
    const currentGame = this.currentGameSubject.value;
    return currentGame.currentQuestionIndex >= currentGame.questions.length;
  }

  calculateScore(userId: string, userName: string): Observable<GameResult> {
    const currentGame = this.currentGameSubject.value;
    let totalScore = 0;
    let correctAnswers = 0;

    currentGame.responses.forEach((response, index) => {
      const question = currentGame.questions[index];
      const correctOption = question.options.find(opt => opt.isCorrect);
      
      if (correctOption && response.selectedOptionId === correctOption.id) {
        totalScore += question.points;
        correctAnswers++;
      }
    });

    const result: GameResult = {
      userId,
      userName,
      totalScore,
      totalQuestions: currentGame.questions.length,
      correctAnswers
    };

    // No necesitamos guardar el resultado por separado ya que se calcula desde las respuestas
    return of(result);
  }

  endGame(): Observable<any> {
    // Desactivar el quiz en el servidor
    return this.apiService.updateQuizStatus({ isActive: false }).pipe(
      tap(() => {
        this.currentGameSubject.next({
          questions: [],
          currentQuestionIndex: 0,
          responses: [],
          isGameActive: false
        });
      }),
      catchError(error => {
        console.error('Error ending game:', error);
        throw error;
      })
    );
  }

  getAllResponses(): Observable<UserResponse[]> {
    return this.apiService.getResponses();
  }

  hasUserAnswered(userId: string, questionId: string): Observable<boolean> {
    return this.getAllResponses().pipe(
      map(responses => responses.some(r => r.userId === userId && r.questionId === questionId))
    );
  }

  getUserResponse(userId: string, questionId: string): Observable<UserResponse | null> {
    return this.getAllResponses().pipe(
      map(responses => responses.find(r => r.userId === userId && r.questionId === questionId) || null)
    );
  }

  getGameProgress(): { current: number; total: number; percentage: number } {
    const currentGame = this.currentGameSubject.value;
    const current = currentGame.currentQuestionIndex;
    const total = currentGame.questions.length;
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

    return { current, total, percentage };
  }
}
