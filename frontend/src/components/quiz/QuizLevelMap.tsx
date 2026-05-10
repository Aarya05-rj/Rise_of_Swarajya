import { motion } from 'framer-motion';
import { Lock, Swords } from 'lucide-react';
import type { LevelMeta, QuizProgress } from './types';

interface QuizLevelMapProps {
  levels: LevelMeta[];
  progress: QuizProgress[];
  onSelectLevel: (level: number) => void;
}

const quizzesPerLevel = 9;

const completedForLevel = (progress: QuizProgress[], level: number) =>
  progress.filter((item) => item.level === level && item.completed).length;

const isLevelUnlocked = (_progress: QuizProgress[], _level: number) => true;

export const QuizLevelMap = ({ levels, progress, onSelectLevel }: QuizLevelMapProps) => (
  <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,153,51,0.16),transparent_30%),linear-gradient(135deg,#1A1A1A,#24140a_55%,#3D2817)] px-4 py-6 text-cream md:px-8">
    <div className="mx-auto max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-7 text-center"
      >
        <p className="mb-2 text-xs font-black tracking-[0.35em] text-royal-gold">QUIZ GAME</p>
        <h1 className="text-3xl font-black leading-tight text-cream md:text-5xl">Rise of Swarajya</h1>
        <p className="mt-3 text-sm text-cream/60 md:text-base">Choose a chapter and begin the quiz.</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {levels.map((level, index) => {
          const unlocked = isLevelUnlocked(progress, level.level);
          const completed = completedForLevel(progress, level.level);
          return (
            <motion.button
              key={level.level}
              type="button"
              disabled={!unlocked}
              onClick={() => onSelectLevel(level.level)}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.045 }}
              whileHover={unlocked ? { y: -8, scale: 1.02 } : undefined}
              className={`group min-h-52 rounded-3xl border p-5 text-center transition-all duration-300 ${
                unlocked
                  ? 'border-saffron bg-[#2b180d]/80 shadow-[0_0_34px_rgba(255,153,51,0.18)]'
                  : 'border-white/10 bg-black/20 opacity-60'
              }`}
            >
              <div
                className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border ${
                  unlocked ? 'border-saffron/40 bg-saffron/15 text-saffron' : 'border-white/10 bg-white/5 text-white/35'
                }`}
              >
                {unlocked ? <Swords className="h-7 w-7" /> : <Lock className="h-7 w-7" />}
              </div>
              <p className="mb-2 text-xs font-black uppercase tracking-[0.28em] text-royal-gold">Level {level.level}</p>
              <h2 className={`mb-3 text-base font-black leading-snug ${unlocked ? 'text-cream' : 'text-white/35'}`}>{level.title}</h2>
              <p className="mb-4 min-h-8 text-xs font-semibold text-cream/45">{level.subtitle}</p>
              <div className="mx-auto mb-3 flex max-w-28 flex-wrap justify-center gap-1.5">
                {Array.from({ length: quizzesPerLevel }).map((_, quizIndex) => (
                  <span
                    key={quizIndex}
                    className={`h-3 w-3 rounded-full border ${
                      quizIndex < completed
                        ? 'border-royal-gold bg-royal-gold shadow-[0_0_10px_rgba(212,175,55,0.55)]'
                        : 'border-white/15 bg-white/10'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs font-bold text-cream/45">{completed}/{quizzesPerLevel} complete</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  </div>
);
