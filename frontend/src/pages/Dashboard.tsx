import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { 
  History, 
  Map as MapIcon, 
  Users, 
  HelpCircle,
  Shield,
  Activity,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getQuizProgress, getUserStats, getProfile } from '../services/api';

const normalizeActivities = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.activities)) return payload.activities;
  return [];
};

const readJson = async (response: Response) => {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
};

export const Dashboard: React.FC = () => {
  const { user, session } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const headers = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined;
      
      // Fetch everything in parallel
      // Fetch everything using our API helpers which handle tokens better
      const [stats, profile] = await Promise.all([
        getUserStats(user?.id || ''),
        getProfile(user?.id || '')
      ]);

      if (stats.success) {
        const s = stats.data;
        setUserData((prev: any) => ({
          ...prev,
          total_score: s.totalXp,
          progress: Math.round((s.totalAttempts / 90) * 100),
          rank: s.totalXp > 500 ? 'Sardar' : s.totalXp > 200 ? 'Warrior' : 'Soldier',
          currentStreak: s.currentStreak
        }));
        setActivities(s.recentAttempts || []);
      }

      if (profile.success) {
        setUserData((prev: any) => ({ ...prev, ...profile.data }));
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };



  const quickLinks = [
    { title: 'Historical Timeline', icon: <History />, color: 'bg-blue-500/10 text-blue-500', path: '/timeline', desc: 'Journey through the ages' },
    { title: 'Fort Exploration', icon: <MapIcon />, color: 'bg-saffron/10 text-saffron', path: '/forts', desc: 'Visit legendary citadels' },
    { title: 'Characters Hub', icon: <Users />, color: 'bg-green-500/10 text-green-500', path: '/characters', desc: 'Meet the legends' },
    { title: 'Knowledge Quiz', icon: <HelpCircle />, color: 'bg-purple-500/10 text-purple-500', path: '/quiz', desc: 'Test your wisdom' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
              SAYADRI'S PRIDE, <span className="text-saffron uppercase">{user?.user_metadata?.full_name?.split(' ')[0] || 'WARRIOR'}</span>
            </h1>
            <p className="text-gray-500 font-light italic">"Freedom is the fruit of bravery."</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-saffron bg-saffron/5 px-4 py-2 rounded-full border border-saffron/20">
              <span className="w-2 h-2 bg-saffron rounded-full animate-pulse"></span>
              Live Campaign
            </div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-orange-500 bg-orange-500/5 px-4 py-2 rounded-full border border-orange-500/20">
              <span className="text-lg">🔥</span>
              <span>{userData?.currentStreak || 0} DAY STREAK</span>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-saffron animate-spin" />
          </div>
        ) : (
          <>
            {/* Quote Block */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111] border border-white/5 p-8 md:p-12 rounded-[2.5rem] mb-12 relative overflow-hidden group hover:border-saffron/30 transition-all"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-saffron/5 rounded-full blur-[80px] group-hover:bg-saffron/10 transition-all"></div>
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-[50px]"></div>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <span className="text-6xl text-saffron/20 font-serif leading-none absolute -top-4 -left-2">"</span>
                <p className="text-2xl md:text-4xl font-light text-white leading-relaxed italic mb-8 relative z-10">
 Never bend your head always hold it high                </p>
                <div className="h-px w-24 bg-saffron/50 mb-6"></div>
                <p className="text-lg md:text-xl font-black text-saffron uppercase tracking-[0.2em]">
                  THE FEARLESS EMPEROR
                </p>
                
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {/* Quick Links */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <span className="w-1 h-6 bg-saffron mr-3 rounded-full"></span>
                  Continue Your Quest
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {quickLinks.map((link, i) => (
                    <Link key={i} to={link.path}>
                      <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-[#111] border border-white/5 p-6 rounded-3xl group transition-all hover:border-saffron/30 h-full"
                      >
                        <div className={`p-4 rounded-2xl w-fit mb-6 ${link.color} transition-transform group-hover:scale-110`}>
                          {React.cloneElement(link.icon as React.ReactElement<any>, { className: 'w-6 h-6' })}
                        </div>
                        <h3 className="text-lg font-bold mb-2 group-hover:text-saffron transition-colors">{link.title}</h3>
                        <p className="text-sm text-gray-500 font-light">{link.desc}</p>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <Activity className="w-5 h-5 text-saffron mr-3" />
                  Real History
                </h2>
                <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-6 space-y-4">
                  {activities.length === 0 ? (
                    <div className="text-center py-10">
                      <History className="w-10 h-10 text-gray-800 mx-auto mb-3" />
                      <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">No activities yet</p>
                    </div>
                  ) : (
                    activities.map((act, i) => (
                      <div key={i} className="flex items-start space-x-4 p-4 hover:bg-white/5 rounded-2xl transition-colors group">
                        <div className="w-10 h-10 bg-saffron/10 rounded-xl flex items-center justify-center group-hover:bg-saffron transition-colors overflow-hidden p-2">
                          <HelpCircle className="w-5 h-5 text-saffron group-hover:text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">
                            Quiz {act.quiz_id || 'Completed'}
                          </p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                            Score: {act.score}% • {new Date(act.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Progress Section */}
            <div className="bg-[#111] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-2">Overall Progress</h2>
                <p className="text-gray-500 text-sm mb-8">You are currently at <span className="text-saffron font-bold">{userData?.progress || 0}%</span> completion of the Swarajya Chronicles.</p>
                
                <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden mb-4">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${userData?.progress || 0}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-saffron to-saffron-light shadow-[0_0_20px_rgba(244,164,96,0.4)]"
                  ></motion.div>
                </div>
                
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-600">
                  <span>Mavala</span>
                  <span className={userData?.progress >= 50 ? 'text-saffron' : ''}>Sardar</span>
                  <span className={userData?.progress >= 100 ? 'text-saffron' : ''}>Subhedar</span>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
