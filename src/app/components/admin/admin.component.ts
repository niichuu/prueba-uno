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
        // El QR se genera cuando se inicia el quiz
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

    if (!this.currentQuestion.id) {
      alert('Error: La pregunta no tiene un ID válido');
      console.error('❌ Pregunta sin ID:', this.currentQuestion);
      return;
    }

    console.log('🚀 Iniciando quiz con pregunta:', this.currentQuestion);
    
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
      if (!this.currentQuestion || !this.currentQuestion.id) {
        console.error('❌ No hay pregunta actual o ID faltante:', this.currentQuestion);
        return;
      }

      const baseUrl = window.location.origin;
      // ✅ Incluir ID específico de la pregunta en la URL
      const contestantUrl = `${baseUrl}/contestant?questionId=${this.currentQuestion.id}`;
      
      console.log('🎯 Generando QR para pregunta ID:', this.currentQuestion.id);
      console.log('📱 URL completa:', contestantUrl);
      
      const qr = qrcode(0, 'M');
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
      console.log('🎯 QR Code generado exitosamente para pregunta:', this.currentQuestion?.id);
      console.log('📱 URL del QR:', contestantUrl);
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

  copyQuizLink(): void {
    if (!this.currentQuestion || !this.currentQuestion.id) {
      alert('No hay una pregunta activa para copiar');
      return;
    }

    const baseUrl = window.location.origin;
    const contestantUrl = `${baseUrl}/contestant?questionId=${this.currentQuestion.id}`;
    
    // Intentar usar el API moderno del portapapeles
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(contestantUrl).then(() => {
        alert('¡Link copiado al portapapeles!');
        console.log('📋 Link copiado:', contestantUrl);
      }).catch(err => {
        console.error('❌ Error con navigator.clipboard:', err);
        this.fallbackCopyToClipboard(contestantUrl);
      });
    } else {
      // Usar método fallback
      this.fallbackCopyToClipboard(contestantUrl);
    }
  }

  private fallbackCopyToClipboard(text: string): void {
    try {
      // Crear un elemento de texto temporal
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      
      // Seleccionar y copiar el texto
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        alert('¡Link copiado al portapapeles!');
        console.log('📋 Link copiado (fallback):', text);
      } else {
        throw new Error('execCommand failed');
      }
    } catch (err) {
      console.error('❌ Error con fallback copy:', err);
      // Último recurso: mostrar el link para copiar manualmente
      const userCopied = prompt('No se pudo copiar automáticamente. Copia este link manualmente:', text);
      if (userCopied !== null) {
        console.log('📋 Link mostrado para copia manual:', text);
      }
    }
  }
}
