import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import {
  Award,
  BarChart3,
  Camera,
  Clock,
  Edit2,
  Flame,
  Loader2,
  Mail,
  Medal,
  Save,
  Shield,
  Star,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface QuizAttempt {
  id: number;
  level_id: number;
  quiz_id: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  stars: number;
  time_taken: number;
  created_at: string;
}

interface UserStats {
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  totalXp: number;
  perfectScores: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  recentAttempts: QuizAttempt[];
}

const emptyStats: UserStats = {
  totalAttempts: 0,
  averageScore: 0,
  bestScore: 0,
  totalXp: 0,
  perfectScores: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: null,
  recentAttempts: [],
};

const normalizeStats = (value: any): UserStats => ({
  ...emptyStats,
  ...(value && typeof value === 'object' ? value : {}),
  recentAttempts: Array.isArray(value?.recentAttempts) ? value.recentAttempts : [],
});

const getQuizLabel = (attempt: QuizAttempt) => {
  const rawQuizId = String(attempt.quiz_id || '');
  if (rawQuizId.includes('-')) return `Level ${attempt.level_id || rawQuizId.split('-')[0]} . Quiz ${rawQuizId.split('-')[1]}`;
  if (Number.isInteger(Number(attempt.quiz_id)) && Number(attempt.quiz_id) >= 100) {
    return `Level ${Math.floor(Number(attempt.quiz_id) / 100)} . Quiz ${Number(attempt.quiz_id) % 100}`;
  }
  return `Level ${attempt.level_id || 1} . Quiz ${attempt.quiz_id || 1}`;
};

const formatDateTime = (value?: string) => {
  if (!value) return 'Recently';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Recently' : date.toLocaleString();
};

const getSafeAvatarUrl = (value?: string) => {
  if (!value) return '';
  // Removed the restriction on storage URLs as they are valid
  return value;
};

export const Profile: React.FC = () => {
  const { user, session } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [profileData, setProfileData] = useState<any>(null);
  const [stats, setStats] = useState<UserStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const authHeaders = useCallback((): HeadersInit => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const token = session?.access_token;
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }, [session]);

  useEffect(() => {
    const loadProfileDashboard = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError('');
        setName(user.user_metadata?.full_name || '');

        const headers = authHeaders();
        const [profileResponse, statsResponse] = await Promise.all([
          fetch(`/api/profile/${user.id}`, { headers }),
          fetch(`/api/user-stats/${user.id}`, { headers }),
        ]);

        const profilePayload = await profileResponse.json();
        const statsPayload = await statsResponse.json();

        if (!profileResponse.ok) throw new Error(profilePayload.error || 'Failed to fetch profile');
        if (!statsResponse.ok) throw new Error(statsPayload.error || 'Failed to fetch quiz stats');

        const profile = profilePayload.data || profilePayload;
        setProfileData({
          ...profile,
          rank: profile.rank || profile.status || 'Soldier',
          total_score: profile.total_score || profile.score || profile.points || profile.xp || 0,
        });
        setStats(normalizeStats(statsPayload.data));
      } catch (err: any) {
        setError(err.message || 'Unable to load profile dashboard.');
      } finally {
        setLoading(false);
      }
    };

    loadProfileDashboard();
  }, [user, session, authHeaders]);

  const achievements = useMemo(() => [
    {
      title: 'First Quiz Completed',
      desc: 'Submit your first quiz attempt',
      unlocked: stats.totalAttempts >= 1,
      icon: <Award className="h-6 w-6" />,
    },
    {
      title: '5 Day Streak',
      desc: 'Stay active for 5 days',
      unlocked: stats.currentStreak >= 5 || stats.longestStreak >= 5,
      icon: <Flame className="h-6 w-6" />,
    },
    {
      title: 'Perfect Score',
      desc: 'Score 100% on any quiz',
      unlocked: stats.bestScore === 100 || stats.perfectScores > 0,
      icon: <Medal className="h-6 w-6" />,
    },
  ], [stats]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const { error: authErr } = await supabase.auth.updateUser({
        data: { full_name: name },
      });
      if (authErr) throw authErr;

      await fetch(`/api/profile/${user?.id}`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ full_name: name }),
      });

      setProfileData({ ...profileData, full_name: name });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Limit file size to 5MB for storage
    if (file.size > 5 * 1024 * 1024) {
      setError('Image is too large. Please select an image smaller than 5MB.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Update auth metadata for global availability (No schema change needed!)
      const { error: metaError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (metaError) throw metaError;

      // Update local state to show immediately
      setProfileData({ ...profileData, avatar_url: publicUrl });
    } catch (err: any) {
      console.error('Error saving avatar:', err);
      setError(err.message || 'Failed to upload image. Please ensure the "avatars" bucket exists in Supabase storage.');
    } finally {
      setSaving(false);
    }
  };

  const performanceWidth = Math.min(stats.averageScore, 100);
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">PROFILE <span className="text-saffron">DASHBOARD</span></h1>
          <p className="text-gray-500 font-light">Your identity, quiz history, achievements, and performance in one place.</p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-saffron animate-spin" />
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">{error}</div>
        ) : (
          <div className="space-y-8">
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-2 bg-[#111] border border-white/5 p-8 md:p-10 rounded-[3rem] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8">
                  {isEditing ? (
                    <div className="flex space-x-2">
                      <button onClick={() => setIsEditing(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all text-gray-400">
                        <X className="w-5 h-5" />
                      </button>
                      <button onClick={handleUpdate} disabled={saving} className="p-2 bg-saffron text-black rounded-full transition-all hover:scale-105 disabled:opacity-50">
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setIsEditing(true)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all text-saffron">
                      <Edit2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                  <div className="relative group">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      className="hidden"
                      accept="image/*"
                    />
                    {getSafeAvatarUrl(avatarUrl) ? (
                      <img
                        key={avatarUrl}
                        src={getSafeAvatarUrl(avatarUrl)}
                        alt="Avatar"
                        className="w-32 h-32 rounded-[2.5rem] object-cover border-4 border-white/5 group-hover:border-saffron/30 transition-all shadow-2xl"
                        onError={() => setProfileData((current: any) => ({ ...current, avatar_url: '' }))}
                      />
                    ) : (
                      <div className="w-32 h-32 bg-saffron/20 rounded-[2.5rem] flex items-center justify-center text-saffron text-4xl font-black border-4 border-white/5 group-hover:border-saffron/30 transition-all shadow-2xl">
                        {user?.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <button 
                      onClick={handleAvatarClick}
                      className="absolute -bottom-1 -right-1 p-2.5 bg-[#1a1a1a] border-2 border-white/10 rounded-full text-gray-400 hover:text-saffron hover:scale-110 hover:border-saffron/50 transition-all shadow-xl z-10"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    {isEditing ? (
                      <input
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="bg-black/20 border border-saffron/30 rounded-xl px-4 py-2 text-2xl font-bold text-white focus:outline-none mb-2 w-full"
                      />
                    ) : (
                      <h2 className="text-3xl font-black text-white mb-2">{profileData?.full_name || user?.user_metadata?.full_name || 'Anonymous Warrior'}</h2>
                    )}
                    <p className="text-saffron font-bold uppercase tracking-widest text-xs mb-6">{profileData?.rank || 'Mavala'} Rank</p>
                    <div className="space-y-4">
                      <div className="flex items-center justify-center md:justify-start space-x-3 text-gray-400">
                        <Mail className="w-4 h-4 text-gray-600" />
                        <span>{user?.email}</span>
                      </div>
                      <div className="flex items-center justify-center md:justify-start space-x-3 text-gray-400">
                        <Shield className="w-4 h-4 text-gray-600" />
                        <span>Joined Swarajya in {profileData?.created_at ? new Date(profileData.created_at).getFullYear() : '2026'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111] border border-white/5 p-8 rounded-[3rem]">
                <h2 className="text-xl font-black text-white mb-6">Performance</h2>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-5xl font-black text-saffron">{stats.averageScore}</span>
                  <span className="text-gray-500 font-bold mb-2">AVG SCORE</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${performanceWidth}%` }} className="h-full bg-gradient-to-r from-saffron to-royal-gold" />
                </div>
              </motion.div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              <StatCard title="Total Attempts" value={stats.totalAttempts} icon={<BarChart3 />} />
              <StatCard title="Best Score" value={`${stats.bestScore}%`} icon={<Trophy />} />
              <StatCard title="Total XP" value={stats.totalXp} icon={<Zap />} />
              <StatCard title="Current Streak" value={`${stats.currentStreak} days`} icon={<Flame />} />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-[#111] border border-white/5 p-6 rounded-[2rem]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-white">Recent Quiz Activity</h2>
                  <p className="text-xs text-gray-500">Latest 5 attempts</p>
                </div>

                {stats.recentAttempts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-gray-500">No quiz attempts yet</div>
                ) : (
                  <div className="space-y-3">
                    {stats.recentAttempts.map((attempt, index) => (
                      <motion.div
                        key={attempt.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex flex-col gap-3 rounded-2xl bg-black/20 p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <p className="font-black text-white">{getQuizLabel(attempt)}</p>
                          <p className="text-xs text-gray-500">{formatDateTime(attempt.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-xl font-black text-saffron">{attempt.score}%</p>
                          <div className="flex gap-1">
                            {[1, 2, 3].map((star) => (
                              <Star key={star} className={`h-4 w-4 ${star <= attempt.stars ? 'fill-royal-gold text-royal-gold' : 'text-white/15'}`} />
                            ))}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-4 w-4" /> {attempt.time_taken}s
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-[#111] border border-white/5 p-6 rounded-[2rem]">
                <h2 className="text-xl font-black text-white mb-6">Streak</h2>
                <div className="rounded-2xl bg-saffron/10 p-5 mb-4">
                  <p className="text-4xl font-black text-saffron">{stats.currentStreak}</p>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-500">Current streak</p>
                </div>
                <p className="text-sm text-gray-400">
                  Last active: {stats.lastActiveDate ? new Date(stats.lastActiveDate).toLocaleDateString() : 'No activity yet'}
                </p>
              </div>
            </section>

            <section className="bg-[#111] border border-white/5 p-6 rounded-[2rem]">
              <h2 className="text-xl font-black text-white mb-6">Achievements</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className={`rounded-2xl border p-5 ${achievement.unlocked ? 'border-saffron/30 bg-saffron/10' : 'border-white/5 bg-black/20 opacity-60'}`}
                  >
                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${achievement.unlocked ? 'bg-saffron text-black' : 'bg-white/5 text-gray-500'}`}>
                      {achievement.icon}
                    </div>
                    <h3 className="font-black text-white">{achievement.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{achievement.desc}</p>
                    <p className={`mt-4 text-xs font-black uppercase tracking-widest ${achievement.unlocked ? 'text-saffron' : 'text-gray-600'}`}>
                      {achievement.unlocked ? 'Unlocked' : 'Locked'}
                    </p>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111] border border-white/5 p-6 rounded-3xl">
    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-saffron/10 text-saffron">
      {icon}
    </div>
    <p className="text-3xl font-black text-white">{value}</p>
    <p className="mt-1 text-xs font-black uppercase tracking-widest text-gray-600">{title}</p>
  </motion.div>
);
