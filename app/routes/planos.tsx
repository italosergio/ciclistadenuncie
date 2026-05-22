import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../lib/AuthContext";

export function meta() {
  return [{ title: "Planos - Ciclista Denuncie" }];
}

export default function Planos() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/admin?tab=planos", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <p className="text-sm text-slate-400">Redirecionando...</p>
    </div>
  );
}
