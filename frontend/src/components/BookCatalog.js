import { categories } from "../data/books";

export default function BookCatalog({
  books,
  activeCategory,
  onCategoryChange,
  favorites,
  onToggleFavorite,
  onAddToCart,
  onOpenBook,
  title = "Livros que estão encantando",
}) {
  return (
    <section id="recomendacoes" className="py-9 sm:py-12">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#c67655]">
            Escolhas da comunidade
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h2>
        </div>
        <a
          href="#livros"
          className="hidden text-sm font-semibold text-[#486556] sm:block"
        >
          Ver todos →
        </a>
      </div>
      <div
        className="mb-6 flex gap-2 overflow-x-auto pb-1"
        role="group"
        aria-label="Filtrar por categoria"
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            aria-pressed={activeCategory === category}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${activeCategory === category ? "bg-[#243d35] text-white" : "border border-stone-200 bg-white text-slate-600 hover:border-[#a2b5a5]"}`}
          >
            {category}
          </button>
        ))}
      </div>
      <div
        id="livros"
        className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
      >
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            isFavorite={favorites.includes(book.id)}
            onToggleFavorite={() => onToggleFavorite(book.id)}
            onAddToCart={() => onAddToCart(book)}
            onOpen={() => onOpenBook(book)}
          />
        ))}
        {books.length === 0 && (
          <p className="col-span-full rounded-2xl border border-dashed border-stone-300 p-8 text-center text-slate-500">
            Não encontramos livros com esse termo. Tente outro título ou autor.
          </p>
        )}
      </div>
    </section>
  );
}

function BookCard({ book, isFavorite, onToggleFavorite, onAddToCart, onOpen }) {
  const formatPrice = (price) => price.toFixed(2).replace(".", ",");
  return (
    <article className="group overflow-hidden rounded-2xl border border-stone-200/80 bg-white transition hover:-translate-y-1 hover:shadow-lg hover:shadow-[#243d35]/[.07]">
      <div className={`relative aspect-[4/3] overflow-hidden ${book.tone}`}>
        <button
          onClick={onOpen}
          aria-label={`Ver detalhes de ${book.title}`}
          className="absolute inset-0 h-full w-full cursor-pointer"
        >
          <img
            src={book.cover}
            alt={`Capa ilustrativa para ${book.title}`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </button>
        {book.badge && (
          <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-bold tracking-wider text-[#527061]">
            {book.badge}
          </span>
        )}
        <button
          aria-label={
            isFavorite
              ? `Remover ${book.title} dos favoritos`
              : `Favoritar ${book.title}`
          }
          aria-pressed={isFavorite}
          onClick={onToggleFavorite}
          className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-lg ${isFavorite ? "text-rose-500" : "text-slate-400 hover:text-rose-500"}`}
        >
          {isFavorite ? "♥" : "♡"}
        </button>
      </div>
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
          ★ <span className="text-slate-700">{book.rating}</span>
          <span className="font-normal text-slate-400">({book.reviews})</span>
        </div>
        <button
          onClick={onOpen}
          className="mt-2 line-clamp-1 text-left text-sm font-semibold hover:text-[#486556] sm:text-base"
        >
          {book.title}
        </button>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">{book.author}</p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <div>
            <span className="text-base font-bold text-[#243d35]">
              R$ {formatPrice(book.price)}
            </span>
            {book.oldPrice > book.price && <span className="ml-1.5 text-[10px] text-slate-400 line-through">R$ {formatPrice(book.oldPrice)}</span>}
          </div>
          <button
            onClick={onAddToCart}
            aria-label={`Adicionar ${book.title} ao carrinho`}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e8eee5] text-lg text-[#243d35] transition hover:bg-[#243d35] hover:text-white"
          >
            ＋
          </button>
        </div>
        <button
          onClick={onOpen}
          className="mt-4 w-full rounded-full border border-[#dce8dd] py-2 text-xs font-semibold text-[#486556] transition hover:bg-[#f7f8f4]"
        >
          Ver detalhes
        </button>
      </div>
    </article>
  );
}
