import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Flame,
  HelpCircle,
  Loader2,
  Lock,
  RotateCcw,
  Sparkles,
  Star,
  Trophy,
  XCircle,
  Zap,
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

type Screen = 'levels' | 'quizzes' | 'quiz' | 'result';

interface Level {
  id: number;
  title: string;
  subtitle: string;
  quizCount: number;
  unlocked: boolean;
  completed: boolean;
  completedQuizzes: number;
  totalQuizzes: number;
}

interface QuizItem {
  id: string;
  level: number;
  quiz: number;
  title: string;
  questionCount: number;
  unlocked: boolean;
  completed: boolean;
  score: number;
  bestScore: number;
  stars: number;
  attempts: number;
}

interface Question {
  id: number;
  quizId: string;
  level: number;
  quiz: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Progress {
  level: number;
  quiz: number;
  score: number;
  best_score?: number;
  stars: number;
  completed: boolean;
  attempts?: number;
  updated_at?: string;
  last_played?: string;
}

const fallbackLevels: Level[] = [
  ['Rise of Shivaji', 'Origins, oath, courage'],
  ['Forts of Swarajya', 'Citadels and strategy'],
  ['Battles & Conquests', 'Speed, surprise, victory'],
  ['Ashtapradhan Mandal', 'Council of statecraft'],
  ['Naval Supremacy', 'Guardians of the coast'],
  ['Culture & Dharma', 'Values of governance'],
  ["Sambhaji's Legacy", 'Defiance and sacrifice'],
  ['Maratha Confederacy', 'Power beyond forts'],
  ['The Peshwa Era', 'Expansion and administration'],
  ['Glory of Swarajya', 'The enduring flame'],
].map(([title, subtitle], index) => ({
  id: index + 1,
  title,
  subtitle,
  quizCount: 9,
  unlocked: index === 0,
  completed: false,
  completedQuizzes: 0,
  totalQuizzes: 9,
}));

const passingScore = 70;
const questionTime = 30;
const apiBase = '/api';

const getStars = (score: number) => {
  if (score >= 90) return 3;
  if (score >= 70) return 2;
  if (score >= 50) return 1;
  return 0;
};

const fallbackQuestions: Question[] = [
  {
    id: 1101,
    quizId: '1-1',
    level: 1,
    quiz: 1,
    question: 'At which temple was the sacred oath of Swarajya taken in 1645?',
    options: ['Tuljapur', 'Raireshwar', 'Jejuri', 'Trimbakeshwar'],
    correctAnswer: 1,
  },
  {
    id: 1102,
    quizId: '1-1',
    level: 1,
    quiz: 1,
    question: 'Which fort was the first to be captured by Shivaji Maharaj in 1646?',
    options: ['Raigad', 'Torna', 'Shivneri', 'Sinhagad'],
    correctAnswer: 1,
  },
  {
    id: 1103,
    quizId: '1-1',
    level: 1,
    quiz: 1,
    question: 'Who sacrificed his life at Pavankhind in 1660?',
    options: ['Tanaji Malusare', 'Baji Prabhu Deshpande', 'Netaji Palkar', 'Yesaji Kank'],
    correctAnswer: 1,
  },
  {
    id: 1104,
    quizId: '1-1',
    level: 1,
    quiz: 1,
    question: 'In which year did the midnight raid on Shaista Khan take place in Pune?',
    options: ['1659', '1663', '1666', '1674'],
    correctAnswer: 1,
  },
  {
    id: 1105,
    quizId: '1-1',
    level: 1,
    quiz: 1,
    question: 'Which wealthy Mughal port city was raided by Shivaji Maharaj in 1664?',
    options: ['Surat', 'Goa', 'Mumbai', 'Kochi'],
    correctAnswer: 0,
  },
  {
    id: 1106,
    quizId: '1-1',
    level: 1,
    quiz: 1,
    question: 'From which Mughal city did Shivaji Maharaj make his escape in sweet baskets?',
    options: ['Delhi', 'Agra', 'Aurangabad', 'Burhanpur'],
    correctAnswer: 1,
  },
  {
    id: 1107,
    quizId: '1-1',
    level: 1,
    quiz: 1,
    question: 'Who famously said, "The fort is won, but the lion is gone"?',
    options: ['Jijabai', 'Shivaji Maharaj', 'Sambhaji Maharaj', 'Soyarabai'],
    correctAnswer: 1,
  },
  {
    id: 1108,
    quizId: '1-1',
    level: 1,
    quiz: 1,
    question: 'On which date in 1674 was Shivaji Maharaj crowned at Raigad?',
    options: ['January 1', 'April 15', 'June 6', 'October 24'],
    correctAnswer: 2,
  },
  {
    id: 1109,
    quizId: '1-1',
    level: 1,
    quiz: 1,
    question: 'What was the name of the grand Southern Campaign led in 1677?',
    options: ['Dakshin Digvijay', 'Konkan Conquest', 'Gondwana Raid', 'Carnatic March'],
    correctAnswer: 0,
  },
  {
    id: 1110,
    quizId: '1-1',
    level: 1,
    quiz: 1,
    question: 'At which fort did Chhatrapati Shivaji Maharaj pass away in 1680?',
    options: ['Shivneri', 'Pratapgad', 'Raigad', 'Sindhudurg'],
    correctAnswer: 2,
  },
];

const isProgressComplete = (item?: Progress) =>
  Boolean(item?.completed && (item.best_score ?? item.score ?? 0) >= passingScore);

const buildFallbackQuizzes = (level: Level, progress: Progress[]): QuizItem[] =>
  Array.from({ length: level.totalQuizzes || level.quizCount || 9 }).map((_, index) => {
    const quiz = index + 1;
    const saved = progress.find((item) => item.level === level.id && item.quiz === quiz);
    const previous = progress.find((item) => item.level === level.id && item.quiz === quiz - 1);
    const bestScore = saved?.best_score ?? saved?.score ?? 0;

    return {
      id: `${level.id}-${quiz}`,
      level: level.id,
      quiz,
      title: `Challenge ${quiz}`,
      questionCount: 10,
      unlocked: level.unlocked && (quiz === 1 || isProgressComplete(previous)),
      completed: isProgressComplete(saved),
      score: saved?.score ?? 0,
      bestScore,
      stars: saved?.stars ?? getStars(bestScore),
      attempts: saved?.attempts ?? 0,
    };
  });

const makeFallbackQuestions = (quizItem: QuizItem): Question[] =>
  fallbackQuestions.map((question, index) => ({
    ...question,
    id: quizItem.level * 1000 + quizItem.quiz * 100 + index + 1,
    quizId: quizItem.id,
    level: quizItem.level,
    quiz: quizItem.quiz,
  }));

const readJson = async (response: Response) => {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
};

export const Quiz: React.FC = () => {
  const { user, session } = useAuth();
  const userId = user?.id || 'demo-user';
  const [screen, setScreen] = useState<Screen>('levels');
  const [levels, setLevels] = useState<Level[]>(fallbackLevels);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<Level>(fallbackLevels[0]);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizItem | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number | null>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(questionTime);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [result, setResult] = useState({ score: 0, stars: 0, xp: 0, passed: false, bestScore: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const current = questions[currentQuestion];
  const currentCorrect = current ? selectedOption === current.correctAnswer : false;
  const totalXp = progress.reduce((sum, item) => sum + (item.best_score || item.score || 0) + (item.stars || 0) * 25, 0);
  const streak = progress.some((item) => {
    const date = item.last_played || item.updated_at;
    return date && new Date(date).toDateString() === new Date().toDateString();
  }) ? 1 : 0;

  const selectedLevelProgress = useMemo(
    () => progress.filter((item) => item.level === selectedLevel.id),
    [progress, selectedLevel.id]
  );

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const headers = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined;
      const [levelResponse, progressResponse] = await Promise.all([
        fetch(`${apiBase}/levels?userId=${userId}`, { headers }),
        fetch(`${apiBase}/user-progress?userId=${userId}`, { headers }),
      ]);
      if (!levelResponse.ok || !progressResponse.ok) throw new Error('Quiz API is unavailable.');
      const levelPayload = await readJson(levelResponse);
      const progressPayload = await readJson(progressResponse);
      setLevels(levelPayload.data?.length ? levelPayload.data : fallbackLevels);
      setProgress(progressPayload.data || []);
    } catch {
      setLevels(fallbackLevels);
      setProgress([]);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token, userId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (screen !== 'quiz' || isAnswered) return;
    if (timeLeft <= 0) {
      handleAnswer(null);
      return;
    }

    const timer = window.setTimeout(() => setTimeLeft((currentTime) => currentTime - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [screen, timeLeft, isAnswered]);

  const openLevel = async (level: Level) => {
    if (!level.unlocked) return;

    try {
      setLoading(true);
      setError('');
      const headers = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined;
      const response = await fetch(`${apiBase}/quizzes/${level.id}?userId=${userId}`, { headers });
      const payload = await readJson(response);
      if (!response.ok) throw new Error(payload.error || 'Unable to load quizzes.');

      setSelectedLevel(level);
      setQuizzes(payload.data || []);
      setScreen('quizzes');
    } catch (err: any) {
      setSelectedLevel(level);
      setQuizzes(buildFallbackQuizzes(level, progress));
      setScreen('quizzes');
      setError(err.message || 'Showing local quiz path. Progress sync is unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (quiz: QuizItem) => {
    if (!quiz.unlocked) return;

    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${apiBase}/questions/${quiz.id}`);
      const payload = await readJson(response);
      const nextQuestions = payload.data || [];

      if (!response.ok || nextQuestions.length !== 10) {
        throw new Error(payload.error || 'This quiz needs exactly 10 questions.');
      }

      setSelectedQuiz(quiz);
      setQuestions(nextQuestions);
      setCurrentQuestion(0);
      setSelectedAnswers({});
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(questionTime);
      setStartedAt(Date.now());
      setScreen('quiz');
    } catch (err: any) {
      const localQuestions = makeFallbackQuestions(quiz);
      setSelectedQuiz(quiz);
      setQuestions(localQuestions);
      setCurrentQuestion(0);
      setSelectedAnswers({});
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(questionTime);
      setStartedAt(Date.now());
      setScreen('quiz');
      setError(err.message || 'Playing local questions. Progress sync is unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (option: number | null) => {
    if (isAnswered || !current) return;
    setSelectedOption(option);
    setSelectedAnswers((answers) => ({ ...answers, [current.id]: option }));
    setIsAnswered(true);
  };

  const submitQuiz = async () => {
    if (!selectedQuiz) return;

    const correct = questions.reduce((total, question) => {
      return total + (selectedAnswers[question.id] === question.correctAnswer ? 1 : 0);
    }, 0);
    const score = Math.round((correct / Math.max(questions.length, 1)) * 100);
    const stars = getStars(score);
    const localResult = {
      score,
      stars,
      xp: correct * 10,
      passed: score >= passingScore,
      bestScore: Math.max(score, selectedQuiz.bestScore || 0),
    };

    setResult(localResult);
    setScreen('result');

    try {
      const answers = questions.map((question) => ({
        questionId: question.id,
        selectedAnswer: selectedAnswers[question.id] ?? null,
        selectedAnswerText:
          selectedAnswers[question.id] === null || selectedAnswers[question.id] === undefined
            ? null
            : question.options[selectedAnswers[question.id] as number],
      }));

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;

      const response = await fetch(`${apiBase}/submit-quiz`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId,
          quizId: selectedQuiz.id,
          answers,
          timeTaken: startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0,
        }),
      });
      const payload = await readJson(response);

      if (response.ok) {
        setResult((currentResult) => ({
          ...currentResult,
          score: payload.score ?? currentResult.score,
          stars: payload.stars ?? currentResult.stars,
          xp: payload.xp ?? currentResult.xp,
          passed: payload.passed ?? currentResult.passed,
          bestScore: payload.bestScore ?? currentResult.bestScore,
        }));
        setQuizzes(payload.unlockedQuizzes || quizzes);
        setLevels(payload.levels || levels);
        await loadDashboard();
      }
    } catch (err) {
      console.error('Submit quiz failed:', err);
    }
  };

  const goNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((index) => index + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(questionTime);
      return;
    }

    submitQuiz();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <Sidebar />
      <main className="min-h-screen flex-1 p-4 pt-20 md:p-8 lg:ml-64 lg:pt-8">
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm lg:left-64">
            <Loader2 className="h-12 w-12 animate-spin text-saffron" />
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {screen === 'levels' && (
            <motion.div key="levels" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <header className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.35em] text-saffron">Quiz Journey</p>
                  <h1 className="text-4xl font-black text-white md:text-6xl">Swarajya Lessons</h1>
                  <p className="mt-3 max-w-2xl text-gray-400">Clear each quiz path, earn stars, and unlock the next chapter.</p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <Stat icon={<Flame className="h-5 w-5" />} label="Streak" value={streak} />
                  <Stat icon={<Zap className="h-5 w-5" />} label="XP" value={totalXp} />
                  <Stat icon={<Trophy className="h-5 w-5" />} label="Cleared" value={progress.filter((item) => item.completed).length} />
                </div>
              </header>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {levels.map((level, index) => (
                  <LevelCard key={level.id} level={level} index={index} onClick={() => openLevel(level)} />
                ))}
              </div>
            </motion.div>
          )}

          {screen === 'quizzes' && (
            <motion.div key="quizzes" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}>
              <button
                type="button"
                onClick={() => setScreen('levels')}
                className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#111] px-4 py-2 text-sm font-bold text-gray-400 hover:text-saffron"
              >
                <ArrowLeft className="h-4 w-4" /> Levels
              </button>

              <header className="mb-8 text-center">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-saffron">Level {selectedLevel.id}</p>
                <h1 className="mt-2 text-4xl font-black text-white">{selectedLevel.title}</h1>
                <p className="mt-2 text-gray-400">{selectedLevelProgress.filter((item) => item.completed).length}/9 quizzes completed</p>
              </header>

              <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {quizzes.map((quiz, index) => (
                  <QuizCard key={quiz.id} quiz={quiz} index={index} onClick={() => startQuiz(quiz)} />
                ))}
              </div>
            </motion.div>
          )}

          {screen === 'quiz' && current && (
            <motion.div key="quiz" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="mx-auto max-w-3xl">
              <div className="mb-8 flex items-center justify-between gap-4">
                <button onClick={() => setScreen('quizzes')} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#111] px-4 py-2 text-sm font-bold text-gray-400 hover:text-saffron">
                  <ArrowLeft className="h-4 w-4" /> Quizzes
                </button>
                <div className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 font-black ${timeLeft <= 10 ? 'border-red-500/40 bg-red-500/10 text-red-300' : 'border-white/10 bg-[#111] text-gray-300'}`}>
                  <Clock className="h-4 w-4" /> {timeLeft}s
                </div>
              </div>

              <div className="mb-8">
                <div className="mb-3 flex justify-between text-sm font-black text-gray-500">
                  <span>Level {selectedLevel.id} . Quiz {selectedQuiz?.quiz} . Question {currentQuestion + 1}/10</span>
                  <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/5">
                  <motion.div className="h-full bg-gradient-to-r from-saffron to-royal-gold" animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#111] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.25)] md:p-8">
                <h2 className="mb-8 text-2xl font-black leading-snug text-white md:text-3xl">{current.question}</h2>
                <div className="grid gap-4">
                  {current.options.map((option, index) => {
                    const correct = index === current.correctAnswer;
                    const selected = selectedOption === index;
                    const revealCorrect = isAnswered && correct;
                    const revealWrong = isAnswered && selected && !correct;

                    return (
                      <button
                        key={option}
                        disabled={isAnswered}
                        onClick={() => handleAnswer(index)}
                        className={`flex min-h-16 items-center justify-between gap-4 rounded-2xl border px-4 py-4 text-left font-bold transition md:px-5 ${
                          revealCorrect
                            ? 'border-green-400 bg-green-500/15 text-green-200'
                            : revealWrong
                              ? 'border-red-400 bg-red-500/15 text-red-200'
                              : 'border-white/10 bg-black/20 text-gray-300 hover:border-saffron/50 hover:text-white'
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-xs text-saffron">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="min-w-0 break-words">{option}</span>
                        </span>
                        {revealCorrect && <CheckCircle2 className="h-5 w-5 shrink-0" />}
                        {revealWrong && <XCircle className="h-5 w-5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {isAnswered && (
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className={`mt-6 rounded-3xl border p-5 ${currentCorrect ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className={`font-black ${currentCorrect ? 'text-green-300' : 'text-red-300'}`}>
                        {currentCorrect ? 'Correct! +10 XP' : selectedOption === null ? 'Time is up.' : 'Not quite.'}
                      </p>
                      <p className="text-sm text-gray-400">Correct answer: {current.options[current.correctAnswer]}</p>
                    </div>
                    <button onClick={goNext} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-saffron px-6 py-4 font-black text-black hover:bg-saffron-light">
                      {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'} <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {screen === 'result' && selectedQuiz && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto flex min-h-[70vh] max-w-xl items-center">
              <div className="w-full rounded-2xl border border-white/10 bg-[#111] p-6 text-center shadow-[0_20px_70px_rgba(0,0,0,0.28)] md:p-8">
                <button
                  type="button"
                  onClick={() => openLevel(selectedLevel)}
                  className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-gray-300 transition hover:border-saffron/50 hover:text-saffron"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-saffron/15 text-saffron">
                  {result.passed ? <Trophy className="h-12 w-12" /> : <RotateCcw className="h-12 w-12" />}
                </div>
                <p className="text-xs font-black uppercase tracking-[0.35em] text-saffron">Quiz Result</p>
                <h2 className="mt-2 text-4xl font-black text-white">{result.score}/100</h2>
                <p className="mt-3 text-gray-500">
                  {result.passed ? 'Quiz cleared. The next quiz is unlocked.' : 'Score 70 or more to unlock the next quiz.'}
                </p>
                <div className="my-8 flex justify-center gap-2">
                  {[1, 2, 3].map((star) => (
                    <Star key={star} className={`h-9 w-9 ${star <= result.stars ? 'fill-royal-gold text-royal-gold' : 'text-white/15'}`} />
                  ))}
                </div>
                <div className="mb-8 grid grid-cols-2 gap-4">
                  <ResultStat icon={<Sparkles className="h-5 w-5" />} label="XP earned" value={result.xp} />
                  <ResultStat icon={<Trophy className="h-5 w-5" />} label="Best score" value={result.bestScore} />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => startQuiz(selectedQuiz)} className="flex-1 rounded-2xl border border-white/10 px-5 py-4 font-black text-white hover:bg-white/5">Retry</button>
                  <button onClick={() => openLevel(selectedLevel)} className="flex-1 rounded-2xl bg-saffron px-5 py-4 font-black text-black hover:bg-saffron-light">Continue</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

const Stat = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) => (
  <div className="rounded-2xl border border-white/10 bg-[#111] px-4 py-3 md:px-5 md:py-4">
    <div className="mx-auto mb-1 flex justify-center text-saffron">{icon}</div>
    <p className="text-xl font-black text-white">{value}</p>
    <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">{label}</p>
  </div>
);

const ResultStat = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) => (
  <div className="rounded-2xl bg-black/20 p-4">
    <div className="mx-auto mb-2 flex justify-center text-royal-gold">{icon}</div>
    <p className="text-2xl font-black text-white">{value}</p>
    <p className="text-xs font-bold uppercase text-gray-600">{label}</p>
  </div>
);

const LevelCard = ({ level, index, onClick }: { level: Level; index: number; onClick: () => void }) => {
  const progress = Math.round((level.completedQuizzes / Math.max(level.totalQuizzes || level.quizCount, 1)) * 100);

  return (
    <motion.button
      type="button"
      disabled={!level.unlocked}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={level.unlocked ? { y: -6, scale: 1.01 } : undefined}
      className={`relative min-h-60 rounded-2xl border p-5 text-left transition ${
        level.unlocked ? 'border-saffron/25 bg-[#111] hover:border-saffron/70' : 'border-white/10 bg-[#111]/60 opacity-55'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${
          level.unlocked ? 'bg-saffron/15 text-saffron' : 'bg-white/5 text-gray-600'
        }`}>
          {level.unlocked ? <HelpCircle className="h-8 w-8" /> : <Lock className="h-8 w-8" />}
        </div>
        <p className="rounded-full bg-black/30 px-3 py-1 text-xs font-black text-gray-300">{level.completedQuizzes}/9</p>
      </div>
      <p className="mt-5 text-xs font-black uppercase tracking-[0.25em] text-saffron">Level {level.id}</p>
      <h2 className="mt-2 text-xl font-black leading-tight text-white">{level.title}</h2>
      <p className="mt-2 min-h-10 text-sm text-gray-400">{level.subtitle}</p>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5">
        <div className="h-full rounded-full bg-gradient-to-r from-saffron to-royal-gold" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-4 text-sm font-bold text-gray-400">
        {level.unlocked ? 'Open quiz path' : 'Locked until previous level is complete'}
      </p>
    </motion.button>
  );
};

const QuizCard = ({ quiz, index, onClick }: { quiz: QuizItem; index: number; onClick: () => void }) => {
  return (
    <motion.button
      type="button"
      disabled={!quiz.unlocked}
      onClick={onClick}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={quiz.unlocked ? { y: -6, scale: 1.02 } : undefined}
      className={`min-h-52 rounded-2xl border p-5 text-left transition ${
        quiz.unlocked ? 'border-saffron/25 bg-[#111] hover:border-saffron/70' : 'border-white/10 bg-[#111]/60 opacity-55'
      }`}
    >
      <div className="mb-5 flex items-center justify-between">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
          quiz.completed ? 'bg-royal-gold/15 text-royal-gold' : quiz.unlocked ? 'bg-saffron/15 text-saffron' : 'bg-white/5 text-gray-600'
        }`}>
          {quiz.unlocked ? <HelpCircle className="h-7 w-7" /> : <Lock className="h-7 w-7" />}
        </div>
        <div className="flex gap-1">
          {[1, 2, 3].map((star) => (
            <Star key={star} className={`h-4 w-4 ${star <= quiz.stars ? 'fill-royal-gold text-royal-gold' : 'text-white/15'}`} />
          ))}
        </div>
      </div>
      <p className="text-xs font-black uppercase tracking-[0.24em] text-saffron">Quiz {quiz.quiz}</p>
      <h2 className="mt-2 text-xl font-black text-white">{quiz.title || `Challenge ${quiz.quiz}`}</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 text-center">
        <div className="rounded-xl bg-black/25 px-3 py-2">
          <p className="text-sm font-black text-white">{quiz.bestScore}/100</p>
          <p className="text-[10px] font-bold uppercase text-gray-600">Best</p>
        </div>
        <div className="rounded-xl bg-black/25 px-3 py-2">
          <p className="text-sm font-black text-white">{quiz.attempts}</p>
          <p className="text-[10px] font-bold uppercase text-gray-600">Attempts</p>
        </div>
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-widest text-gray-600">
        {quiz.unlocked ? `${quiz.questionCount || 10} questions` : 'Locked'}
      </p>
    </motion.button>
  );
};
