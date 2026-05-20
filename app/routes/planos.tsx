import { useState } from "react";
import { PLANOS, type Plano } from "../data/planos";
import { FileText, Clipboard, X, BarChart3, Search, BookOpen, Globe, Check } from "lucide-react";
import { Link } from "react-router";

export function meta() {
  return [{ title: "Planos - Ciclista Denuncie" }];
}

const categoriaIcon: Record<string, { icon: typeof BarChart3; color: string }> = {
  analytics: { icon: BarChart3, color: "text-blue-400" },
  placa: { icon: Search, color: "text-yellow-400" },
  "boas-praticas": { icon: BookOpen, color: "text-green-400" },
  pagina: { icon: Globe, color: "text-purple-400" },
};

export default function Planos() {
  const [modalPlano, setModalPlano] = useState<Plano | null>(null);
  const [copiado, setCopiado] = useState(false);

  async function handleCopiar(conteudo: string) {
    try {
      await navigator.clipboard.writeText(conteudo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      alert("Erro ao copiar. Selecione o texto manualmente.");
    }
  }

  function renderConteudo(conteudo: string) {
    // Simple markdown-like formatting for readability
    const lines = conteudo.split("\n");
    return lines.map((line, i) => {
      // Headings
      if (line.startsWith("### ")) {
        return <h3 key={i} className="text-lg font-bold text-white mt-6 mb-2">{line.slice(4)}</h3>;
      }
      if (line.startsWith("## ")) {
        return <h2 key={i} className="text-xl font-bold text-blue-400 mt-8 mb-3 border-b border-gray-700 pb-2">{line.slice(3)}</h2>;
      }
      if (line.startsWith("# ")) {
        return <h1 key={i} className="text-2xl font-bold text-white mt-2 mb-4">{line.slice(2)}</h1>;
      }
      // Code blocks
      if (line.startsWith("```")) {
        return null; // skip code fence markers
      }
      // Inline code (simple: lines starting with `)
      if (line.trim().startsWith("- `") || line.trim().startsWith("- **")) {
        return (
          <p key={i} className="text-gray-300 text-sm leading-relaxed ml-4 mb-1">
            {formatInline(line.replace(/^-\s*/, ""))}
          </p>
        );
      }
      // List items
      if (line.trim().startsWith("- ")) {
        return (
          <li key={i} className="text-gray-300 text-sm leading-relaxed ml-4 mb-1 list-disc">
            {formatInline(line.trim().slice(2))}
          </li>
        );
      }
      // Numbered list
      if (/^\d+\.\s/.test(line.trim())) {
        const match = line.trim().match(/^(\d+\.)\s(.+)/);
        if (match) {
          return (
            <li key={i} className="text-gray-300 text-sm leading-relaxed ml-4 mb-1 list-decimal">
              {formatInline(match[2])}
            </li>
          );
        }
      }
      // Empty line
      if (!line.trim()) {
        return <div key={i} className="h-2" />;
      }
      // Regular paragraph
      return (
        <p key={i} className="text-gray-300 text-sm leading-relaxed mb-1">
          {formatInline(line)}
        </p>
      );
    });
  }

  function formatInline(text: string) {
    // Bold **text**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
      }
      // Inline code `code`
      const codeParts = part.split(/(`[^`]+`)/g);
      if (codeParts.length === 1) return part;
      return codeParts.map((cp, j) => {
        if (cp.startsWith("`") && cp.endsWith("`")) {
          return <code key={j} className="bg-gray-700 text-cyan-300 px-1.5 py-0.5 rounded text-xs font-mono">{cp.slice(1, -1)}</code>;
        }
        return cp;
      });
    });
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link
            to="/"
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
          >
            ← Página Inicial
          </Link>
          <h1 className="text-xl font-bold text-white">Planos de Implementação</h1>
        </div>
      </header>

      {/* Grid de cards */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <p className="text-gray-400 text-sm mb-6">
          {PLANOS.length} {PLANOS.length === 1 ? "plano" : "planos"} registrados
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLANOS.map((plano) => {
            const cat = categoriaIcon[plano.categoria] || categoriaIcon.pagina;
            const Icon = cat.icon;
            return (
              <button
                key={plano.id}
                onClick={() => {
                  setModalPlano(plano);
                  setCopiado(false);
                }}
                className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 transition text-left w-full"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`${cat.color}`}>
                    <Icon size={24} />
                  </div>
                  <span className="text-xs font-mono text-gray-500 bg-gray-700 px-2 py-0.5 rounded">
                    {plano.id}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mb-2 line-clamp-2">
                  {plano.titulo}
                </h2>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {plano.resumo}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FileText size={14} />
                  <span>{plano.data}</span>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {/* Modal */}
      {modalPlano && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setModalPlano(null)}
        >
          {/* Backdrop fosco */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Conteúdo do modal */}
          <div
            className="relative bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do modal */}
            <div className="flex items-start justify-between p-6 border-b border-gray-700">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-gray-500 bg-gray-700 px-2 py-0.5 rounded">
                    {modalPlano.id}
                  </span>
                  <span className="text-xs text-gray-500">{modalPlano.data}</span>
                </div>
                <h2 className="text-xl font-bold text-white">
                  {modalPlano.titulo}
                </h2>
              </div>
              <button
                onClick={() => setModalPlano(null)}
                className="text-gray-400 hover:text-white p-1 flex-shrink-0"
              >
                <X size={24} />
              </button>
            </div>

            {/* Body do modal — scrollável */}
            <div className="flex-1 overflow-y-auto p-6">
              {renderConteudo(modalPlano.conteudo)}
            </div>

            {/* Footer do modal */}
            <div className="p-4 border-t border-gray-700 flex justify-end">
              <button
                onClick={() => handleCopiar(modalPlano.conteudo)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition text-sm font-semibold"
              >
                {copiado ? (
                  <>
                    <Check size={16} />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Clipboard size={16} />
                    Copiar texto
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
