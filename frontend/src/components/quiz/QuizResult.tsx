import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, RefreshCw, Trophy } from 'lucide-react';
import { StarRating } from './StarRating';

interface QuizResultProps {
  score: number;
  total: number;
  stars: number;
  canGoNext: boolean;
  onBack: () => void;
  onRetry: () => void;
  onNextQuiz: () => void;
}

export const QuizResult = ({ score, total, stars, canGoNext, onBack, onRetry, onNextQuiz }: QuizResultProps) => (
  <div className="relative mx-auto flex min-h-screen max-w-2xl items-center px-4 py-10 text-cream">
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full overflow-hidden rounded-[2.5rem] border border-saffron/25 bg-[#26170d]/95 p-7 text-center shadow-[0_0_60px_rgba(255,153,51,0.22)] md:p-10"
    >
      <div className="absolute inset-x-8 top-0 h-28 rounded-full bg-saffron/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 18 }).map((_, index) => (
          <motion.span
            key={index}
            className="absolute h-2 w-2 rounded-full bg-royal-gold"
            initial={{ x: '50%', y: '50%', scale: 0, opacity: 1 }}
            animate={{
              x: `${20 + ((index * 37) % 60)}%`,
              y: `${8 + ((index * 23) % 70)}%`,
              scale: [0, 1, 0.6],
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 1.5, delay: index * 0.035 }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-cream/75 transition hover:border-saffron/50 hover:text-saffron"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-saffron/15 text-saffron">
          <Trophy className="h-12 w-12" />
        </div>
        <p className="text-xs font-black uppercase tracking-[0.35em] text-royal-gold">Quiz Complete</p>
        <h1 className="mt-3 text-4xl font-black text-saffron md:text-6xl">{score}/{total}</h1>
        <p className="mt-2 text-cream/55">
          {stars === 3 ? 'Excellent command of Swarajya!' : stars === 2 ? 'Strong effort, warrior.' : stars === 1 ? 'You passed. Sharpen the blade.' : 'Try again to unlock the path.'}
        </p>

        <div className="my-8">
          <StarRating stars={stars} size="lg" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-6 py-4 font-black text-cream transition hover:scale-[1.02] hover:border-saffron/50"
          >
            <RefreshCw className="h-5 w-5" /> Retry
          </button>
          <button
            type="button"
            disabled={!canGoNext}
            onClick={onNextQuiz}
            className="inline-flex items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-saffron to-royal-gold px-6 py-4 font-black text-[#1A1A1A] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-45"
          >
            Next Quiz <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  </div>
);
