import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Question } from '../models/question.interface';
import { UserResponse } from '../models/user-response.interface';
import { GameResult } from '../models/game-result.interface';
import { JsonStorageService } from './json-storage.service';
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
    private jsonStorage: JsonStorageService,
    private questionService: QuestionService
  ) {}

  startGame(userId: string, userName: string): void {
    this.currentGameSubject.next({
      questions: [],
      currentQuestionIndex: 0,
      responses: [],
      isGameActive: true
    });
  }

  submitAnswer(userId: string, userName: string, questionId: string, selectedOptionId: string): boolean {
    const currentGame = this.currentGameSubject.value;
    if (!currentGame.isGameActive) {
      return false;
    }

    const question = this.questionService.getQuestionById(questionId);
    if (!question) {
      return false;
    }

    const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
    if (!selectedOption) {
      return false;
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

    // Guardar respuesta
    this.jsonStorage.addItem(this.jsonStorage.storageKeys.RESPONSES, response);

    return true;
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

  calculateScore(userId: string, userName: string): GameResult {
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

    // Guardar resultado
    this.jsonStorage.addItem(this.jsonStorage.storageKeys.RESULTS, result);

    return result;
  }

  endGame(): void {
    this.currentGameSubject.next({
      questions: [],
      currentQuestionIndex: 0,
      responses: [],
      isGameActive: false
    });
  }

  getAllResponses(): UserResponse[] {
    return this.jsonStorage.getData<UserResponse>(this.jsonStorage.storageKeys.RESPONSES);
  }

  hasUserAnswered(userId: string, questionId: string): boolean {
    const responses = this.getAllResponses();
    return responses.some(r => r.userId === userId && r.questionId === questionId);
  }

  getUserResponse(userId: string, questionId: string): UserResponse | null {
    const responses = this.getAllResponses();
    return responses.find(r => r.userId === userId && r.questionId === questionId) || null;
  }

  getGameProgress(): { current: number; total: number; percentage: number } {
    const currentGame = this.currentGameSubject.value;
    const current = currentGame.currentQuestionIndex;
    const total = currentGame.questions.length;
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

    return { current, total, percentage };
  }
}
