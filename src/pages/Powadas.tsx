import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, ListMusic, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';

interface Powada {
  id: string;
  title: string;
  artist: string;
  duration: string;
  description: string;
  audio_url: string;
}

export const Powadas: React.FC = () => {
  const { user } = useAuth();
  const [playlist, setPlaylist] = useState<Powada[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<Powada | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchPowadas();
  }, []);

  const fetchPowadas = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/powadas');
      if (!response.ok) throw new Error('Failed to fetch powadas');
      
      const data = await response.json();
      setPlaylist(data || []);
    } catch (err) {
      console.error('Error fetching powadas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  const togglePlay = async (track: Powada) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      
      // Tracking: Only log when starting a NEW track
      if (user) {
        try {
          await fetch('http://localhost:5000/api/activities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: user.id,
              activity_name: `Listened to Ballad: ${track.title}`,
              score_boost: 5
            })
          });
        } catch (err) {
          console.error('Tracking Error:', err);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8 flex flex-col">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">EPIC <span className="text-saffron">POWADAS</span></h1>
          <p className="text-gray-500 font-light">Traditional ballads celebrating the valor and victories of the Maratha Empire.</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8 flex-1">
          {/* Playlist */}
          <div className="lg:w-1/2 space-y-4">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <ListMusic className="w-5 h-5 mr-3 text-saffron" />
              Ballad Collection
            </h2>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-saffron animate-spin" />
              </div>
            ) : playlist.length === 0 ? (
              <p className="text-gray-600 italic text-center py-12">No ballads found in the archives.</p>
            ) : (
              playlist.map((track) => (
                <motion.div
                  key={track.id}
                  whileHover={{ x: 5 }}
                  onClick={() => togglePlay(track)}
                  className={`p-6 rounded-[2rem] border cursor-pointer transition-all flex items-center justify-between group ${
                    currentTrack?.id === track.id 
                      ? 'bg-saffron/10 border-saffron/30' 
                      : 'bg-[#111] border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                      currentTrack?.id === track.id ? 'bg-saffron text-black' : 'bg-white/5 text-gray-500 group-hover:bg-saffron/20 group-hover:text-saffron'
                    }`}>
                      {currentTrack?.id === track.id && isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className={`font-bold transition-colors ${currentTrack?.id === track.id ? 'text-saffron' : 'text-white'}`}>
                        {track.title}
                      </h3>
                      <p className="text-xs text-gray-500 font-light mt-1 uppercase tracking-widest">{track.artist}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-gray-700">{track.duration}</span>
                </motion.div>
              ))
            )}
          </div>

          {/* Lyrics / Details */}
          <div className="lg:w-1/2">
            <AnimatePresence mode="wait">
              {currentTrack ? (
                <motion.div
                  key={currentTrack.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-[#111] border border-white/5 rounded-[3rem] p-10 h-full flex flex-col"
                >
                  {/* Hidden Audio Player */}
                  <audio 
                    ref={audioRef} 
                    src={currentTrack.audio_url} 
                    onEnded={() => setIsPlaying(false)}
                    className="hidden" 
                  />

                  <div className="text-center mb-10">
                    <div className="w-32 h-32 bg-saffron/10 rounded-[2.5rem] mx-auto mb-8 flex items-center justify-center text-saffron shadow-[0_0_50px_rgba(244,164,96,0.1)]">
                      <Music className="w-16 h-16" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2">{currentTrack.title}</h2>
                    <p className="text-saffron font-bold uppercase tracking-[0.2em] text-xs">{currentTrack.artist}</p>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 w-full">
                      <p className="text-xs text-saffron font-bold uppercase tracking-[0.2em] mb-4">Ballad Description</p>
                      <p className="text-gray-400 font-light leading-relaxed italic">
                        "{currentTrack.description}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-8">
                    <button className="text-gray-600 hover:text-white transition-colors"><SkipBack /></button>
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-16 h-16 bg-saffron text-black rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg"
                    >
                      {isPlaying ? <Pause /> : <Play />}
                    </button>
                    <button className="text-gray-600 hover:text-white transition-colors"><SkipForward /></button>
                    <button className="text-gray-600 hover:text-white transition-colors"><Volume2 /></button>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-[#111]/50 border border-white/5 border-dashed rounded-[3rem] p-10 h-full flex flex-col items-center justify-center text-center opacity-50">
                  <Music className="w-16 h-16 text-gray-700 mb-6" />
                  <h3 className="text-xl font-bold text-gray-600 mb-2">Select a Ballad</h3>
                  <p className="text-sm text-gray-700 max-w-xs mx-auto">Click on a Powada from the collection to start the legend.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};
