import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";
import { useEffect, Suspense } from "react";
import { I18nextProvider, useTranslation } from "react-i18next";

import type { Route } from "./+types/root";
import { initConsoleEasterEgg } from "./lib/console-easter-egg";
import { AuthProvider } from "./lib/AuthContext";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { trackUnsupportedLocale } from "./lib/localeTracker";
import "./app.css";
import i18n from "./lib/i18n";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Bungee&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap",
  },
];

function HtmlLang() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return !isHome ? (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-1 max-md:fixed max-md:bottom-4 max-md:right-4 max-md:top-auto">
      <LanguageSwitcher />
    </div>
  ) : null;
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#dc2626" />
        <Meta />
        <Links />
      </head>
      <body className="font-sans" suppressHydrationWarning>
        <Suspense fallback={null}>
          <HtmlLang />
          {children}
        </Suspense>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  useEffect(() => {
    initConsoleEasterEgg();
    trackUnsupportedLocale();
  }, []);

  return (
    <AuthProvider>
      <I18nextProvider i18n={i18n}>
        <Outlet />
      </I18nextProvider>
    </AuthProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
