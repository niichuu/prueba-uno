import { TestBed } from '@angular/core/testing';
import { QuestionService } from './question.service';
import { GameService } from './game.service';
import { UserService } from './user.service';
import { JsonStorageService } from './json-storage.service';

describe('Quiz Services Integration', () => {
  let questionService: QuestionService;
  let gameService: GameService;
  let userService: UserService;
  let jsonStorageService: JsonStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    questionService = TestBed.inject(QuestionService);
    gameService = TestBed.inject(GameService);
    userService = TestBed.inject(UserService);
    jsonStorageService = TestBed.inject(JsonStorageService);
  });

  beforeEach(() => {
    // Clear storage before each test
    jsonStorageService.clearAll();
  });

  it('should create services', () => {
    expect(questionService).toBeTruthy();
    expect(gameService).toBeTruthy();
    expect(userService).toBeTruthy();
    expect(jsonStorageService).toBeTruthy();
  });

  it('should initialize default questions', () => {
    const questions = questionService.getAllQuestions();
    expect(questions.length).toBe(3);
    expect(questions[0].title).toBe('¿Cuál es la capital de Francia?');
  });

  it('should set and get current user', () => {
    userService.setCurrentUser('Test User');
    const currentUser = userService.getCurrentUser();
    
    expect(currentUser).not.toBeNull();
    expect(currentUser?.name).toBe('Test User');
    expect(currentUser?.id).toContain('user_');
  });

  it('should start and play a complete game', () => {
    // Set user
    userService.setCurrentUser('Test Player');
    const user = userService.getCurrentUser()!;
    
    // Start game
    gameService.startGame(user.id, user.name);
    
    // Get first question
    let currentQuestion = gameService.getCurrentQuestion();
    expect(currentQuestion).not.toBeNull();
    expect(gameService.isGameComplete()).toBeFalse();
    
    // Submit answer for each question
    const questions = questionService.getAllQuestions();
    questions.forEach((question, index) => {
      const correctOption = question.options.find(opt => opt.isCorrect)!;
      const success = gameService.submitAnswer(user.id, correctOption.id);
      expect(success).toBeTrue();
    });
    
    // Check game completion
    expect(gameService.isGameComplete()).toBeTrue();
    
    // Calculate score
    const result = gameService.calculateScore(user.id, user.name);
    expect(result.totalScore).toBe(30); // 10 + 5 + 15
    expect(result.correctAnswers).toBe(3);
    expect(result.totalQuestions).toBe(3);
  });

  it('should store and retrieve game results', () => {
    const mockResult = {
      userId: 'test-user',
      userName: 'Test User',
      totalScore: 25,
      totalQuestions: 3,
      correctAnswers: 2
    };
    
    jsonStorageService.addItem(jsonStorageService.storageKeys.RESULTS, mockResult);
    const results = gameService.getAllResults();
    
    expect(results.length).toBe(1);
    expect(results[0].totalScore).toBe(25);
  });

  it('should track game progress', () => {
    userService.setCurrentUser('Test Player');
    const user = userService.getCurrentUser()!;
    
    gameService.startGame(user.id, user.name);
    
    let progress = gameService.getGameProgress();
    expect(progress.current).toBe(0);
    expect(progress.total).toBe(3);
    expect(progress.percentage).toBe(0);
    
    // Submit one answer
    const firstQuestion = gameService.getCurrentQuestion()!;
    const correctOption = firstQuestion.options.find(opt => opt.isCorrect)!;
    gameService.submitAnswer(user.id, correctOption.id);
    
    progress = gameService.getGameProgress();
    expect(progress.current).toBe(1);
    expect(progress.percentage).toBe(33);
  });
});
