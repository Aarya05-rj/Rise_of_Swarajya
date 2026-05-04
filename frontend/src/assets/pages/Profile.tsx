import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Mail, Shield, Award, Edit2, Save, X, Camera, Loader2, Flame, Star, Trophy } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { getQuizProgress } from '../services/api';
import type { QuizProgress } from '../components/quiz/types';

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const calculateStreak = (progress: QuizProgress[]) => {
  const completedDays = Array.from(
    new Set(
      progress
        .filter((item) => item.completed && item.updated_at)
        .map((item) => startOfDay(new Date(item.updated_at as string)).getTime())
    )
  ).sort((a, b) => b - a);

  if (!completedDays.length) return 0;

  const today = startOfDay(new Date());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  let cursor = isSameDay(new Date(completedDays[0]), today)
    ? today
    : isSameDay(new Date(completedDays[0]), yesterday)
      ? yesterday
      : null;

  if (!cursor) return 0;

  let streak = 0;
  for (const day of completedDays) {
    if (day !== cursor.getTime()) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

const getRank = (xp: number) => {
  if (xp >= 5000) return 'Chhatrapati';
  if (xp >= 2500) return 'Subhedar';
  if (xp >= 1000) return 'Sardar';
  if (xp >= 300) return 'Mavala';
  return 'Soldier';
};

const getQuizStats = (progress: QuizProgress[]) => {
  const completed = progress.filter((item) => item.completed);
  const xp = completed.reduce((total, item) => total + item.score * 10 + item.stars * 25, 0);
  const totalStars = completed.reduce((total, item) => total + item.stars, 0);
  const bestScore = completed.reduce((best, item) => Math.max(best, item.score), 0);
  const perfectQuizzes = completed.filter((item) => item.score === 10).length;
  const streak = calculateStreak(completed);

  return {
    completedCount: completed.length,
    xp,
    totalStars,
    bestScore,
    perfectQuizzes,
    streak,
    rank: getRank(xp),
    milestoneProgress: Math.min((xp / 1000) * 100, 100),
    completionPercent: Math.round((completed.length / 90) * 100),
  };
};

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [profileData, setProfileData] = useState<any>(null);
  const [quizProgress, setQuizProgress] = useState<QuizProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const quizStats = React.useMemo(() => {
    return getQuizStats(quizProgress);
  }, [quizProgress]);

  const achievements = [
    {
      title: 'First Conquest',
      desc: quizStats.completedCount > 0 ? `Completed ${quizStats.completedCount} quiz${quizStats.completedCount > 1 ? 'zes' : ''}` : 'Complete your first quiz',
      unlocked: quizStats.completedCount > 0,
      icon: <Award className={quizStats.completedCount > 0 ? 'text-yellow-500' : 'text-gray-600'} />,
    },
    {
      title: 'History Buff',
      desc: quizStats.perfectQuizzes > 0 ? `${quizStats.perfectQuizzes} perfect quiz${quizStats.perfectQuizzes > 1 ? 'zes' : ''}` : 'Score 10/10 in a quiz',
      unlocked: quizStats.perfectQuizzes > 0,
      icon: <Trophy className={quizStats.perfectQuizzes > 0 ? 'text-blue-500' : 'text-gray-600'} />,
    },
    {
      title: 'Streak Keeper',
      desc: quizStats.streak > 0 ? `${quizStats.streak} day learning streak` : 'Complete quizzes on consecutive days',
      unlocked: quizStats.streak > 0,
      icon: <Flame className={quizStats.streak > 0 ? 'text-orange-500' : 'text-gray-600'} />,
    },
    {
      title: 'Star Collector',
      desc: quizStats.totalStars > 0 ? `${quizStats.totalStars} total stars earned` : 'Earn stars from quiz results',
      unlocked: quizStats.totalStars > 0,
      icon: <Star className={quizStats.totalStars > 0 ? 'text-royal-gold' : 'text-gray-600'} />,
    },
  ];

  useEffect(() => {
    if (user) {
      fetchProfile();
      setName(user?.user_metadata?.full_name || '');
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const [profileResponse, progressResponse] = await Promise.all([
        fetch(`/api/profile/${user?.id}`),
        getQuizProgress(user?.id || ''),
      ]);

      if (!profileResponse.ok) throw new Error('Failed to fetch profile');

      const profileResult = await profileResponse.json();
      const data = profileResult.data || profileResult;
      const progress = progressResponse.data || [];
      const freshStats = getQuizStats(progress);
      setQuizProgress(progress);
      
      // Smart mapping for flexible column names
      const mappedData = {
        ...data,
        total_score: freshStats.xp || data.total_score || data.score || data.points || data.xp || 0,
        progress: freshStats.completionPercent,
        rank: freshStats.rank || data.rank || data.status || 'Soldier',
        streak: freshStats.streak || data.streak || data.learning_streak || 0
      };
      
      setProfileData(mappedData);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      // 1. Update Auth Metadata (Supabase Auth directly)
      const { error: authErr } = await supabase.auth.updateUser({
        data: { full_name: name }
      });
      if (authErr) throw authErr;

      // 2. Update Profiles Table via Backend
      await fetch(`/api/profile/${user?.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: name })
      });

      setProfileData({ ...profileData, full_name: name });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Please choose an image smaller than 5MB.');
      return;
    }

    setUploadingAvatar(true);
    try {
      const extension = file.name.split('.').pop() || 'jpg';
      const filePath = `${user.id}/avatar-${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const avatarUrl = data.publicUrl;

      const { error: authErr } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl },
      });
      if (authErr) throw authErr;

      await fetch(`/api/profile/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: profileData?.full_name || user.user_metadata?.full_name || name,
          avatar_url: avatarUrl,
        }),
      });

      setProfileData((current: any) => ({ ...current, avatar_url: avatarUrl }));
    } catch (err) {
      console.error('Error uploading avatar:', err);
      const message = err instanceof Error ? err.message : 'Make sure the Supabase avatars bucket exists.';
      alert(`Could not upload profile photo. ${message}`);
    } finally {
      setUploadingAvatar(false);
      event.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">WARRIOR <span className="text-saffron">PROFILE</span></h1>
          <p className="text-gray-500 font-light">Manage your identity and track your legendary progress.</p>
        </header>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-saffron animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#111] border border-white/5 p-10 rounded-[3rem] relative overflow-hidden"
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

                <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-10">
                  <div className="relative group">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                    {profileData?.avatar_url ? (
                      <img 
                        src={profileData.avatar_url} 
                        alt="Avatar" 
                        className="w-32 h-32 rounded-[2.5rem] object-cover shadow-[0_0_50px_rgba(244,164,96,0.1)]"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-saffron/20 rounded-[2.5rem] flex items-center justify-center text-saffron text-4xl font-black shadow-[0_0_50px_rgba(244,164,96,0.1)]">
                        {user?.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute bottom-0 right-0 p-2 bg-[#1a1a1a] border border-white/10 rounded-full text-gray-500 hover:text-saffron transition-all disabled:opacity-50"
                      title="Choose profile photo"
                    >
                      {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-black/20 border border-saffron/30 rounded-xl px-4 py-2 text-2xl font-bold text-white focus:outline-none mb-2 w-full"
                      />
                    ) : (
                      <h2 className="text-3xl font-black text-white mb-2">{profileData?.full_name || user?.user_metadata?.full_name || 'Anonymous Warrior'}</h2>
                    )}
                    <p className="text-saffron font-bold uppercase tracking-widest text-xs mb-6">{quizStats.rank || profileData?.rank || 'Mavala'} Rank</p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 text-gray-400 font-light">
                        <Mail className="w-4 h-4 text-gray-600" />
                        <span>{user?.email}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-400 font-light">
                        <Shield className="w-4 h-4 text-gray-600" />
                        <span>Joined Swarajya in {profileData?.created_at ? new Date(profileData.created_at).getFullYear() : '2026'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#111] border border-white/5 p-8 rounded-3xl">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Learning Streak</h3>
                  <div className="flex items-end space-x-2">
                    <span className="text-5xl font-black text-white">{quizStats.streak}</span>
                    <span className="text-saffron font-bold mb-2">DAYS</span>
                  </div>
                </div>
                <div className="bg-[#111] border border-white/5 p-8 rounded-3xl">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Total Knowledge Units</h3>
                  <div className="flex items-end space-x-2">
                    <span className="text-5xl font-black text-white">{quizStats.xp}</span>
                    <span className="text-saffron font-bold mb-2">XP</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#111] border border-white/5 p-6 rounded-3xl">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Quizzes Completed</h3>
                  <p className="text-3xl font-black text-white">{quizStats.completedCount}</p>
                </div>
                <div className="bg-[#111] border border-white/5 p-6 rounded-3xl">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Best Result</h3>
                  <p className="text-3xl font-black text-white">{quizStats.bestScore}/10</p>
                </div>
                <div className="bg-[#111] border border-white/5 p-6 rounded-3xl">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Stars Earned</h3>
                  <p className="text-3xl font-black text-white">{quizStats.totalStars}</p>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center">
                <span className="w-1 h-6 bg-saffron mr-3 rounded-full"></span>
                Achievements
              </h2>
              {achievements.map((ach, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`bg-[#111] border p-6 rounded-[2rem] flex items-center space-x-4 group transition-all ${
                    ach.unlocked ? 'border-white/5 hover:border-saffron/20' : 'border-white/5 opacity-50'
                  }`}
                >
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    {ach.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{ach.title}</h4>
                    <p className="text-xs text-gray-500 font-light">{ach.desc}</p>
                  </div>
                </motion.div>
              ))}
              
              <div className="p-8 bg-gradient-to-br from-saffron/10 to-transparent border border-saffron/20 rounded-[2rem] text-center">
                <p className="text-xs font-bold text-saffron uppercase tracking-widest mb-2">Next Milestone</p>
                <h4 className="font-bold text-white mb-4 text-sm">Become a 'Sardar'</h4>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-saffron" 
                    style={{ width: `${quizStats.milestoneProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
