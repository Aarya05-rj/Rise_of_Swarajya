import { useEffect, useState } from "react";
import { FaBookOpen, FaCalendarDays, FaFilePen, FaImages, FaScroll } from "react-icons/fa6";
import PageHeader from "../components/PageHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import api from "../services/api.js";

export default function Dashboard() {
  const [data, setData] = useState({ stats: {}, recentActivities: [] });

  useEffect(() => {
    api.get("/dashboard").then((res) => setData(res.data));
  }, []);

  const stats = data.stats || {};

  return (
    <>
      <PageHeader title="Dashboard" subtitle="A command view for historical stories, timeline events and visual archives." />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Stories" value={stats.stories || 0} icon={FaBookOpen} />
        <StatCard title="Total Events" value={stats.events || 0} icon={FaCalendarDays} tone="from-yellow-300 to-gold" />
        <StatCard title="Gallery Images" value={stats.images || 0} icon={FaImages} tone="from-amber-300 to-orange-200" />
        <StatCard title="Published" value={stats.publishedStories || 0} icon={FaScroll} tone="from-lime-300 to-emerald-300" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="royal-panel rounded-xl p-6">
          <h3 className="font-display text-xl font-bold text-royalBrown dark:text-white">Publication Strength</h3>
          <div className="mt-6 space-y-4">
            {[{ label: "Published Stories", value: stats.publishedStories || 0 }, { label: "Draft Stories", value: stats.draftStories || 0 }, { label: "Timeline Events", value: stats.events || 0 }].map((item) => {
              const total = Math.max(stats.stories || 1, item.value);
              return (
                <div key={item.label}>
                  <div className="mb-2 flex justify-between text-sm font-semibold"><span>{item.label}</span><span>{item.value}</span></div>
                  <div className="h-3 rounded-full bg-amber-100 dark:bg-white/10">
                    <div className="h-3 rounded-full bg-gradient-to-r from-saffron to-gold" style={{ width: `${Math.min(100, (item.value / total) * 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        <section className="royal-panel rounded-xl p-6">
          <h3 className="flex items-center gap-2 font-display text-xl font-bold text-royalBrown dark:text-white"><FaFilePen /> Recent Activity</h3>
          <div className="mt-5 space-y-3">
            {data.recentActivities?.length ? data.recentActivities.map((item) => (
              <div key={item.id} className="rounded-lg border border-amber-100 p-3 text-sm dark:border-white/10">
                <p className="font-semibold">{item.action} {item.entity_type}</p>
                <p className="text-xs text-royalBrown/60 dark:text-white/50">{new Date(item.created_at).toLocaleString()}</p>
              </div>
            )) : <p className="text-sm text-royalBrown/60 dark:text-white/60">No activity yet.</p>}
          </div>
        </section>
      </div>
    </>
  );
}
