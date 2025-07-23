import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Question, QuestionOption } from '../models/question.interface';
import { JsonStorageService } from './json-storage.service';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private questionsSubject = new BehaviorSubject<Question[]>([]);
  public questions$ = this.questionsSubject.asObservable();

  constructor(private jsonStorage: JsonStorageService) {
    this.loadQuestions();
    this.initializeDefaultQuestions();
  }

  private loadQuestions(): void {
    const questions = this.jsonStorage.getData<Question>(
      this.jsonStorage.storageKeys.QUESTIONS
    );
    this.questionsSubject.next(questions);
  }

  private initializeDefaultQuestions(): void {
    if (this.questionsSubject.value.length === 0) {
      this.createDefaultQuestions();
    }
  }

  private createDefaultQuestions(): void {
    const defaultQuestions: Omit<Question, 'id'>[] = [
      {
        title: "¿Cuál es la capital de Francia?",
        points: 10,
        options: [
          { id: "1", text: "Madrid", isCorrect: false },
          { id: "2", text: "París", isCorrect: true },
          { id: "3", text: "Roma", isCorrect: false },
          { id: "4", text: "Londres", isCorrect: false }
        ]
      },
      {
        title: "¿Cuánto es 2 + 2?",
        points: 5,
        options: [
          { id: "1", text: "3", isCorrect: false },
          { id: "2", text: "4", isCorrect: true },
          { id: "3", text: "5", isCorrect: false },
          { id: "4", text: "6", isCorrect: false }
        ]
      },
      {
        title: "¿Cuál es el planeta más grande del sistema solar?",
        points: 15,
        options: [
          { id: "1", text: "Tierra", isCorrect: false },
          { id: "2", text: "Marte", isCorrect: false },
          { id: "3", text: "Júpiter", isCorrect: true },
          { id: "4", text: "Saturno", isCorrect: false }
        ]
      }
    ];

    defaultQuestions.forEach(questionData => {
      this.createQuestion(questionData);
    });
  }

  createQuestion(questionData: Omit<Question, 'id'>): Question {
    const question: Question = {
      ...questionData,
      id: this.generateId()
    };

    this.jsonStorage.addItem(this.jsonStorage.storageKeys.QUESTIONS, question);
    this.loadQuestions();
    return question;
  }

  getAllQuestions(): Question[] {
    return this.questionsSubject.value;
  }

  getQuestionById(id: string): Question | null {
    return this.questionsSubject.value.find(q => q.id === id) || null;
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
