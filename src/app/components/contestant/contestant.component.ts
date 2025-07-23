import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { QuestionService } from '../../services/question.service';
import { GameService } from '../../services/game.service';
import { QuizStateService } from '../../services/quiz-state.service';
import { Question, QuestionOption } from '../../models/question.interface';

@Component({
  selector: 'app-contestant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contestant.component.html',
  styleUrls: ['./contestant.component.css']
})
export class ContestantComponent implements OnInit, OnDestroy {
  // User state
  userName: string = '';
  userId: string = '';
  hasJoined: boolean = false;
  hasAnswered: boolean = false;
  
  // Question state
  currentQuestion: Question | null = null;
  selectedAnswer: string = '';
  answerResult: { isCorrect: boolean; message: string } | null = null;
  
  // Quiz state
  isQuizActive: boolean = false;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private questionService: QuestionService,
    private gameService: GameService,
    private quizStateService: QuizStateService
  ) {}

  ngOnInit(): void {
    // Subscribe to quiz status
    this.subscriptions.push(
      this.quizStateService.status$.subscribe(status => {
        this.isQuizActive = status === 'active';
        if (!this.isQuizActive) {
          this.currentQuestion = null;
        }
      })
    );

    // Subscribe to current question
    this.subscriptions.push(
      this.quizStateService.currentQuestion$.subscribe(questionId => {
        if (questionId && this.isQuizActive) {
          this.currentQuestion = this.questionService.getQuestionById(questionId);
          // Check if user already answered
          if (this.userId) {
            this.checkUserAnswer();
          }
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  joinQuiz(): void {
    if (!this.userName.trim()) {
      alert('Por favor ingresa tu nombre');
      return;
    }

    if (!this.isQuizActive) {
      alert('El quiz no está activo en este momento');
      return;
    }

    this.userId = this.generateUserId();
    this.hasJoined = true;
    this.checkUserAnswer();
    
    // Start game for this user
    this.gameService.startGame(this.userId, this.userName.trim()).subscribe({
      next: () => {
        console.log('Game started successfully');
      },
      error: (error) => {
        console.error('Error starting game:', error);
      }
    });
  }

  selectAnswer(optionId: string): void {
    if (this.hasAnswered || !this.currentQuestion || !this.userId) {
      return;
    }

    this.selectedAnswer = optionId;
    
    // Submit answer
    this.gameService.submitAnswer(
      this.userId,
      this.userName,
      this.currentQuestion.id,
      optionId
    ).subscribe({
      next: (success) => {
        if (success) {
          this.hasAnswered = true;
          this.showAnswerResult(optionId);
        }
      },
      error: (error) => {
        console.error('Error submitting answer:', error);
      }
    });
  }

  private showAnswerResult(selectedOptionId: string): void {
    if (!this.currentQuestion) return;

    const selectedOption = this.currentQuestion.options.find(opt => opt.id === selectedOptionId);
    const correctOption = this.currentQuestion.options.find(opt => opt.isCorrect);
    
    if (selectedOption && correctOption) {
      const isCorrect = selectedOption.isCorrect;
      this.answerResult = {
        isCorrect,
        message: isCorrect 
          ? `¡Correcto! Ganaste ${this.currentQuestion.points} puntos.`
          : `Incorrecto. La respuesta correcta era: ${correctOption.text}`
      };
    }
  }

  private checkUserAnswer(): void {
    if (!this.userId || !this.currentQuestion) return;
    
    this.gameService.getUserResponse(this.userId, this.currentQuestion.id).subscribe({
      next: (userResponse) => {
        if (userResponse) {
          this.hasAnswered = true;
          this.selectedAnswer = userResponse.selectedOptionId;
          this.showAnswerResult(userResponse.selectedOptionId);
        } else {
          this.hasAnswered = false;
          this.answerResult = null;
        }
      },
      error: (error) => {
        console.error('Error checking user answer:', error);
        this.hasAnswered = false;
        this.answerResult = null;
      }
    });
  }

  private generateUserId(): string {
    return `contestant_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }

  getButtonClass(option: QuestionOption): string {
    const baseClass = 'answer-btn';
    
    if (!this.hasAnswered) {
      return baseClass;
    }
    
    if (option.id === this.selectedAnswer) {
      return `${baseClass} ${option.isCorrect ? 'correct' : 'incorrect'}`;
    }
    
    if (option.isCorrect) {
      return `${baseClass} correct-answer`;
    }
    
    return `${baseClass} disabled`;
  }
}
