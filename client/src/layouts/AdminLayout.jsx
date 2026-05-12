import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";

export default function AdminLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-parchment text-ink dark:bg-[#150f0d] dark:text-parchment">
      <div className="flex">
        <Sidebar open={open} onClose={() => setOpen(false)} />
        <main className="min-h-screen flex-1">
          <Topbar onMenu={() => setOpen(true)} />
          <div className="mx-auto max-w-7xl p-4 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
