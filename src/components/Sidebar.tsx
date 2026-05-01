import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  History, 
  Map, 
  Users, 
  HelpCircle, 
  Music, 
  User, 
  LogOut, 
  Shield,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/dashboard' },
    { icon: <History className="w-5 h-5" />, label: 'Timeline', path: '/timeline' },
    { icon: <Map className="w-5 h-5" />, label: 'Forts', path: '/forts' },
    { icon: <Users className="w-5 h-5" />, label: 'Characters', path: '/characters' },
    { icon: <HelpCircle className="w-5 h-5" />, label: 'Quiz', path: '/quiz' },
    { icon: <Music className="w-5 h-5" />, label: 'Powadas', path: '/powadas' },
    { icon: <User className="w-5 h-5" />, label: 'Profile', path: '/profile' },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-[#151515] border border-white/10 rounded-xl text-white"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-[#0d0d0d] border-r border-white/5 flex flex-col z-40 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 flex items-center space-x-3">
          <Shield className="w-8 h-8 text-saffron fill-saffron/20" />
          <span className="text-xl font-black tracking-tighter text-white">SWARAJYA</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => 
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-saffron text-black font-bold' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="bg-[#151515] p-4 rounded-2xl mb-4 flex items-center space-x-3">
            <div className="w-10 h-10 bg-saffron/20 rounded-full flex items-center justify-center text-saffron font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.user_metadata?.full_name || 'Warrior'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all group"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
