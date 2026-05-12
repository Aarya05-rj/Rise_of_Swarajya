import { motion } from 'framer-motion';
import { ArrowLeft, Lock, HelpCircle, Star } from 'lucide-react';
import type { LevelMeta, QuizProgress } from './types';

interface QuizPathProps {
  level: LevelMeta;
  progress: QuizProgress[];
  onBack: () => void;
  onStartQuiz: (quiz: number) => void;
}

const QUIZZES_PER_LEVEL = 9;

// PERMANENT PROGRESS SYSTEM LOGIC
const getCompletedQuizzes = () => {
  try {
    return JSON.parse(localStorage.getItem("completedQuizzes") || "{}");
  } catch {
    return {};
  }
};

const isQuizPassed = (level: number, quiz: number, progress: QuizProgress[]) => {
  const completed = getCompletedQuizzes();
  if (completed[`level${level}_quiz${quiz}`]) return true;
  return progress.some(p => p.level === level && p.quiz === quiz && p.completed);
};

export const QuizPath = ({ level, progress, onBack, onStartQuiz }: QuizPathProps) => {
  const completedCount = Array.from({ length: QUIZZES_PER_LEVEL }).filter((_, i) => 
    isQuizPassed(level.level, i + 1, progress)
  ).length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        {/* Navigation */}
        <button
          onClick={onBack}
          className="mb-12 flex items-center gap-2 rounded-xl border border-white/10 bg-[#151515] px-4 py-2 text-sm font-black text-gray-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Levels
        </button>

        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-xs font-black uppercase tracking-widest text-gray-500">Level {level.level}</p>
          <h1 className="mt-2 text-4xl font-black text-white md:text-6xl">{level.title}</h1>
          <p className="mt-2 text-sm font-bold text-gray-400">{completedCount}/{QUIZZES_PER_LEVEL} quizzes completed</p>
        </div>

        {/* Quiz Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: QUIZZES_PER_LEVEL }).map((_, index) => {
            const quiz = index + 1;
            const saved = progress.find((item) => item.level === level.level && item.quiz === quiz);
            const stars = saved?.stars || 0;
            const bestScore = Number(localStorage.getItem(`bestScore_L${level.level}_Q${quiz}`)) || saved?.best_score || 0;
            const attempts = saved?.attempts || 0;
            
            // Logic: Quiz 1 of Level 1 is always unlocked. 
            // Others unlocked if previous quiz in same level is completed.
            // Quiz 1 of higher levels unlocked if previous LEVEL is completed.
            let isUnlocked = false;
            if (level.level === 1 && quiz === 1) {
              isUnlocked = true;
            } else if (quiz > 1) {
              isUnlocked = isQuizPassed(level.level, quiz - 1, progress);
            } else if (quiz === 1 && level.level > 1) {
              // Level 2, Quiz 1 unlocks if Level 1 is fully completed
              const prevLevel = level.level - 1;
              const prevLevelCompleted = Array.from({ length: QUIZZES_PER_LEVEL }).every((_, i) => 
                isQuizPassed(prevLevel, i + 1, progress)
              );
              isUnlocked = prevLevelCompleted;
            }

            const status = isQuizPassed(level.level, quiz, progress) ? 'Completed' : (isUnlocked ? 'Play Now' : 'Locked');

            return (
              <motion.div
                key={quiz}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => isUnlocked && onStartQuiz(quiz)}
                className={`group relative flex flex-col rounded-[2.5rem] border p-8 transition-all ${
                  isUnlocked 
                    ? 'cursor-pointer border-saffron/20 bg-[#111] hover:border-saffron/40' 
                    : 'border-white/5 bg-[#0d0d0d] opacity-50'
                }`}
              >
                {/* Card Top: Icon & Stars */}
                <div className="mb-8 flex items-center justify-between">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
                    isUnlocked ? 'bg-[#3D2817] text-saffron' : 'bg-white/5 text-gray-600'
                  }`}>
                    {isUnlocked ? <HelpCircle className="h-8 w-8" /> : <Lock className="h-8 w-8" />}
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`h-5 w-5 ${s <= stars ? 'fill-saffron text-saffron' : 'text-white/10'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Card Middle: Titles */}
                <div className="mb-8">
                  <p className="text-xs font-black uppercase tracking-widest text-saffron">Quiz {quiz}</p>
                  <h2 className="mt-1 text-2xl font-black text-white">Quiz {quiz}</h2>
                </div>

                {/* Card Stats: Score & Attempts */}
                <div className="mb-8 flex gap-4">
                  <div className="flex-1 rounded-3xl bg-white/5 p-4 text-center">
                    <p className="text-lg font-black text-white">{bestScore}/100</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Best</p>
                  </div>
                  <div className="flex-1 rounded-3xl bg-white/5 p-4 text-center">
                    <p className="text-lg font-black text-white">{attempts}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Attempts</p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-auto pt-4 border-t border-white/5">
                  <p className={`text-xs font-black uppercase tracking-widest ${
                    status === 'Completed' ? 'text-green-500' : (isUnlocked ? 'text-saffron' : 'text-gray-600')
                  }`}>
                    {status}
                  </p>
                </div>

                {/* Hover Effect Glow */}
                {isUnlocked && (
                  <div className="absolute inset-0 -z-10 rounded-[2.5rem] bg-saffron/5 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
