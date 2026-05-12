import { NavLink } from "react-router-dom";
import { FaBookOpen, FaChartPie, FaGear, FaImages, FaTimeline } from "react-icons/fa6";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: FaChartPie },
  { to: "/stories", label: "Stories", icon: FaBookOpen },
  { to: "/timeline", label: "Timeline", icon: FaTimeline },
  { to: "/gallery", label: "Gallery", icon: FaImages },
  { to: "/settings", label: "Settings", icon: FaGear }
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      <div className={`fixed inset-0 z-30 bg-black/40 lg:hidden ${open ? "block" : "hidden"}`} onClick={onClose} />
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 -translate-x-full border-r border-amber-200 bg-royalBrown text-parchment transition lg:static lg:translate-x-0 dark:border-white/10 ${
          open ? "translate-x-0" : ""
        }`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-saffron font-display text-xl font-bold text-royalBrown">RS</div>
          <div>
            <p className="font-display text-xl font-bold text-gold">Rise of Swarajya</p>
            <p className="text-xs text-amber-100/70">Royal Admin Panel</p>
          </div>
        </div>
        <nav className="space-y-2 px-4 py-6">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                  isActive ? "bg-saffron text-royalBrown" : "text-amber-50/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
