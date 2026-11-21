export default function Recommendations({ books, user, onOpenBook, onOpenPreferences, onOpenAccount }) {
  const preferences = user?.preferences || [];
  const rankedBooks = [...books].sort((left, right) => {
    const leftMatch = preferences.includes(left.category) ? 1 : 0;
    const rightMatch = preferences.includes(right.category) ? 1 : 0;
    const rating = (book) => Number(String(book.rating).replace(",", ".")) || 0;
    return rightMatch - leftMatch || rating(right) - rating(left);
  });
  const recommendations = rankedBooks.slice(0, 3);

  return (
    <section className="my-7 rounded-3xl border border-[#e4e1d8] bg-[#fffefa] p-5 dark:border-slate-700 dark:bg-slate-900 sm:my-9 sm:p-7">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#b86f4f]">Curadoria Duraren</p><h2 className="mt-1 font-display text-2xl text-[#243d35] dark:text-emerald-100">{preferences.length ? `Feitos para você, ${user.name.split(" ")[0]}` : "Leituras que podem combinar"}</h2><p className="mt-1 text-xs text-slate-500">{preferences.length ? `Com base nos seus gêneros favoritos: ${preferences.join(", ")}.` : "Escolha seus gêneros favoritos para personalizar as recomendações."}</p></div>
        {user ? <button type="button" onClick={onOpenPreferences} className="rounded-full border border-[#dce8dd] px-4 py-2 text-xs font-semibold text-[#486556] hover:bg-[#f7f8f4] dark:border-slate-600 dark:text-emerald-100 dark:hover:bg-slate-800">Editar preferências</button> : <button type="button" onClick={onOpenAccount} className="rounded-full border border-[#dce8dd] px-4 py-2 text-xs font-semibold text-[#486556] hover:bg-[#f7f8f4] dark:border-slate-600 dark:text-emerald-100 dark:hover:bg-slate-800">Entrar para personalizar</button>}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">{recommendations.map((book) => <article key={book.id} className="flex items-center gap-3 rounded-2xl bg-[#f7f8f4] p-3 dark:bg-slate-800"><img src={book.cover} alt="" className="h-20 w-16 rounded-lg object-cover" /><div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-wider text-[#78917e]">{book.category}</p><button type="button" onClick={() => onOpenBook(book)} className="mt-1 line-clamp-2 text-left text-sm font-semibold leading-5 hover:text-[#486556]">{book.title}</button><p className="mt-1 text-[11px] text-slate-500">{book.author}</p></div></article>)}</div>
      {!preferences.length && user && <p className="mt-3 text-[11px] text-slate-500">Por enquanto, mostramos os títulos mais bem avaliados. Adicione preferências para refinar a curadoria.</p>}
    </section>
  );
}
