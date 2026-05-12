import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { FaShieldHalved } from "react-icons/fa6";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,#ff993333,transparent_35%),linear-gradient(135deg,#3E2723,#160d0a)] p-4">
      <motion.form
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-amber-200/30 bg-parchment/95 p-8 shadow-royal"
      >
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-xl bg-saffron text-3xl text-royalBrown">
          <FaShieldHalved />
        </div>
        <h1 className="mt-6 text-center font-display text-3xl font-bold text-royalBrown">Admin Login</h1>
        <p className="mt-2 text-center text-sm text-royalBrown/70">Guard the chronicles, events and gallery of Swarajya.</p>
        <div className="mt-8 space-y-4">
          <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <button className="btn-primary w-full" disabled={loading}>{loading ? "Entering..." : "Enter Admin Panel"}</button>
        </div>
      </motion.form>
    </div>
  );
}
