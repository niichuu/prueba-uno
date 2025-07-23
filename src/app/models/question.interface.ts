export interface Question {
  id: string;
  title: string;
  options: QuestionOption[];
  points: number;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}
