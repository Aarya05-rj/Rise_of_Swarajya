import { motion } from 'framer-motion';
import { ArrowLeft, Check, Flame, Gem, Heart, Play, Star } from 'lucide-react';
import type { LevelMeta, QuizProgress } from './types';

interface QuizPathProps {
  level: LevelMeta;
  progress: QuizProgress[];
  onBack: () => void;
  onStartQuiz: (quiz: number) => void;
}

const quizCount = 9;

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
  const xp = completed.reduce((total, item) => total + item.score * 10 + item.stars * 25, 0);
  const streak = calculateStreak(completed);
  const progressPercent = Math.round((completedCount / quizCount) * 100);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_18%_12%,rgba(255,153,51,0.12),transparent_28%),radial-gradient(circle_at_78%_8%,rgba(212,175,55,0.1),transparent_24%),linear-gradient(180deg,#0a0a0a,#14100d_45%,#0a0a0a)] px-4 py-6 text-cream">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-5 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#111] px-4 py-2 text-sm font-black text-gray-400 shadow-[0_4px_0_#050505] transition hover:scale-[1.02] hover:text-saffron"
        >
          <ArrowLeft className="h-4 w-4" /> Levels
        </button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-7 rounded-3xl border border-white/5 bg-[#111] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.24)]"
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
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full rounded-full bg-gradient-to-r from-saffron to-royal-gold"
              />
            </div>
            <span className="text-xs font-black text-gray-500">{progressPercent}%</span>
          </div>
        </motion.div>

        <div className="mb-7 text-center">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-saffron">Quest Path</p>
          <h1 className="mt-2 text-3xl font-black text-white md:text-5xl">{level.title}</h1>
          <p className="mt-2 text-sm font-bold text-gray-500">Level {level.level} . {completedCount}/{quizCount} completed</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: quizCount }).map((_, index) => {
            const quiz = index + 1;
            const saved = progress.find((item) => item.level === level.level && item.quiz === quiz);
            const completedNode = Boolean(saved?.completed);
            const stars = saved?.stars || 0;

            return (
              <motion.button
                key={quiz}
                type="button"
                onClick={() => onStartQuiz(quiz)}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                whileHover={{ y: -5, scale: 1.01 }}
                className="group rounded-3xl border border-white/8 bg-[#111]/90 p-5 text-left shadow-[0_14px_40px_rgba(0,0,0,0.22)] transition hover:border-saffron/45"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                    completedNode ? 'bg-royal-gold/15 text-royal-gold' : 'bg-saffron/15 text-saffron'
                  }`}>
                    {completedNode ? <Check className="h-7 w-7 stroke-[4]" /> : <Play className="h-7 w-7 fill-current" />}
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= stars ? 'fill-royal-gold text-royal-gold' : 'text-white/15'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-royal-gold">Quiz {quiz}</p>
                <h2 className="mt-2 text-xl font-black text-white">Challenge {quiz}</h2>
                <p className="mt-2 text-sm font-semibold text-gray-500">
                  {completedNode ? `${saved?.score || 0}/10 correct` : 'Ready to play'}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
