import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Mail, Shield, Award, Edit2, Save, X, Camera, Loader2, Flame, Star, Trophy } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { getUserStats } from '../services/api';

const getRank = (xp: number) => {
  if (xp >= 5000) return 'Chhatrapati';
  if (xp >= 2500) return 'Subhedar';
  if (xp >= 1000) return 'Sardar';
  if (xp >= 300) return 'Mavala';
  return 'Soldier';
};

const emptyStats = {
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

const normalizeStats = (value: any) => ({
  ...emptyStats,
  ...(value && typeof value === 'object' ? value : {}),
  recentAttempts: Array.isArray(value?.recentAttempts) ? value.recentAttempts : [],
});

const getQuizLabel = (attempt: any) => {
  const rawQuizId = String(attempt?.quiz_id || '');
  if (rawQuizId.includes('-')) return `Level ${attempt.level_id || rawQuizId.split('-')[0]} Quiz ${rawQuizId.split('-')[1]}`;
  if (Number.isInteger(Number(attempt?.quiz_id)) && Number(attempt.quiz_id) >= 100) {
    return `Level ${Math.floor(Number(attempt.quiz_id) / 100)} Quiz ${Number(attempt.quiz_id) % 100}`;
  }
  return `Level ${attempt?.level_id || 1} Quiz ${attempt?.quiz_id || 1}`;
};

const formatDate = (value?: string) => {
  if (!value) return 'Recently';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Recently' : date.toLocaleDateString();
};

const getSafeAvatarUrl = (value?: string) => {
  if (!value) return '';
  return value;
};

const createAvatarDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Could not read the selected image.'));
    reader.onload = () => {
      const image = new Image();

      image.onerror = () => reject(new Error('Could not load the selected image.'));
      image.onload = () => {
        const maxSize = 384;
        const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
          reject(new Error('Could not prepare the selected image.'));
          return;
        }

        canvas.width = width;
        canvas.height = height;
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };

      image.src = String(reader.result || '');
    };

    reader.readAsDataURL(file);
  });

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [profileData, setProfileData] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const achievements = [
    {
      title: 'First Conquest',
      desc: userStats.totalAttempts > 0 ? `Completed ${userStats.totalAttempts} attempt${userStats.totalAttempts > 1 ? 's' : ''}` : 'Complete your first quiz',
      unlocked: userStats.totalAttempts > 0,
      icon: <Award className={userStats.totalAttempts > 0 ? 'text-yellow-500' : 'text-gray-600'} />,
    },
    {
      title: 'History Buff',
      desc: userStats.perfectScores > 0 ? `${userStats.perfectScores} perfect quiz${userStats.perfectScores > 1 ? 'zes' : ''}` : 'Score 100 in a quiz',
      unlocked: userStats.perfectScores > 0,
      icon: <Trophy className={userStats.perfectScores > 0 ? 'text-blue-500' : 'text-gray-600'} />,
    },
    {
      title: 'Streak Keeper',
      desc: userStats.currentStreak >= 5 ? `${userStats.currentStreak} day learning streak` : 'Maintain a 5 day streak',
      unlocked: userStats.currentStreak >= 5,
      icon: <Flame className={userStats.currentStreak >= 5 ? 'text-orange-500' : 'text-gray-600'} />,
    },
    {
      title: 'Star Collector',
      desc: userStats.totalXp > 0 ? `Earned ${userStats.totalXp} XP` : 'Earn XP from quizzes',
      unlocked: userStats.totalXp > 0,
      icon: <Star className={userStats.totalXp > 0 ? 'text-royal-gold' : 'text-gray-600'} />,
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
      setLoading(true);
      const [profileResult, statsResponse] = await Promise.all([
        fetch(`/api/profile/${user?.id}`).then(res => res.json()),
        getUserStats(user?.id || ''),
      ]);

      const data = profileResult.data || profileResult;
      
      if (statsResponse.success && statsResponse.data) {
        setUserStats(normalizeStats(statsResponse.data));
      }

      const freshStats = normalizeStats(statsResponse.data);
      
      // Smart mapping for flexible column names, prioritizing backend data
      const mappedData = {
        ...data,
        avatar_url: user?.user_metadata?.avatar_url || data.avatar_url || '',
        total_score: freshStats.totalXp ?? data.total_score ?? data.score ?? 0,
        progress: Math.min(((freshStats.totalAttempts || 0) / 90) * 100, 100),
        rank: data.rank || getRank(freshStats.totalXp || 0) || 'Soldier',
        streak: Number(localStorage.getItem("quizStreak")) || freshStats.currentStreak || data.streak || 0
      };
      
      setProfileData(mappedData);
      setUserStats((prev: any) => ({
        ...freshStats,
        currentStreak: mappedData.streak
      }));
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
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type 
        });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Update Auth Metadata
      const { error: authErr } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });
      if (authErr) throw authErr;

      // 4. Update Database Table (Try both 'profiles' and 'users')
      const updatePayload = {
        full_name: profileData?.full_name || user.user_metadata?.full_name || name,
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      };

      try {
        await fetch(`/api/profile/${user.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload),
        });
      } catch (err) {
        console.warn('API update failed, trying direct Supabase update');
        await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', user.id);
      }

      setProfileData((current: any) => ({ ...current, avatar_url: publicUrl }));
      alert('Profile photo updated successfully!');
    } catch (err) {
      console.error('Avatar upload error:', err);
      const message = err instanceof Error ? err.message : 'Could not update profile photo.';
      alert(`Error: ${message}`);
    } finally {
      setUploadingAvatar(false);
      if (event.target) event.target.value = '';
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
                    {getSafeAvatarUrl(profileData?.avatar_url) ? (
                      <img 
                        src={getSafeAvatarUrl(profileData?.avatar_url)} 
                        alt="Avatar" 
                        className="w-32 h-32 rounded-[2.5rem] object-cover shadow-[0_0_50px_rgba(244,164,96,0.1)]"
                        onError={() => setProfileData((current: any) => ({ ...current, avatar_url: '' }))}
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
                    <p className="text-saffron font-bold uppercase tracking-widest text-xs mb-6">{profileData?.rank || 'Mavala'} Rank</p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 text-gray-400 font-light">
                        <Mail className="w-4 h-4 text-gray-600" />
                        <span>{user?.email}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-400 font-light">
                        <div className="w-4 h-4 flex items-center justify-center grayscale opacity-60">
                          <img src="/logo.png" alt="Swarajya Logo" className="w-full h-full object-contain" />
                        </div>
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
                  <div className="flex flex-col">
                    <div className="flex items-end space-x-2">
                      <span className="text-5xl font-black text-white">{profileData?.streak || 0}</span>
                      <span className="text-saffron font-bold mb-2">DAYS</span>
                    </div>
                    {userStats.lastActiveDate && (
                      <span className="text-xs text-gray-500 mt-2 uppercase tracking-widest">
                        Last active: {new Date(userStats.lastActiveDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="bg-[#111] border border-white/5 p-8 rounded-3xl">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Total Knowledge Units</h3>
                  <div className="flex items-end space-x-2">
                    <span className="text-5xl font-black text-white">{userStats.totalXp}</span>
                    <span className="text-saffron font-bold mb-2">XP</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#111] border border-white/5 p-6 rounded-3xl">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Quiz Attempts</h3>
                  <p className="text-3xl font-black text-white">{userStats.totalAttempts}</p>
                </div>
                <div className="bg-[#111] border border-white/5 p-6 rounded-3xl">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Best Score</h3>
                  <p className="text-3xl font-black text-white">{userStats.bestScore}%</p>
                </div>
                <div className="bg-[#111] border border-white/5 p-6 rounded-3xl">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Average Score</h3>
                  <p className="text-3xl font-black text-white">{userStats.averageScore}%</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="mt-8">
                <h2 className="text-xl font-bold flex items-center mb-6">
                  <span className="w-1 h-6 bg-saffron mr-3 rounded-full"></span>
                  Recent Attempts
                </h2>
                <div className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden">
                  {userStats.recentAttempts.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 font-light">No quizzes attempted yet.</div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {userStats.recentAttempts.map((attempt: any, index: number) => (
                        <div key={index} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-saffron/10 rounded-2xl flex items-center justify-center text-saffron">
                              <Trophy className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-bold text-white">{getQuizLabel(attempt)}</h4>
                              <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">
                                {formatDate(attempt.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-black text-white">{attempt.score}%</div>
                            <div className="flex items-center justify-end space-x-1 mt-1">
                              {Array.from({ length: 3 }).map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < attempt.stars ? 'text-royal-gold fill-current' : 'text-gray-700'}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                    style={{ width: `${Math.min((userStats.totalXp / 1000) * 100, 100)}%` }}
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
