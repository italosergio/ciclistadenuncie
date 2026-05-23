import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router";
import { X } from "lucide-react";

export default function WelcomeModal() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Delay showing to let page render first, sempre aparece
    const t = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setDismissed(true);
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
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-red-600 dark:text-red-500">
          Que bom que você chegou!
        </h1>

        {/* Body */}
        <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
          Esta é a <strong>1° plataforma de estímulo ao Cicloativismo do Brasil</strong> com foco no{" "}
          <strong>Ciclista Urbano</strong>!
        </p>

        {/* Observation */}
        <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 leading-relaxed italic">
          Obs.: Os dados não geram denúncia formal automaticamente, procure as{" "}
          <Link
            to="/mapa"
            className="text-red-600 dark:text-red-500 underline hover:opacity-80 font-medium not-italic"
            onClick={handleDismiss}
          >
            iniciativas de Cicloativismo
          </Link>{" "}
          já existentes no seu território, e fortaleça o Cicloativismo local com as suas vivências!{" "}
          <strong className="not-italic">Denúncias formais: polícia.</strong>
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/mapa"
            onClick={handleDismiss}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-all active:scale-95"
          >
            Saiba mais!
          </Link>
          <button
            onClick={handleDismiss}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline text-sm transition"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
