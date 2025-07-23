import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { GameService } from '../../services/game.service';
import { QuestionService } from '../../services/question.service';
import { QuizStateService } from '../../services/quiz-state.service';
import { UserResponse } from '../../models/user-response.interface';
import { Question } from '../../models/question.interface';

interface RankingEntry {
  userName: string;
  selectedAnswer: string;
  isCorrect: boolean;
  points: number;
  rank: number;
}

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.css']
})
export class RankingComponent implements OnInit {
  rankings: RankingEntry[] = [];
  currentQuestion: Question | null = null;
  totalParticipants: number = 0;

  constructor(
    private gameService: GameService,
    private questionService: QuestionService,
    private quizStateService: QuizStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRankingData();
  }

  private loadRankingData(): void {
    // Get current question
    const questionId = this.quizStateService.getCurrentQuestionId();
    if (!questionId) {
      console.error('No hay pregunta activa');
      return;
    }

    this.currentQuestion = this.questionService.getQuestionById(questionId);
    if (!this.currentQuestion) {
      console.error('Pregunta no encontrada');
      return;
    }

    // Get all responses for this question
    const allResponses = this.gameService.getAllResponses();
    const questionResponses = allResponses.filter(r => r.questionId === questionId);
    
    // Create ranking entries
    const rankings: RankingEntry[] = questionResponses.map(response => {
      const question = this.currentQuestion!;
      const correctOption = question.options.find(opt => opt.isCorrect);
      const isCorrect = correctOption ? response.selectedOptionId === correctOption.id : false;
      
      return {
        userName: response.userName,
        selectedAnswer: response.selectedOptionText,
        isCorrect,
        points: isCorrect ? question.points : 0,
        rank: 0 // Will be set after sorting
      };
    });

    // Sort by points (descending) and assign ranks
    rankings.sort((a, b) => b.points - a.points);
    
    let currentRank = 1;
    rankings.forEach((entry, index) => {
      if (index > 0 && rankings[index - 1].points > entry.points) {
        currentRank = index + 1;
      }
      entry.rank = currentRank;
    });

    this.rankings = rankings;
    this.totalParticipants = rankings.length;
  }

  goToAdmin(): void {
    this.quizStateService.resetQuiz();
    this.router.navigate(['/admin']);
  }

  newQuiz(): void {
    // Clear all data
    this.gameService.endGame();
    this.quizStateService.resetQuiz();
    
    // Clear storage
    const jsonStorage = (this.gameService as any).jsonStorage;
    jsonStorage.clearAll();
    
    this.router.navigate(['/admin']);
  }

  getRankingClass(rank: number): string {
    switch (rank) {
      case 1: return 'gold';
      case 2: return 'silver';
      case 3: return 'bronze';
      default: return '';
    }
  }

  getRankingIcon(rank: number): string {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${rank}°`;
    }
  }

  getCorrectAnswerText(): string {
    if (!this.currentQuestion) return '';
    const correctOption = this.currentQuestion.options.find(opt => opt.isCorrect);
    return correctOption ? correctOption.text : '';
  }
}
