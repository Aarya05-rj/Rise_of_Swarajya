import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import logo from '../assets/logo.png';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('[Registration] Starting signup for:', email);
      
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (signUpError) {
        console.error('[Registration Error] Supabase Auth Error:', signUpError);
        throw signUpError;
      }

      if (data?.user) {
        console.log('[Registration Success] User created:', data.user.id);
        
        // If email confirmation is disabled, we can navigate immediately
        // If not, we might need to show a 'Check your email' message
        if (data.session) {
          navigate('/dashboard');
        } else {
          // If no session, it likely means email confirmation is required
          setError('Success! Please check your email to confirm your account.');
          setLoading(false);
        }
      }
    } catch (err: any) {
      console.error('[Registration Critical] Error details:', err);
      
      // Better user-facing error messages
      if (err.message === 'Database error saving new user') {
        setError('Database sync error. Please try again or contact support.');
      } else if (err.message.includes('already registered')) {
        setError('This email is already registered. Try signing in.');
      } else {
        setError(err.message || 'An unexpected error occurred during registration.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Failed to connect with Google');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-saffron/10 rounded-full blur-[120px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[#111] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-saffron to-transparent"></div>

          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-saffron/10 rounded-2xl">
                <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Join the Swarajya</h1>
            <p className="text-gray-500 font-light text-sm italic">"Become a guardian of history"</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl text-center animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-saffron transition-colors" />
              <input 
                type="text" 
                placeholder="Full Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-4 bg-[#1a1a1a] border border-white/5 rounded-2xl focus:outline-none focus:border-saffron/50 transition-all text-white placeholder:text-gray-600"
              />
            </div>

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-saffron transition-colors" />
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-4 bg-[#1a1a1a] border border-white/5 rounded-2xl focus:outline-none focus:border-saffron/50 transition-all text-white placeholder:text-gray-600"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-saffron transition-colors" />
              <input 
                type="password" 
                placeholder="Create Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-4 bg-[#1a1a1a] border border-white/5 rounded-2xl focus:outline-none focus:border-saffron/50 transition-all text-white placeholder:text-gray-600"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-saffron hover:bg-saffron-light text-black font-black text-lg rounded-2xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center group disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Register
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="bg-[#111] px-4 text-gray-600">Or continue with</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/5 transition-all flex items-center justify-center space-x-3 group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Google</span>
            </button>
          </form>

          <div className="mt-8 text-center text-gray-500 text-sm">
            Already a member? {' '}
            <Link to="/login" className="text-saffron hover:underline font-bold transition-all">Sign In</Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">← Back to Swarajya Hub</Link>
        </div>
      </motion.div>
    </div>
  );
};
