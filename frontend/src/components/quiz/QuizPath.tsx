import { motion } from 'framer-motion';
import { ArrowLeft, Check, Flame, Gem, Heart, Lock, Star } from 'lucide-react';
import type { LevelMeta, QuizProgress } from './types';

interface QuizPathProps {
  level: LevelMeta;
  progress: QuizProgress[];
  onBack: () => void;
  onStartQuiz: (quiz: number) => void;
}

const quizCount = 9;

const getCurrentQuiz = (progress: QuizProgress[], level: number) => {
  for (let quiz = 1; quiz <= quizCount; quiz += 1) {
    const completed = progress.some((item) => item.level === level && item.quiz === quiz && item.completed);
    if (!completed) return quiz;
  }
  return quizCount;
};

const calculateStreak = (progress: QuizProgress[]) => {
  const days = Array.from(
    new Set(
      progress
        .filter((item) => item.completed && item.updated_at)
        .map((item) => new Date(item.updated_at as string).toDateString())
    )
  );
  return Math.min(days.length, 99);
};

export const QuizPath = ({ level, progress, onBack, onStartQuiz }: QuizPathProps) => {
  const completed = progress.filter((item) => item.level === level.level && item.completed);
  const completedCount = completed.length;
  const currentQuiz = getCurrentQuiz(progress, level.level);
  const xp = completed.reduce((total, item) => total + item.score * 10 + item.stars * 25, 0);
  const streak = calculateStreak(completed);
  const progressPercent = Math.round((completedCount / quizCount) * 100);

  const isUnlocked = (quiz: number) => {
    if (level.level > 1) return false;
    if (quiz === 1) return true;
    return progress.some((item) => item.level === level.level && item.quiz === quiz - 1 && item.completed);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_18%_12%,rgba(255,153,51,0.12),transparent_28%),radial-gradient(circle_at_78%_8%,rgba(212,175,55,0.1),transparent_24%),linear-gradient(180deg,#0a0a0a,#14100d_45%,#0a0a0a)] px-4 py-6 text-cream">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#111] px-4 py-2 text-sm font-black text-gray-400 shadow-[0_4px_0_#050505] transition hover:scale-[1.02] hover:text-saffron"
          >
            <ArrowLeft className="h-4 w-4" /> Levels
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-7 rounded-[2rem] border border-white/5 bg-[#111] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.24)]"
        >
          <div className="mb-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-saffron/10 px-3 py-2">
              <div className="flex items-center justify-center gap-1 text-sm font-black text-saffron">
                <Flame className="h-4 w-4 fill-current" /> {streak}
              </div>
              <p className="text-[10px] font-black uppercase text-gray-600">Streak</p>
            </div>
            <div className="rounded-2xl bg-red-500/10 px-3 py-2">
              <div className="flex items-center justify-center gap-1 text-sm font-black text-[#ff4b4b]">
                <Heart className="h-4 w-4 fill-current" /> 3
              </div>
              <p className="text-[10px] font-black uppercase text-gray-600">Lives</p>
            </div>
            <div className="rounded-2xl bg-royal-gold/10 px-3 py-2">
              <div className="flex items-center justify-center gap-1 text-sm font-black text-royal-gold">
                <Gem className="h-4 w-4 fill-current" /> {xp}
              </div>
              <p className="text-[10px] font-black uppercase text-gray-600">XP</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-4 flex-1 overflow-hidden rounded-full bg-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full rounded-full bg-gradient-to-r from-saffron to-royal-gold"
              />
            </div>
            <span className="text-xs font-black text-gray-500">{progressPercent}%</span>
          </div>
        </motion.div>

        <div className="mx-auto max-w-[760px] p-2 md:p-4">
          <div className="mb-10 text-center">
            <div className="flex items-center justify-center gap-4">
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-sm font-black uppercase tracking-[0.22em] text-saffron">Quest Path</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>
            <h1 className="mt-3 text-3xl font-black text-white">{level.title}</h1>
            <p className="mt-1 text-xs font-bold text-gray-500">Level {level.level} . {completedCount}/{quizCount} completed</p>
          </div>

          <div className="relative mx-auto min-h-[1040px] max-w-[520px] pb-12">
            <svg
              className="pointer-events-none absolute left-1/2 top-12 h-[930px] w-[360px] -translate-x-1/2 overflow-visible opacity-70"
              viewBox="0 0 360 930"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M180 20 C285 85 285 175 180 230 C75 285 75 375 180 430 C285 485 285 575 180 630 C75 685 75 775 180 830 C235 858 250 890 220 915"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <motion.path
                d="M180 20 C285 85 285 175 180 230 C75 285 75 375 180 430 C285 485 285 575 180 630 C75 685 75 775 180 830 C235 858 250 890 220 915"
                stroke="url(#quizWave)"
                strokeWidth="10"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: completedCount / quizCount }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="quizWave" x1="180" y1="20" x2="220" y2="915" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ff9933" />
                  <stop offset="1" stopColor="#ffd700" />
                </linearGradient>
              </defs>
            </svg>

          {Array.from({ length: quizCount }).map((_, index) => {
            const quiz = index + 1;
            const saved = progress.find((item) => item.level === level.level && item.quiz === quiz);
            const unlocked = isUnlocked(quiz);
            const completedNode = Boolean(saved?.completed);
            const active = unlocked && !completedNode && quiz === currentQuiz;
            const offsets = [0, 110, 0, -110, 0, 110, 0, -110, 0];
            const offset = offsets[index] || 0;

            return (
              <div key={quiz} className="relative z-10 flex h-[112px] items-start justify-center">
                <div style={{ transform: `translateX(${offset}px)` }}>
                <motion.button
                  type="button"
                  disabled={!unlocked}
                  onClick={() => unlocked && onStartQuiz(quiz)}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: index * 0.06, type: 'spring', stiffness: 220, damping: 18 }}
                  whileHover={unlocked ? { scale: 1.07, y: -4 } : undefined}
                  whileTap={unlocked ? { scale: 0.95 } : undefined}
                  className="group relative flex flex-col items-center"
                >
                  {active && (
                    <motion.span
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -top-11 left-1/2 z-20 -translate-x-1/2 rounded-2xl border border-saffron/25 bg-[#1a1a1a] px-4 py-2 text-sm font-black text-saffron shadow-sm after:absolute after:left-1/2 after:top-full after:h-4 after:w-4 after:-translate-x-1/2 after:-translate-y-2 after:rotate-45 after:border-b after:border-r after:border-saffron/25 after:bg-[#1a1a1a]"
                    >
                      START
                    </motion.span>
                  )}

                  <motion.span
                    animate={active ? { y: [0, -5, 0] } : undefined}
                    transition={active ? { repeat: Infinity, duration: 1.4, ease: 'easeInOut' } : undefined}
                    className={`relative flex items-center justify-center rounded-full transition-all duration-300 ${
                      active ? 'h-[100px] w-[100px]' : 'h-[70px] w-[70px]'
                    } ${
                      completedNode
                        ? 'border-[3px] border-royal-gold bg-royal-gold/15 text-royal-gold shadow-[0_6px_0_rgba(212,175,55,0.35)]'
                        : active
                          ? 'bg-gradient-to-b from-saffron to-[#d96f0d] text-black shadow-[0_8px_0_#9f5512,0_16px_28px_rgba(255,153,51,0.28)]'
                          : 'bg-white/10 text-gray-600 opacity-70 grayscale shadow-[0_8px_0_#050505]'
                    }`}
                  >
                    {completedNode ? (
                      <Check className="h-9 w-9 stroke-[4]" />
                    ) : active ? (
                      <Star className="h-12 w-12 fill-current" />
                    ) : (
                      <Lock className="h-8 w-8" />
                    )}
                  </motion.span>

                  <span
                    className={`mt-3 text-xs font-black ${unlocked ? 'text-gray-400' : 'text-gray-700'}`}
                  >
                    Quiz {quiz}
                  </span>
                </motion.button>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
};
