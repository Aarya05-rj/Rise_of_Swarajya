import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { QuizLevelMap } from '../components/quiz/QuizLevelMap';
import { QuizPath } from '../components/quiz/QuizPath';
import { QuizQuestionCard } from '../components/quiz/QuizQuestionCard';
import { QuizResult } from '../components/quiz/QuizResult';
import type { LevelMeta, QuizProgress, QuizQuestion } from '../components/quiz/types';
import { getQuizProgress, getQuizQuestions, submitQuiz } from '../services/api';
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
  const [answers, setAnswers] = useState<{ questionId: number; selectedAnswer: number | null }[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState({ score: 0, stars: 0 });

  const selectedLevelMeta = useMemo(
    () => levels.find((level) => level.level === selectedLevel) || levels[0],
    [selectedLevel]
  );

  const loadProgress = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getQuizProgress(userId);
      setProgress(response.data || []);
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
    loadProgress();
  }, [loadProgress]);

  const handleSelectLevel = (level: number) => {
    setSelectedLevel(level);
    setScreen('quiz-path');
  };

  const startQuiz = async (quiz: number) => {
    try {
      setLoading(true);
      const response = await getQuizQuestions(selectedLevel, quiz);
      const nextQuestions = response.data || [];
      if (!nextQuestions.length) {
        setError('This quiz is not seeded yet. Level 1 quizzes are ready to play.');
        return;
      }
      setSelectedQuiz(quiz);
      setQuestions(nextQuestions);
      setCurrentQuestion(0);
      setAnswers([]);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setResult({ score: 0, stars: 0 });
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
    setAnswers((current) => [
      ...current.filter((item) => item.questionId !== question.id),
      { questionId: question.id, selectedAnswer: answer },
    ]);
  };

  const finishQuiz = async () => {
    try {
      setSaving(true);
      const response = await submitQuiz({
        userId,
        level: selectedLevel,
        quiz: selectedQuiz,
        answers,
      });
      const updated = response.data as QuizProgress;
      setProgress((current) => mergeProgress(current, updated));
      setResult({ score: updated.score, stars: updated.stars });
      setError('');
      setScreen('result');
    } catch (err: any) {
      const score = questions.reduce((total, question) => {
        const answer = answers.find((item) => item.questionId === question.id);
        return total + (answer?.selectedAnswer === question.correctAnswer ? 1 : 0);
      }, 0);
      const stars = score >= 9 ? 3 : score >= 7 ? 2 : score >= 5 ? 1 : 0;
      setResult({ score, stars });
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
              <QuizLevelMap levels={levels} progress={progress} onSelectLevel={handleSelectLevel} />
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
            <motion.div
              key="gameplay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,153,51,0.16),transparent_30%),linear-gradient(180deg,#1A1A1A,#3D2817)] px-4 py-8 text-cream"
            >
              <div className="mx-auto mb-8 flex max-w-3xl items-center justify-between">
                <button
                  type="button"
                  onClick={() => setScreen('quiz-path')}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-cream/80 transition hover:border-saffron/50 hover:text-saffron"
                >
                  <ArrowLeft className="h-4 w-4" /> Path
                </button>
                <div className="rounded-full bg-black/25 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-royal-gold">
                  Level {selectedLevel} . Quiz {selectedQuiz}
                </div>
              </div>
              <QuizQuestionCard
                question={questions[currentQuestion]}
                index={currentQuestion}
                total={questions.length}
                selectedAnswer={selectedAnswer}
                isAnswered={isAnswered}
                onAnswer={handleAnswer}
                onNext={goNext}
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
                total={questions.length}
                stars={result.stars}
                canGoNext={result.stars > 0 && selectedQuiz < quizCount}
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
