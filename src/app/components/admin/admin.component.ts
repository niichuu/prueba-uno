import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import qrcode from 'qrcode-generator';

import { QuestionService } from '../../services/question.service';
import { QuizStateService, QuizStatus } from '../../services/quiz-state.service';
import { Question, QuestionOption } from '../../models/question.interface';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {
  // Form data
  questionTitle: string = '';
  option1: string = '';
  option2: string = '';
  option3: string = '';
  correctAnswer: number = 1; // 1, 2, or 3

  // State
  quizStatus: QuizStatus = 'creating';
  currentQuestion: Question | null = null;
  qrCodeDataUrl: string = '';
  
  private subscriptions: Subscription[] = [];

  constructor(
    private questionService: QuestionService,
    private quizStateService: QuizStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to quiz status changes
    this.subscriptions.push(
      this.quizStateService.status$.subscribe(status => {
        this.quizStatus = status;
        if (status === 'active') {
          this.generateQRCode();
        }
      })
    );

    // Subscribe to current question changes
    this.subscriptions.push(
      this.quizStateService.currentQuestion$.subscribe(questionId => {
        if (questionId) {
          this.currentQuestion = this.questionService.getQuestionById(questionId);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  createQuestion(): void {
    console.log('🔍 Iniciando creación de pregunta...');
    
    if (!this.isFormValid()) {
      alert('Por favor completa todos los campos');
      return;
    }

    const options: QuestionOption[] = [
      { id: '1', text: this.option1, isCorrect: this.correctAnswer === 1 },
      { id: '2', text: this.option2, isCorrect: this.correctAnswer === 2 },
      { id: '3', text: this.option3, isCorrect: this.correctAnswer === 3 }
    ];

    console.log('📝 Datos de la pregunta:', {
      title: this.questionTitle,
      options: options,
      points: 10
    });

    this.questionService.createQuestion({
      title: this.questionTitle,
      options: options,
      points: 10
    }).subscribe({
      next: (question) => {
        console.log('✅ Pregunta creada exitosamente:', question);
        this.currentQuestion = question;
        alert('Pregunta creada exitosamente!');
      },
      error: (error) => {
        console.error('❌ Error creating question:', error);
        alert('Error al crear la pregunta: ' + (error.message || error));
      }
    });
  }

  startQuiz(): void {
    if (!this.currentQuestion) {
      alert('Primero debes crear una pregunta');
      return;
    }

    // Activar el quiz en el servidor y en el estado local
    this.quizStateService.setCurrentQuestion(this.currentQuestion.id);
    this.quizStateService.setQuizStatus('active');
    
    // Generar el código QR cuando se activa el quiz
    this.generateQRCode();
    
    alert('Quiz iniciado! Los participantes pueden unirse escaneando el código QR.');
  }

  finishQuiz(): void {
    this.quizStateService.setQuizStatus('finished');
    this.router.navigate(['/ranking']);
  }

  private isFormValid(): boolean {
    return !!(this.questionTitle.trim() && 
              this.option1.trim() && 
              this.option2.trim() && 
              this.option3.trim());
  }

  private generateQRCode(): void {
    try {
      // Crear la instancia correcta de QRCode
      const qr = qrcode(0, 'M');
      const contestantUrl = `${window.location.origin}/contestant`;
      qr.addData(contestantUrl);
      qr.make();
      
      // Create data URL for the QR code
      const modules = qr.getModuleCount();
      const cellSize = 4;
      const margin = cellSize * 4;
      const size = modules * cellSize + margin * 2;
      
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      
      // White background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);
      
      // Black modules
      ctx.fillStyle = '#000000';
      for (let row = 0; row < modules; row++) {
        for (let col = 0; col < modules; col++) {
          if (qr.isDark(row, col)) {
            ctx.fillRect(
              margin + col * cellSize,
              margin + row * cellSize,
              cellSize,
              cellSize
            );
          }
        }
      }
      
      this.qrCodeDataUrl = canvas.toDataURL();
      console.log('🎯 QR Code generado exitosamente para:', contestantUrl);
      console.log('📱 QR Data URL:', this.qrCodeDataUrl ? 'Generado' : 'Error');
    } catch (error) {
      console.error('❌ Error generando código QR:', error);
      this.qrCodeDataUrl = '';
    }
  }

  resetForm(): void {
    this.questionTitle = '';
    this.option1 = '';
    this.option2 = '';
    this.option3 = '';
    this.correctAnswer = 1;
  }
}
