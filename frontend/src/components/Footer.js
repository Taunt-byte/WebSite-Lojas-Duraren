export default function Footer() {
  return (
    <footer className="mt-8 border-t border-stone-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-7 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span className="font-display text-xl text-[#243d35]">✳ Duraren</span>
        <span>Feito por leitores, para leitores · Projeto acadêmico</span>
        <a href="#inicio" className="hover:text-[#243d35]">
          Voltar ao topo ↑
        </a>
      </div>
    </footer>
  );
}
