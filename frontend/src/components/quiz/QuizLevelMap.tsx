import { motion } from 'framer-motion';
import { Lock, HelpCircle, Flame, Zap, Trophy } from 'lucide-react';
import type { LevelMeta, QuizProgress } from './types';

interface QuizLevelMapProps {
  levels: LevelMeta[];
  progress: QuizProgress[];
  userStats?: any;
  onSelectLevel: (level: number) => void;
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
  
  // Fallback to progress prop if localStorage is empty
  return progress.some(p => p.level === level && p.quiz === quiz && p.completed);
};

const isLevelCompleted = (level: number, progress: QuizProgress[]) => {
  return Array.from({ length: QUIZZES_PER_LEVEL }).every((_, i) => 
    isQuizPassed(level, i + 1, progress)
  );
};

const isLevelUnlocked = (level: number, progress: QuizProgress[]) => {
  if (level === 1) return true;
  // Next level unlocks ONLY after all 9 quizzes of current level are passed
  return isLevelCompleted(level - 1, progress);
};

export const QuizLevelMap = ({ levels, progress, userStats, onSelectLevel }: QuizLevelMapProps) => {
  // Aggregate stats
  const totalXp = userStats?.totalXp ?? progress.reduce((sum, p) => sum + (p.score * 10) + (p.stars * 25), 0);
  const totalCleared = Object.keys(getCompletedQuizzes()).length || userStats?.totalAttempts || progress.filter(p => p.completed).length;
  const currentStreak = Number(localStorage.getItem("quizStreak")) || userStats?.currentStreak || 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-10 text-white md:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-16 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div className="flex-1">
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.4em] text-saffron">Quiz Journey</p>
            <h1 className="text-5xl font-black tracking-tight text-white md:text-7xl">Swarajya Lessons</h1>
            <p className="mt-4 text-sm font-medium text-gray-500">Complete all 9 quizzes in a level to unlock the next level.</p>
          </div>

          {/* Stats Cards */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#111] px-5 py-4 min-w-[100px]">
              <Flame className="h-5 w-5 text-saffron mb-2" />
              <span className="text-xl font-black">{currentStreak}</span>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Streak</p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#111] px-5 py-4 min-w-[100px]">
              <Zap className="h-5 w-5 text-saffron mb-2" />
              <span className="text-xl font-black">{totalXp}</span>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">XP</p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#111] px-5 py-4 min-w-[100px]">
              <Trophy className="h-5 w-5 text-saffron mb-2" />
              <span className="text-xl font-black">{totalCleared}</span>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Cleared</p>
            </div>
          </div>
        </div>

        {/* Level Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {levels.map((level, index) => {
            const unlocked = isLevelUnlocked(level.level, progress);
            const completedCount = Array.from({ length: QUIZZES_PER_LEVEL }).filter((_, i) => 
              isQuizPassed(level.level, i + 1, progress)
            ).length;
            
            return (
              <motion.button
                key={level.level}
                type="button"
                disabled={!unlocked}
                onClick={() => onSelectLevel(level.level)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={unlocked ? { scale: 1.01 } : {}}
                className={`group relative flex items-start gap-6 rounded-[2.5rem] border p-8 text-left transition-all ${
                  unlocked 
                    ? 'border-white/5 bg-[#111] hover:border-saffron/30' 
                    : 'border-white/5 bg-[#0a0a0a] opacity-50'
                }`}
              >
                {/* Progress Badge */}
                <div className="absolute right-8 top-8 text-xs font-black text-gray-600">
                  {completedCount}/{QUIZZES_PER_LEVEL}
                </div>

                {/* Icon Container */}
                <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${
                  unlocked ? 'bg-white/5 text-saffron' : 'bg-white/5 text-gray-700'
                }`}>
                  {unlocked ? <HelpCircle className="h-8 w-8" /> : <Lock className="h-8 w-8" />}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-saffron">Level {level.level}</p>
                  <h2 className="mb-2 text-3xl font-black text-white">{level.title}</h2>
                  <p className="mb-6 text-sm font-bold text-gray-600">{level.subtitle}</p>
                  
                  <div className="text-xs font-black uppercase tracking-widest">
                    {unlocked ? (
                      <span className="text-white/60">Open quiz path</span>
                    ) : (
                      <span className="text-gray-700">Locked until previous level is complete</span>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
