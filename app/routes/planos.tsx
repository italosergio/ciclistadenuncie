import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../lib/AuthContext";
import { useTranslation } from "react-i18next";
import i18n from "../lib/i18n";

export function meta() {
  return [{ title: i18n.t('planos.title') }];
}

export default function Planos() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation('translation');

  useEffect(() => {
    if (user) {
      navigate("/admin?tab=planos", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <p className="text-sm text-slate-400">{t('redirecting')}</p>
    </div>
  );
}
