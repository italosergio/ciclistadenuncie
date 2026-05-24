import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import ptTranslation from "../locales/pt/translation.json";
import ptHome from "../locales/pt/home.json";
import ptMapa from "../locales/pt/mapa.json";
import ptDenunciar from "../locales/pt/denunciar.json";
import ptLogin from "../locales/pt/login.json";
import ptAdmin from "../locales/pt/admin.json";

import enTranslation from "../locales/en/translation.json";
import enHome from "../locales/en/home.json";
import enMapa from "../locales/en/mapa.json";
import enDenunciar from "../locales/en/denunciar.json";
import enLogin from "../locales/en/login.json";
import enAdmin from "../locales/en/admin.json";

import esTranslation from "../locales/es/translation.json";
import esHome from "../locales/es/home.json";
import esMapa from "../locales/es/mapa.json";
import esDenunciar from "../locales/es/denunciar.json";
import esLogin from "../locales/es/login.json";
import esAdmin from "../locales/es/admin.json";

const isServer = typeof window === "undefined";

const PT_RESOURCES = {
  translation: ptTranslation,
  home: ptHome,
  mapa: ptMapa,
  denunciar: ptDenunciar,
  login: ptLogin,
  admin: ptAdmin,
};

const resources = {
  "pt-BR": PT_RESOURCES,
  pt: PT_RESOURCES,
  en: {
    translation: enTranslation,
    home: enHome,
    mapa: enMapa,
    denunciar: enDenunciar,
    login: enLogin,
    admin: enAdmin,
  },
  es: {
    translation: esTranslation,
    home: esHome,
    mapa: esMapa,
    denunciar: esDenunciar,
    login: esLogin,
    admin: esAdmin,
  },
};

const detection = {
  order: ["localStorage", "cookie", "navigator"],
  caches: ["localStorage", "cookie"],
  lookupLocalStorage: "i18nextLng",
  lookupCookie: "i18nextLng",
};

const supportedLngs = ["pt-BR", "pt", "en", "es"];

if (!i18n.isInitialized) {
  i18n.use(initReactI18next);

  if (!isServer) {
    i18n.use(LanguageDetector);
  }

  i18n.init({
    resources,
    fallbackLng: "pt-BR",
    supportedLngs,
    nonExplicitSupportedLngs: true,
    defaultNS: "translation",
    fallbackNS: "translation",
    detection: isServer ? undefined : detection,
    interpolation: {
      escapeValue: false,
    },
    // On server, always start with pt-BR (will be overridden by cookie on client)
    lng: isServer ? "pt-BR" : undefined,
    react: {
      useSuspense: false,
    },
  });
}

export default i18n;
