export interface QuizQuestion {
  id: number;
  level: number;
  quiz: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface QuizProgress {
  user_id: string;
  level: number;
  quiz: number;
  score: number;
  best_score: number;
  stars: number;
  completed: boolean;
  attempts: number;
  updated_at?: string;
}

export interface LevelMeta {
  level: number;
  title: string;
  subtitle: string;
}
