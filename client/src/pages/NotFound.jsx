import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-parchment p-6 text-center dark:bg-[#150f0d]">
      <div>
        <p className="font-display text-7xl font-bold text-saffron">404</p>
        <h1 className="mt-4 font-display text-3xl font-bold text-royalBrown dark:text-white">Page not found</h1>
        <p className="mt-2 text-royalBrown/70 dark:text-white/60">This record is not in the archive.</p>
        <Link className="btn-primary mt-6" to="/dashboard">Return to Dashboard</Link>
      </div>
    </div>
  );
}
