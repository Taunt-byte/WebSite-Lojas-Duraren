import { useState } from "react";
import { categories } from "../data/books";

export default function Header({
  query,
  onQueryChange,
  cartCount,
  onHome,
  onCommunity,
  onSelectGenre,
  darkMode,
  onToggleTheme,
  user,
  onOpenAccount,
  onOpenPreferences,
  onOpenRegisterBook,
  onLogout,
}) {
  const [genresOpen, setGenresOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const chooseGenre = (genre) => {
    onSelectGenre(genre);
    setGenresOpen(false);
  };

  return (
    <>
      <div className="bg-[#243d35] px-4 py-2 text-center text-xs font-medium tracking-wide text-white sm:text-sm">
        Frete grátis a partir de R$ 99 · Encontre sua próxima história favorita
      </div>
      <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-[#fbfaf7]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-5 px-4 py-4 sm:px-8">
          <a
            href="/"
            onClick={(event) => {
              event.preventDefault();
              onHome();
            }}
            className="flex shrink-0 items-center gap-2 font-display text-2xl tracking-tight text-[#243d35] sm:text-3xl"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#dce8dd] font-sans text-lg">
              ✳
            </span>{" "}
            Duraren
          </a>
          <nav
            className="hidden items-center gap-7 text-sm font-medium text-slate-600 lg:flex"
            aria-label="Navegação principal"
          >
            <GenreMenu
              open={genresOpen}
              onToggle={() => setGenresOpen((isOpen) => !isOpen)}
              onChoose={chooseGenre}
            />
            <a className="hover:text-[#243d35]" href="#recomendacoes">
              Recomendações
            </a>
            <button
              type="button"
              onClick={onCommunity}
              className="hover:text-[#243d35]"
            >
              Comunidade
            </button>
          </nav>
          <SearchInput
            query={query}
            onQueryChange={onQueryChange}
            className="ml-auto hidden max-w-md flex-1 md:flex"
          />
          <button
            className="relative ml-auto rounded-full p-2.5 text-xl hover:bg-stone-100 md:ml-0"
            aria-label={`Carrinho com ${cartCount} itens`}
            onClick={() =>
              window.alert(
                `Seu carrinho tem ${cartCount} ${cartCount === 1 ? "livro" : "livros"}.`,
              )
            }
          >
            ♧
            {cartCount > 0 && (
              <span className="absolute right-0 top-0 grid h-5 w-5 place-items-center rounded-full bg-[#d7825b] text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={`Ativar tema ${darkMode ? "claro" : "escuro"}`}
            aria-pressed={darkMode}
            title={`Tema ${darkMode ? "escuro" : "claro"}`}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-stone-200 bg-white text-lg text-[#243d35] transition hover:bg-[#e8eee5]"
          >
            {darkMode ? "☀" : "☾"}
          </button>
          <div className="relative shrink-0">
            <button type="button" onClick={() => user ? setAccountMenuOpen((open) => !open) : onOpenAccount()} aria-label={user ? `Conta de ${user.name}` : "Entrar ou criar conta"} aria-expanded={user ? accountMenuOpen : undefined} className="flex h-10 items-center gap-2 rounded-full border border-stone-200 bg-white px-3 text-xs font-semibold text-[#486556] hover:bg-[#e8eee5] dark:border-slate-600 dark:bg-slate-800 dark:text-emerald-100">{user ? <><span className="grid h-6 w-6 place-items-center rounded-full bg-[#dce8dd] text-[10px] text-[#243d35]">{user.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</span><span className="hidden xl:inline">{user.name.split(" ")[0]}</span></> : <><span aria-hidden="true">♙</span><span className="hidden sm:inline">Entrar</span></>}</button>
            {user && accountMenuOpen && <div className="absolute right-0 top-full z-40 mt-2 w-52 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900"><p className="px-3 py-2 text-xs text-slate-500">Olá, {user.name.split(" ")[0]}</p><button type="button" onClick={() => { setAccountMenuOpen(false); onOpenPreferences(); }} className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-stone-100 dark:hover:bg-slate-800">Preferências de leitura</button><button type="button" onClick={() => { setAccountMenuOpen(false); onOpenRegisterBook(); }} className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-stone-100 dark:hover:bg-slate-800">Cadastrar livro</button><button type="button" onClick={() => { setAccountMenuOpen(false); onLogout(); }} className="block w-full rounded-xl px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40">Sair da conta</button></div>}
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 pb-3 md:hidden">
          <SearchInput
            query={query}
            onQueryChange={onQueryChange}
            className="flex-1"
          />
          <button
            type="button"
            onClick={onCommunity}
            className="shrink-0 rounded-full border border-stone-200 bg-white px-3 py-2.5 text-xs font-semibold text-[#486556]"
          >
            Comunidade
          </button>
        </div>
        <div className="relative border-t border-stone-200/70 px-4 py-2 lg:hidden">
          <GenreMenu
            open={genresOpen}
            onToggle={() => setGenresOpen((isOpen) => !isOpen)}
            onChoose={chooseGenre}
            mobile
          />
        </div>
      </header>
    </>
  );
}

function GenreMenu({ open, onToggle, onChoose, mobile = false }) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={mobile ? "genre-menu-mobile" : "genre-menu"}
        className={`flex items-center gap-2 rounded-lg py-1.5 font-medium text-slate-600 transition hover:text-[#243d35] ${mobile ? "px-2 text-sm" : ""}`}
      >
        Livros{" "}
        <span aria-hidden="true" className="text-xs">
          {open ? "⌃" : "⌄"}
        </span>
      </button>
      {open && (
        <div
          id={mobile ? "genre-menu-mobile" : "genre-menu"}
          className="absolute left-0 top-full z-30 mt-2 min-w-56 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl shadow-slate-900/10"
        >
          <p className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">
            Explore por gênero
          </p>
          {categories.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => onChoose(genre)}
              className="block w-full rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-[#e8eee5] hover:text-[#243d35]"
            >
              {genre === "Todos" ? "Todos os livros" : genre}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SearchInput({ query, onQueryChange, className = "" }) {
  return (
    <label
      className={`flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2.5 text-slate-400 ${className}`}
    >
      <span aria-hidden="true">⌕</span>
      <input
        aria-label="Buscar livros"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Título, autor ou uma boa história..."
        className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
      />
    </label>
  );
}
