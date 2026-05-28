import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router";
import { X } from "lucide-react";
import { useTranslation, Trans } from "react-i18next";
import { ref, push, set } from "firebase/database";
import { db } from "../lib/firebase";

const SUPPORTED_LANGS = ["pt-BR", "en", "es"];

export default function WelcomeModal() {
  const { t, i18n } = useTranslation("home");
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const newLangLogged = useRef(false);

  useEffect(() => {
    // Delay showing to let page render first, sempre aparece
    const t = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  // --- Detecta idiomas não suportados e notifica no Firebase ---
  useEffect(() => {
    if (newLangLogged.current) return;
    const detected = navigator.language;
    // Verifica se o idioma detectado está entre os suportados
    const isSupported = SUPPORTED_LANGS.some(
      (lng) => detected === lng || detected.startsWith(lng + "-") || lng.startsWith(detected + "-"),
    );
    if (!isSupported) {
      newLangLogged.current = true;
      const novosRef = ref(db, "novos_idiomas");
      const novoRef = push(novosRef);
      set(novoRef, {
        language: detected,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      });
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setDismissed(true);
      // Dispara evento para o GuidedTour começar
      window.dispatchEvent(new CustomEvent("tour:start"));
    }, 300);
  }, []);

  // Impede scroll do body enquanto o modal está aberto
  useEffect(() => {
    if (!dismissed) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [dismissed]);

  if (dismissed) return null;

  const fecharLabel = t("close", { ns: "translation" });

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Overlay bloqueante */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleDismiss}
      />

      {/* Modal */}
      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8 text-center space-y-5 border border-gray-200 dark:border-gray-700">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
          aria-label={fecharLabel}
        >
          <X size={20} />
        </button>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-red-600 dark:text-red-500">
          {t("welcome.title")}
        </h1>

        {/* Body */}
        <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
          {t("welcome.description")}
        </p>

        {/* Observation */}
        <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 leading-relaxed italic">
          <Trans
            i18nKey="welcome.observation"
            ns="home"
            components={[
              <Link
                to="/mapa"
                className="text-red-600 dark:text-red-500 underline hover:opacity-80 font-medium not-italic"
                onClick={handleDismiss}
                key="l1"
              />,
              <strong className="not-italic" key="s1" />,
            ]}
          />
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/blog"
            onClick={handleDismiss}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-all active:scale-95"
          >
            {t("welcome.cta")}
          </Link>
          <button
            onClick={handleDismiss}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline text-sm transition"
          >
            {t("welcome.continuar")}
          </button>
        </div>
      </div>
    </div>
  );
}
