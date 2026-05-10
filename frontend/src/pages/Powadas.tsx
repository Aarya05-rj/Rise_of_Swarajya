import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Loader2, Play, Pause, SkipBack, SkipForward, Volume2, Music } from 'lucide-react';
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
  const { user, session } = useAuth();

  const [playlist, setPlaylist] = useState<Powada[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<Powada | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [volume, setVolume] = useState(0.8);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ✅ FETCH DATA
  const fetchPowadas = async () => {
    try {
      setLoading(true);

      const res = await fetch('/api/powadas');
      const result = await res.json();

      console.log("POWADA API:", result);

      setPlaylist(Array.isArray(result.data) ? result.data : []);

    } catch (err) {
      console.error('Error fetching powadas:', err);
      setPlaylist([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPowadas();
  }, []);

  // ✅ AUDIO CONTROL
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  // ✅ PROGRESS UPDATE
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setDuration(audio.duration);
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, [currentTrack]);

  // ✅ PLAY / PAUSE LOGIC
  const togglePlay = async (track: Powada, index: number) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
      return;
    }

    setCurrentTrack(track);
    setCurrentIndex(index);
    setIsPlaying(true);
    setProgress(0);

    // ✅ activity log (FIXED endpoint)
    if (user) {
      try {
        await fetch('/api/log-activity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
          body: JSON.stringify({
            user_id: user.id,
            activity_type: 'powada',
            details: {
              title: track.title
            }
          })
        });
      } catch (err) {
        console.error('Activity log error:', err);
      }
    }
  };

  // ✅ NEXT / PREVIOUS
  const playNext = () => {
    if (currentIndex < playlist.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentTrack(playlist[nextIndex]);
      setIsPlaying(true);
      setProgress(0);
    }
  };

  const playPrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentTrack(playlist[prevIndex]);
      setIsPlaying(true);
      setProgress(0);
    }
  };

  // ✅ FORMAT TIME
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-6 pt-20">
        {/* HEADER */}
        <h1 className="text-4xl font-black text-white mb-8">
          EPIC <span className="text-saffron">POWADAS</span>
        </h1>

        {/* TWO COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: POWADA LIST */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 text-saffron animate-spin" />
              </div>
            ) : playlist.length === 0 ? (
              <p className="text-gray-500">No Powadas found</p>
            ) : (
              <div className="space-y-3">
                {playlist.map((track, index) => (
                  <div
                    key={track.id || track.title || index}
                    onClick={() => togglePlay(track, index)}
                    className={`p-4 bg-[#111] border border-white/5 rounded-xl cursor-pointer transition-all ${
                      currentTrack?.id === track.id 
                        ? 'border-saffron/50 bg-saffron/10' 
                        : 'hover:border-saffron/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#1a1a1a] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Music className="w-5 h-5 text-saffron" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate">{track.title}</h3>
                        <p className="text-gray-500 text-sm truncate">{track.artist}</p>
                      </div>
                      <span className="text-gray-600 text-sm">{track.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: SPOTIFY-THEMED PLAYER */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-white/10 rounded-2xl p-6">
              
              {/* ALBUM ART */}
              <div className="w-full aspect-square bg-[#111] rounded-xl mb-6 flex items-center justify-center overflow-hidden">
                {currentTrack ? (
                  <div className="w-full h-full bg-gradient-to-br from-saffron/20 to-purple-900/30 flex items-center justify-center">
                    <Music className="w-20 h-20 text-saffron" />
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <Music className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-600 text-sm">Select a powada to play</p>
                  </div>
                )}
              </div>

              {/* TRACK INFO */}
              <div className="mb-4">
                <h2 className="text-white font-bold text-xl truncate">
                  {currentTrack?.title || 'No Track Selected'}
                </h2>
                <p className="text-gray-500 truncate">
                  {currentTrack?.artist || 'Select a powada'}
                </p>
              </div>

              {/* PROGRESS BAR */}
              <div className="mb-4">
                <div className="h-1 bg-[#333] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-saffron rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-2">
                  <span>{formatTime(duration * (progress / 100))}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* CONTROLS */}
              <div className="flex items-center justify-center gap-6 mb-6">
                <button 
                  onClick={playPrevious}
                  disabled={currentIndex <= 0}
                  className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <SkipBack className="w-6 h-6" />
                </button>
                
                <button 
                  onClick={() => currentTrack && setIsPlaying(!isPlaying)}
                  disabled={!currentTrack}
                  className="w-14 h-14 bg-white rounded-full flex items-center justify-center hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-black" />
                  ) : (
                    <Play className="w-6 h-6 text-black ml-1" />
                  )}
                </button>
                
                <button 
                  onClick={playNext}
                  disabled={currentIndex >= playlist.length - 1}
                  className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <SkipForward className="w-6 h-6" />
                </button>
              </div>

              {/* VOLUME */}
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-gray-600" />
                <input 
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="flex-1 h-1 bg-[#333] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                />
              </div>

            </div>
          </div>
        </div>

        {/* AUDIO ELEMENT */}
        {currentTrack && (
          <audio
            ref={audioRef}
            src={currentTrack.audio_url}
            onEnded={() => setIsPlaying(false)}
          />
        )}

      </main>
    </div>
  );
};
