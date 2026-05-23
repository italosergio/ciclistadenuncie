import { ref, set, push } from "firebase/database";
import { db } from "./firebase";
import i18n from "./i18n";

const SUPPORTED_LOCALES = ["pt-BR", "en", "es"];

export function detectUnsupportedLocale(): string | null {
  const detected = i18n.language || (typeof navigator !== "undefined" ? navigator.language : null);
  if (!detected) return null;

  // i18next pode retornar código de 2 letras (ex: "fr"), precisamos verificar
  const normalized = detected.toLowerCase();
  const supported = SUPPORTED_LOCALES.map((l) => l.toLowerCase());

  // Também verifica se o código de 2 letras está em supported
  const shortCode = normalized.split("-")[0];
  if (supported.includes(normalized) || supported.includes(shortCode)) {
    return null; // locale suportado, ignorar
  }

  return detected;
}

export async function trackUnsupportedLocale(): Promise<void> {
  try {
    const locale = detectUnsupportedLocale();
    if (!locale) return;

    const agora = new Date();
    const brasiliaTime = new Date(
      agora.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
    );
    const ano = brasiliaTime.getFullYear();
    const mes = String(brasiliaTime.getMonth() + 1).padStart(2, "0");
    const dia = String(brasiliaTime.getDate()).padStart(2, "0");
    const hora = String(brasiliaTime.getHours()).padStart(2, "0");
    const min = String(brasiliaTime.getMinutes()).padStart(2, "0");
    const seg = String(brasiliaTime.getSeconds()).padStart(2, "0");

    const id = `${ano}-${mes}-${dia}T${hora}-${min}-${seg}`;

    const data = {
      locale,
      detectedAt: agora.toISOString(),
      userAgent: navigator.userAgent.slice(0, 200), // limitar tamanho
      referrer: document.referrer || "",
    };

    await set(ref(db, `localeDetections/${id}`), data);
  } catch (err) {
    // Silencioso — não quebrar a experiência do usuário
    console.warn("Erro ao registrar locale:", err);
  }
}
