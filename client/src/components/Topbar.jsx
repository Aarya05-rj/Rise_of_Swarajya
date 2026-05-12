import { FaBars, FaMoon, FaRightFromBracket, FaSun } from "react-icons/fa6";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Topbar({ onMenu }) {
  const { admin, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-amber-200/70 bg-parchment/90 px-4 backdrop-blur dark:border-white/10 dark:bg-[#150f0d]/90 lg:px-8">
      <div className="flex items-center gap-4">
        <button className="btn-secondary px-3 lg:hidden" onClick={onMenu} aria-label="Open menu">
          <FaBars />
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-saffron">Admin Command</p>
          <h1 className="font-display text-2xl font-bold text-royalBrown dark:text-white">Swarajya Records</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="btn-secondary px-3" onClick={toggleTheme} aria-label="Toggle dark mode">
          {dark ? <FaSun /> : <FaMoon />}
        </button>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-royalBrown dark:text-white">{admin?.name}</p>
          <p className="text-xs text-royalBrown/60 dark:text-white/60">{admin?.email}</p>
        </div>
        <button className="btn-secondary px-3" onClick={logout} aria-label="Logout">
          <FaRightFromBracket />
        </button>
      </div>
    </header>
  );
}
