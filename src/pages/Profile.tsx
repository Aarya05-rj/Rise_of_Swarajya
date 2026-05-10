import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Mail, Shield, Award, Edit2, Save, X, Camera, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const achievements = [
    { title: 'First Conquest', desc: 'Completed the first module', icon: <Award className="text-yellow-500" /> },
    { title: 'History Buff', desc: 'Scored 100% in a quiz', icon: <Award className="text-blue-500" /> },
    { title: 'Fort Scout', desc: 'Visited all fort pages', icon: <Award className="text-green-500" /> },
  ];

  useEffect(() => {
    if (user) {
      fetchProfile();
      setName(user?.user_metadata?.full_name || '');
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/profile/${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      
      const payload = await response.json();
      const data = payload.data || payload;
      
      // Smart mapping for flexible column names
      const mappedData = {
        ...data,
        total_score: data.total_score || data.score || data.points || data.xp || 0,
        progress: data.progress || data.completion || data.percentage || 0,
        rank: data.rank || data.status || 'Soldier',
        streak: data.streak || data.learning_streak || 0
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
      await fetch(`http://localhost:5000/api/profile/${user?.id}`, {
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
                    <button className="absolute bottom-0 right-0 p-2 bg-[#1a1a1a] border border-white/10 rounded-full text-gray-500 hover:text-saffron transition-all">
                      <Camera className="w-4 h-4" />
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
                    <span className="text-5xl font-black text-white">{profileData?.streak || '0'}</span>
                    <span className="text-saffron font-bold mb-2">DAYS</span>
                  </div>
                </div>
                <div className="bg-[#111] border border-white/5 p-8 rounded-3xl">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Total Knowledge Units</h3>
                  <div className="flex items-end space-x-2">
                    <span className="text-5xl font-black text-white">{profileData?.total_score || '0'}</span>
                    <span className="text-saffron font-bold mb-2">XP</span>
                  </div>
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
                  className="bg-[#111] border border-white/5 p-6 rounded-[2rem] flex items-center space-x-4 group hover:border-saffron/20 transition-all"
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
                    style={{ width: `${(profileData?.total_score / 2000) * 100}%` }}
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
