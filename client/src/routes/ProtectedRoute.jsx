import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-parchment text-royalBrown dark:bg-[#150f0d] dark:text-white">Loading royal records...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
