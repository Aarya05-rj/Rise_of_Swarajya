import { motion } from 'framer-motion';
import { Check, Lock, Play, Star } from 'lucide-react';
import { StarRating } from './StarRating';

interface QuizNodeProps {
  label: string;
  unlocked: boolean;
  completed?: boolean;
  stars?: number;
  active?: boolean;
  onClick?: () => void;
}

export const QuizNode = ({ label, unlocked, completed, stars = 0, active, onClick }: QuizNodeProps) => (
  <motion.button
    type="button"
    disabled={!unlocked}
    onClick={onClick}
    whileHover={unlocked ? { scale: 1.06, y: -4 } : undefined}
    whileTap={unlocked ? { scale: 0.96 } : undefined}
    className={`relative mx-auto flex h-24 w-24 flex-col items-center justify-center rounded-full border-4 transition-all duration-300 ${
      completed
        ? 'border-royal-gold bg-gradient-to-br from-[#D4AF37] to-[#FF9933] text-[#1A1A1A] shadow-[0_0_35px_rgba(212,175,55,0.45)]'
        : unlocked
          ? 'border-saffron bg-[#2b190f] text-cream shadow-[0_0_28px_rgba(255,153,51,0.28)]'
          : 'border-white/10 bg-[#120c08] text-white/25'
    } ${active ? 'ring-4 ring-saffron/30' : ''}`}
  >
    <span className="absolute -top-3 rounded-full border border-white/10 bg-[#1A1A1A] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cream/70">
      {label}
    </span>
    {completed ? <Check className="h-8 w-8" /> : unlocked ? <Play className="h-8 w-8 fill-current" /> : <Lock className="h-8 w-8" />}
    {completed ? (
      <div className="absolute -bottom-4 rounded-full bg-[#1A1A1A] px-2 py-1">
        <StarRating stars={stars} size="sm" />
      </div>
    ) : unlocked ? (
      <Star className="absolute -bottom-2 h-5 w-5 fill-saffron text-saffron" />
    ) : null}
  </motion.button>
);
