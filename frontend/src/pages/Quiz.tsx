import React, { useCallback, useEffect, useMemo, useState } from 'react';
// Quiz page for level and quiz selection and gameplay
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { QuizLevelMap } from '../components/quiz/QuizLevelMap';
import { QuizPath } from '../components/quiz/QuizPath';
import { QuizQuestionCard } from '../components/quiz/QuizQuestionCard';
import { QuizResult } from '../components/quiz/QuizResult';
import type { LevelMeta, QuizProgress, QuizQuestion } from '../components/quiz/types';
import { getQuizProgress, getQuizQuestions, submitQuiz, getUserStats } from '../services/api';
import { useAuth } from '../context/AuthContext';

type QuizScreen = 'level-select' | 'quiz-path' | 'gameplay' | 'result';

const levels: LevelMeta[] = [
  { level: 1, title: 'Rise of Shivaji', subtitle: 'Origins, oath, courage' },
  { level: 2, title: 'Forts of Swarajya', subtitle: 'Stone crowns of the Sahyadri' },
  { level: 3, title: 'Battles & Conquests', subtitle: 'Strategy, speed, victory' },
  { level: 4, title: 'Ashtapradhan Mandal', subtitle: 'The council of statecraft' },
  { level: 5, title: 'Naval Supremacy', subtitle: 'Guardians of the coast' },
  { level: 6, title: 'Culture & Dharma', subtitle: 'Values that shaped rule' },
  { level: 7, title: "Sambhaji's Legacy", subtitle: 'Defiance and sacrifice' },
  { level: 8, title: 'Maratha Confederacy', subtitle: 'Power beyond the forts' },
  { level: 9, title: 'The Peshwa Era', subtitle: 'Administration and expansion' },
  { level: 10, title: 'Glory of Swarajya', subtitle: 'The enduring flame' },
];

const quizCount = 9;

const mergeProgress = (current: QuizProgress[], updated: QuizProgress) => {
  const next = current.filter((item) => !(item.level === updated.level && item.quiz === updated.quiz));
  return [...next, updated].sort((a, b) => a.level - b.level || a.quiz - b.quiz);
};

const isMissingQuizProgressTable = (message = '') =>
  message.includes('quiz_progress') && message.includes('schema cache');

