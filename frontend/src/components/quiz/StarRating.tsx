import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface StarRatingProps {
  stars: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'w-3.5 h-3.5',
  md: 'w-5 h-5',
  lg: 'w-9 h-9',
};

export const StarRating = ({ stars, size = 'md' }: StarRatingProps) => (
  <div className="flex items-center justify-center gap-1">
    {[1, 2, 3].map((star) => (
      <motion.div
        key={star}
        initial={{ scale: 0, rotate: -25 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: star * 0.08, type: 'spring', stiffness: 260, damping: 14 }}
      >
        <Star
          className={`${sizes[size]} ${
            star <= stars ? 'fill-royal-gold text-royal-gold drop-shadow-[0_0_10px_rgba(212,175,55,0.55)]' : 'text-white/15'
          }`}
        />
      </motion.div>
    ))}
  </div>
);
