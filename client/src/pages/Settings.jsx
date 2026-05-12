import PageHeader from "../components/PageHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Settings() {
  const { admin } = useAuth();
  const { dark, toggleTheme } = useTheme();

  return (
    <>
      <PageHeader title="Settings" subtitle="Admin profile, interface preference and deployment notes." />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="royal-panel rounded-xl p-6">
          <h3 className="font-display text-xl font-bold">Profile</h3>
          <div className="mt-5 space-y-3 text-sm">
            <p><span className="font-semibold">Name:</span> {admin?.name}</p>
            <p><span className="font-semibold">Email:</span> {admin?.email}</p>
            <p><span className="font-semibold">Role:</span> {admin?.role}</p>
          </div>
        </section>
        <section className="royal-panel rounded-xl p-6">
          <h3 className="font-display text-xl font-bold">Appearance</h3>
          <div className="mt-5 flex items-center justify-between rounded-lg border border-amber-100 p-4 dark:border-white/10">
            <div><p className="font-semibold">Dark mode</p><p className="text-sm text-royalBrown/60 dark:text-white/60">Use a deeper command-room interface.</p></div>
            <button className="btn-primary" onClick={toggleTheme}>{dark ? "Enabled" : "Disabled"}</button>
          </div>
        </section>
      </div>
    </>
  );
}