export const Quiz: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || 'demo-user';
  const [screen, setScreen] = useState<QuizScreen>('level-select');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [selectedQuiz, setSelectedQuiz] = useState(1);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [progress, setProgress] = useState<QuizProgress[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; selectedAnswer: number | null; selectedAnswerText?: string | null }[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState({ 
    score: 0, 
    stars: 0, 
    correctCount: 0, 
    totalQuestions: 10,
    bestScore: 0,
    xpEarned: 0
  });
  const [timeLeft, setTimeLeft] = useState(15);
  const [startTime, setStartTime] = useState<number>(0);

  const selectedLevelMeta = useMemo(
    () => levels.find((level) => level.level === selectedLevel) || levels[0],
    [selectedLevel]
  );

  const [userStats, setUserStats] = useState<any>(null);

  const loadProgress = useCallback(async () => {
    try {
      setLoading(true);
      const [progressResponse, statsResponse] = await Promise.all([
        getQuizProgress(userId),
        getUserStats(userId)
      ]);
      
      setProgress(progressResponse.data || []);
      if (statsResponse.success) {
        setUserStats(statsResponse.data);
      }
      setError('');
    } catch (err: any) {
      if (isMissingQuizProgressTable(err.message)) {
        setProgress([]);
        setError('');
      } else {
        setError(err.message || 'Unable to load quiz progress.');
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    // Check if streak should reset before loading stats
    const lastQuizDate = localStorage.getItem("lastQuizDate");
    if (lastQuizDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastDate = new Date(lastQuizDate);
      lastDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 1) {
        localStorage.setItem("quizStreak", "0");
      }
    }
    loadProgress();
  }, [loadProgress]);

  // Timer Logic
  useEffect(() => {
    let timer: any;
    if (screen === 'gameplay' && !isAnswered && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isAnswered && screen === 'gameplay') {
      handleAnswer(-1); // Auto-fail the question on timeout
    }
    return () => clearInterval(timer);
  }, [screen, isAnswered, timeLeft]);

  const handleSelectLevel = (level: number) => {
    setSelectedLevel(level);
    setScreen('quiz-path');
  };

  const startQuiz = async (quiz: number) => {
    try {
      setLoading(true);
      // PERMANENT FIX: Reset all states before starting
      setCurrentQuestion(0);
      setAnswers([]);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimeLeft(15);
      setResult({ score: 0, stars: 0, correctCount: 0, totalQuestions: 10, bestScore: 0, xpEarned: 0 });

      const response = await getQuizQuestions(selectedLevel, quiz);
      const nextQuestions = response.data || [];
      if (!nextQuestions.length) {
        setError('This quiz is not seeded yet. Level 1 quizzes are ready to play.');
        return;
      }
      // Jumble options for each question
      const jumbledQuestions = nextQuestions.map((q: QuizQuestion) => {
        const options = [...q.options];
        const correctText = options[q.correctAnswer];
        
        // Fisher-Yates shuffle
        for (let i = options.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [options[i], options[j]] = [options[j], options[i]];
        }
        
        const newCorrectIndex = options.indexOf(correctText);
        return { ...q, options, correctAnswer: newCorrectIndex };
      });

      setSelectedQuiz(quiz);
      setQuestions(jumbledQuestions);
      setStartTime(Date.now());
      setError('');
      setScreen('gameplay');
    } catch (err: any) {
      setError(err.message || 'Unable to load quiz questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: number) => {
    if (isAnswered) return;
    const question = questions[currentQuestion];
    
    setSelectedAnswer(answer);
    setIsAnswered(true);

    // Save answer to the array. We calculate the score at the end from this array.
    setAnswers((current) => [
      ...current.filter((item) => item.questionId !== question.id),
      { 
        questionId: question.id, 
        selectedAnswer: answer, 
        selectedAnswerText: answer >= 0 ? question.options[answer] : null 
      },
    ]);
  };

  const finishQuiz = async () => {
    try {
      setSaving(true);
      
      // PERMANENT FIX: Calculate derived values from the answers array
      const correctAnswers = answers.filter((ans) => {
        const question = questions.find(q => q.id === ans.questionId);
        return question && ans.selectedAnswer === question.correctAnswer;
      }).length;

      const finalScore = correctAnswers * 10;
      let finalStars = 0;
      if (finalScore >= 90) finalStars = 3;
      else if (finalScore >= 60) finalStars = 2;
      else if (finalScore >= 30) finalStars = 1;

      const timeTaken = (Date.now() - startTime) / 1000;
      
      const response = await submitQuiz({
        userId,
        level: selectedLevel,
        quiz: selectedQuiz,
        answers, // Send exact answers array to backend
        timeTaken,
      });

      const updated = response.data as QuizProgress;
      setProgress((current) => mergeProgress(current, updated));
      
      // Use the derived values for the result screen to ensure 100% accuracy
      setResult({ 
        score: finalScore, 
        stars: finalStars,
        correctCount: correctAnswers,
        totalQuestions: 10,
        bestScore: response.bestScore || finalScore,
        xpEarned: finalScore
      });

      // Update local storage best score for this specific quiz
      localStorage.setItem(`bestScore_L${selectedLevel}_Q${selectedQuiz}`, String(response.bestScore || finalScore));

      // PERMANENT STREAK FIX
      if (finalScore >= 70) {
        const today = new Date().toDateString();
        const lastQuizDate = localStorage.getItem("lastQuizDate");
        let currentStreak = Number(localStorage.getItem("quizStreak")) || 0;

        if (today !== lastQuizDate) {
          if (!lastQuizDate) {
            currentStreak = 1;
          } else {
            const lastDate = new Date(lastQuizDate);
            const currentDate = new Date(today);
            const diffTime = currentDate.getTime() - lastDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
              currentStreak += 1;
            } else if (diffDays > 1) {
              currentStreak = 1;
            } else if (diffDays === 0) {
              // Same day case (redundant but safe)
            }
          }
          localStorage.setItem("quizStreak", String(currentStreak));
          localStorage.setItem("lastQuizDate", today);
        }
      }

      // PERMANENT PROGRESS FIX
      if (finalScore >= 70) {
        const completed = JSON.parse(localStorage.getItem("completedQuizzes") || "{}");
        completed[`level${selectedLevel}_quiz${selectedQuiz}`] = true;
        localStorage.setItem("completedQuizzes", JSON.stringify(completed));
      }

      setError('');
      setScreen('result');
    } catch (err: any) {
      // Fallback calculation in case of API error
      const correctAnswers = answers.filter((ans) => {
        const question = questions.find(q => q.id === ans.questionId);
        return question && ans.selectedAnswer === question.correctAnswer;
      }).length;
      const finalScore = correctAnswers * 10;
      let finalStars = 0;
      if (finalScore >= 90) finalStars = 3;
      else if (finalScore >= 60) finalStars = 2;
      else if (finalScore >= 30) finalStars = 1;

      setResult({ 
        score: finalScore, 
        stars: finalStars, 
        correctCount: correctAnswers, 
        totalQuestions: 10,
        bestScore: finalScore,
        xpEarned: finalScore
      });

      // PERMANENT PROGRESS FIX (Fallback)
      if (finalScore >= 70) {
        const completed = JSON.parse(localStorage.getItem("completedQuizzes") || "{}");
        completed[`level${selectedLevel}_quiz${selectedQuiz}`] = true;
        localStorage.setItem("completedQuizzes", JSON.stringify(completed));
      }

      setError(err.message || 'Progress could not be saved. Your result is shown locally.');
      setScreen('result');
    } finally {
      setSaving(false);
    }
  };

  const goNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((current) => current + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimeLeft(15);
      return;
    }
    finishQuiz();
  };

  const retryQuiz = () => startQuiz(selectedQuiz);

  const goNextQuiz = () => {
    if (selectedQuiz < quizCount && result.stars > 0) {
      startQuiz(selectedQuiz + 1);
      return;
    }
    setScreen('quiz-path');
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] lg:flex">
      <Sidebar />
      <main className="min-h-screen flex-1 lg:ml-64">
        {(loading || saving) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm lg:left-64">
            <Loader2 className="h-12 w-12 animate-spin text-saffron" />
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed left-4 right-4 top-4 z-50 mx-auto flex max-w-xl items-center gap-3 rounded-2xl border border-red-400/30 bg-red-950/90 px-4 py-3 text-sm font-bold text-red-100 shadow-2xl lg:left-72"
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {screen === 'level-select' && (
            <motion.div key="levels" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <QuizLevelMap levels={levels} progress={progress} userStats={userStats} onSelectLevel={handleSelectLevel} />
            </motion.div>
          )}

          {screen === 'quiz-path' && (
            <motion.div key="path" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <QuizPath
                level={selectedLevelMeta}
                progress={progress}
                onBack={() => setScreen('level-select')}
                onStartQuiz={startQuiz}
              />
            </motion.div>
          )}

          {screen === 'gameplay' && questions[currentQuestion] && (
            <motion.div key="gameplay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <QuizQuestionCard
                question={questions[currentQuestion]}
                index={currentQuestion}
                total={questions.length}
                selectedAnswer={selectedAnswer}
                isAnswered={isAnswered}
                onAnswer={handleAnswer}
                onNext={goNext}
                onBack={() => setScreen('quiz-path')}
                timeLeft={timeLeft}
                levelNumber={selectedLevel}
                quizNumber={selectedQuiz}
              />
            </motion.div>
          )}

          {screen === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.2),transparent_34%),linear-gradient(180deg,#1A1A1A,#3D2817)]"
            >
              <QuizResult
                score={result.score}
                correctCount={result.correctCount}
                totalQuestions={result.totalQuestions}
                bestScore={result.bestScore}
                xpEarned={result.xpEarned}
                stars={result.stars}
                canGoNext={result.stars > 0 && selectedQuiz < quizCount}
                onBack={() => setScreen('quiz-path')}
                onRetry={retryQuiz}
                onNextQuiz={goNextQuiz}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
