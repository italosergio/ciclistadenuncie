import type { Route } from "./+types/blog";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Blog - Ciclista Denuncie" },
    { name: "description", content: "Blog do Ciclista Denuncie — mobilidade urbana, ativismo cicloviário e segurança no trânsito." },
  ];
}

export default function Blog() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-4">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-red-600 dark:text-red-500">
          🚲 Blog
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
          Em breve, publicações sobre mobilidade urbana, ativismo cicloviário e segurança no trânsito.
        </p>
        <a
          href="/"
          className="inline-block text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline text-xs md:text-sm"
        >
          Voltar ao início
        </a>
      </div>
    </div>
  );
}
