import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { QuestionService } from '../../services/question.service';
import { GameService } from '../../services/game.service';
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
  
  // Question state
  currentQuestion: Question | null = null;
  selectedAnswer: string = '';
  hasAnswered: boolean = false;
  answerResult: { isCorrect: boolean; message: string; correctOption: QuestionOption } | null = null;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private questionService: QuestionService,
    private gameService: GameService
  ) {}

  ngOnInit(): void {
    // Leer el questionId de la URL
    this.subscriptions.push(
      this.route.queryParams.subscribe(params => {
        const questionId = params['questionId'];
        
        if (questionId) {
          console.log('🔍 Loading question ID:', questionId);
          this.loadQuestion(questionId);
        } else {
          console.error('❌ No questionId provided in URL');
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadQuestion(questionId: string): void {
    this.questionService.getQuestionByIdAsync(questionId).subscribe({
      next: (question) => {
        if (question) {
          this.currentQuestion = question;
          console.log('✅ Question loaded:', question.title);
        } else {
          console.error('❌ Question not found:', questionId);
        }
      },
      error: (error) => {
        console.error('❌ Error loading question:', error);
      }
    });
  }

  joinQuiz(): void {
    if (!this.userName.trim()) {
      alert('Por favor ingresa tu nombre');
      return;
    }

    if (!this.currentQuestion) {
      alert('La pregunta no está disponible');
      return;
    }

    // Generar ID único para el usuario
    this.userId = this.generateUserId();
    
    console.log('🚀 Registrando participante:', {
      userName: this.userName,
      userId: this.userId,
      questionId: this.currentQuestion.id
    });

    // Registrar participante en la API
    this.gameService.startGame(this.userId, this.userName).subscribe({
      next: (response: any) => {
        console.log('✅ Participante registrado exitosamente:', response);
        this.hasJoined = true;
      },
      error: (error: any) => {
        console.error('❌ Error registrando participante:', error);
        // Permitir continuar aunque falle el registro
        this.hasJoined = true;
      }
    });
  }

  selectAnswer(optionId: string): void {
    if (this.hasAnswered || !this.currentQuestion) {
      return;
    }

    this.selectedAnswer = optionId;
    this.hasAnswered = true;

    // Encontrar la opción seleccionada y la correcta
    const selectedOption = this.currentQuestion.options.find(o => o.id === optionId);
    const correctOption = this.currentQuestion.options.find(o => o.isCorrect);

    if (selectedOption && correctOption) {
      this.answerResult = {
        isCorrect: selectedOption.isCorrect,
        message: selectedOption.isCorrect 
          ? `¡Correcto! La respuesta es: ${selectedOption.text}` 
          : `Incorrecto. La respuesta correcta es: ${correctOption.text}`,
        correctOption
      };

      console.log('📊 Answer result:', this.answerResult);

      // Enviar respuesta a la API
      this.gameService.submitAnswer(
        this.userId, 
        this.userName, 
        this.currentQuestion.id, 
        optionId
      ).subscribe({
        next: (success: boolean) => {
          console.log('✅ Respuesta enviada exitosamente:', success);
        },
        error: (error: any) => {
          console.error('❌ Error enviando respuesta:', error);
        }
      });
    }
  }

  // Método para obtener clase CSS del botón
  getButtonClass(option: QuestionOption): string {
    if (!this.hasAnswered) {
      return '';
    }

    if (option.isCorrect) {
      return 'correct';
    } else if (option.id === this.selectedAnswer) {
      return 'incorrect';
    }

    return 'disabled';
  }

  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }
}
