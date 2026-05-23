import { useTranslation } from "react-i18next";
import { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";

const languages = [
  { code: "pt-BR", label: "PT" },
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLang = languages.find((l) => l.code === i18n.language) ?? languages[0];

  const switchLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div className="relative z-50" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 text-[10px] md:text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
        aria-label="Mudar idioma"
      >
        <Globe size={12} />
        <span>{currentLang.label}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl min-w-[90px] overflow-hidden">
          {languages.map((lang) => {
            const isActive = lang.code === i18n.language;
            return (
              <button
                key={lang.code}
                onClick={() => switchLanguage(lang.code)}
                className={`flex items-center justify-between w-full px-3 py-1.5 text-xs transition-colors ${
                  isActive
                    ? "text-gray-900 dark:text-gray-100 font-medium"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
                }`}
              >
                <span>{lang.label}</span>
                {isActive && <Check size={12} className="text-gray-900 dark:text-gray-100" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
