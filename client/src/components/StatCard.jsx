import { motion } from "framer-motion";

export default function StatCard({ title, value, icon: Icon, tone = "from-orange-400 to-amber-300" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="royal-panel rounded-xl p-5"
      whileHover={{ y: -4 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-royalBrown/60 dark:text-white/60">{title}</p>
          <p className="mt-2 font-display text-4xl font-bold text-royalBrown dark:text-white">{value}</p>
        </div>
        <div className={`grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br ${tone} text-2xl text-royalBrown shadow-lg`}>
          <Icon />
        </div>
      </div>
    </motion.div>
  );
}
