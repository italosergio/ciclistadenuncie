import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import {
  Joyride,
  type Step,
  type EventData,
  type Controls,
  ACTIONS,
  EVENTS,
  STATUS,
} from "react-joyride";
import { HelpCircle } from "lucide-react";

export default function GuidedTour() {
  const { t } = useTranslation('home');
  const location = useLocation();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [showButton, setShowButton] = useState(true);

  // Mostra o tour sempre que o usuário fecha o WelcomeModal
  useEffect(() => {
    if (location.pathname !== "/") return;

    const handler = () => {
      setRun(true);
      setShowButton(false);
    };

    window.addEventListener("tour:start", handler);
    return () => window.removeEventListener("tour:start", handler);
  }, [location.pathname]);

  // Esconde o botão durante o tour
  useEffect(() => {
    if (run) setShowButton(false);
  }, [run]);

  // Se sair da home durante o tour, para o tour
  useEffect(() => {
    if (location.pathname !== "/" && run) {
      setRun(false);
    }
  }, [location.pathname, run]);

  const steps: Step[] = [
    {
      target: "body",
      placement: "center",
      title: t("tour.welcome.title"),
      content: t("tour.welcome.content"),
    },
    {
      target: '[data-tour="logo"]',
      placement: "bottom",
      title: t("tour.logo.title"),
      content: t("tour.logo.content"),
    },
    {
      target: '[data-tour="firebikes-brancas"]',
      placement: "bottom",
      title: t("tour.firebikes-brancas.title"),
      content: t("tour.firebikes-brancas.content"),
    },
    {
      target: '[data-tour="firebikes-vermelhas"]',
      placement: "bottom",
      title: t("tour.firebikes-vermelhas.title"),
      content: t("tour.firebikes-vermelhas.content"),
    },
    {
      target: '[data-tour="contador"]',
      placement: "bottom",
      title: t("tour.contador.title"),
      content: t("tour.contador.content"),
    },
    {
      target: '[data-tour="cta-denunciar"]',
      placement: "bottom",
      title: t("tour.cta.title"),
      content: t("tour.cta.content"),
    },
    {
      target: '[data-tour="apoiadores"]',
      placement: "top",
      title: t("tour.apoiadores.title"),
      content: t("tour.apoiadores.content"),
    },
    {
      target: '[data-tour="navegacao"]',
      placement: "top",
      title: t("tour.navegacao.title"),
      content: t("tour.navegacao.content"),
    },
    {
      target: '[data-tour="idioma-login"]',
      placement: "bottom",
      title: t("tour.idioma.title"),
      content: t("tour.idioma.content"),
    },
    {
      target: '[data-tour="cta-denunciar"]',
      placement: "center",
      title: t("tour.final.title"),
      content: t("tour.final.content"),
    },
  ];

  const handleEvent = useCallback(
    (data: EventData, controls: Controls) => {
      const { action, index, status, type } = data;

      if (action === ACTIONS.CLOSE || action === ACTIONS.SKIP) {
        setRun(false);
        setShowButton(true);
        return;
      }

      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        setRun(false);
        setShowButton(true);
        return;
      }

      if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
        const nextIndex = index + (action === ACTIONS.PREV ? -1 : 1);
        setStepIndex(Math.max(0, nextIndex));
      }
    },
    []
  );

  const startTour = () => {
    setStepIndex(0);
    setRun(true);
    setShowButton(false);
  };

  if (location.pathname !== "/") return null;

  return (
    <>
      <Joyride
        steps={steps}
        run={run}
        stepIndex={stepIndex}
        continuous
        scrollToFirstStep
        options={{
          arrowColor: "#ffffff",
          backgroundColor: "#ffffff",
          primaryColor: "#dc2626",
          textColor: "#1f2937",
          spotlightPadding: 0,
          overlayColor: "rgba(0, 0, 0, 0.5)",
        }}
        styles={{
          buttonBack: {
            color: "#6b7280",
            fontSize: "14px",
          },
          buttonPrimary: {
            backgroundColor: "#dc2626",
            color: "#ffffff",
            fontSize: "14px",
            borderRadius: "8px",
            padding: "8px 16px",
          },
          buttonClose: {
            color: "#6b7280",
            fontSize: "20px",
            right: "8px",
            top: "8px",
          },
          tooltipContent: {
            fontSize: "14px",
            lineHeight: "1.5",
            padding: "8px 0",
          },
          tooltipTitle: {
            fontSize: "16px",
            fontWeight: 700,
            color: "#111827",
          },
          tooltipContainer: {
            textAlign: "left",
          },
        }}
        locale={{
          back: t("tour.back"),
          close: t("tour.close"),
          last: t("tour.last"),
          next: t("tour.next"),
        }}
        onEvent={handleEvent}
      />

      {/* Botão flutuante */}
      {showButton && (
        <button
          onClick={startTour}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-full shadow-lg transition-all active:scale-95 hover:scale-105"
          aria-label={t("tour.button.aria")}
        >
          <HelpCircle size={20} />
          <span className="text-sm font-semibold hidden sm:inline">
            {t("tour.button")}
          </span>
        </button>
      )}
    </>
  );
}
