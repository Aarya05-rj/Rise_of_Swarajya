import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#0a0a0a]/90 backdrop-blur-md border-b border-saffron/20 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
            <span className="text-2xl font-bold tracking-wider text-white">
              RISE OF <span className="text-saffron">SWARAJYA</span>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-300 hover:text-saffron transition-colors">Home</Link>
            <Link to="/timeline" className="text-gray-300 hover:text-saffron transition-colors">Timeline</Link>
            <Link to="/forts" className="text-gray-300 hover:text-saffron transition-colors">Forts</Link>
            <Link to="/characters" className="text-gray-300 hover:text-saffron transition-colors">Characters</Link>
            {user ? (
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 bg-saffron hover:bg-saffron-light text-black font-bold rounded-full transition-all hover:scale-105 active:scale-95"
              >
                Dashboard
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-300 hover:text-saffron transition-colors">Login</Link>
                <Link to="/register" className="px-6 py-2 border-2 border-saffron text-saffron hover:bg-saffron hover:text-black font-bold rounded-full transition-all">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-saffron">
              {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-b border-saffron/20 animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 text-gray-300 hover:text-saffron">Home</Link>
            <Link to="/timeline" className="block px-3 py-2 text-gray-300 hover:text-saffron">Timeline</Link>
            <Link to="/forts" className="block px-3 py-2 text-gray-300 hover:text-saffron">Forts</Link>
            <Link to="/characters" className="block px-3 py-2 text-gray-300 hover:text-saffron">Characters</Link>
            {user ? (
              <Link to="/dashboard" className="block px-3 py-2 text-saffron font-bold">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 text-gray-300 hover:text-saffron">Login</Link>
                <Link to="/register" className="block px-3 py-2 text-saffron font-bold">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
