import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../utils/api";

const formatPrice = (price) => price.toFixed(2).replace(".", ",");

export default function BookDetails({ book, onBack, onAddToCart, onAddReview, user, onRequireAccount }) {
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState("5");
  const [reviewFilter, setReviewFilter] = useState("all");
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const query = reviewFilter === "all" ? "" : `?rating=${reviewFilter}`;
    apiRequest(`/books/${book.id}/reviews${query}`)
      .then(({ comments }) => { if (!cancelled) { setReviews(comments); setReviewError(""); } })
      .catch((error) => { if (!cancelled) setReviewError(error.message); });
    return () => { cancelled = true; };
  }, [book.id, reviewFilter]);

  const filteredReviews = useMemo(() => reviewFilter === "all"
    ? reviews
    : reviews.filter((review) => String(review.rating || 5) === reviewFilter), [reviews, reviewFilter]);

  const addReview = async (event) => {
    event.preventDefault();
    const text = reviewText.trim();
    if (!text) return;
    if (!user) { onRequireAccount(); return; }
    setReviewError("");
    try {
      const savedReview = await onAddReview({ text, rating: Number(reviewRating) });
      setReviews((currentReviews) => [savedReview, ...currentReviews]);
      setReviewText("");
      setReviewRating("5");
    } catch (error) {
      setReviewError(error.message);
    }
  };

  return (
    <div className="py-7 sm:py-10">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#486556] hover:text-[#243d35]"
      >
        ← Voltar para os livros
      </button>
      <section className="grid gap-8 rounded-3xl border border-stone-200/80 bg-white p-5 sm:grid-cols-[minmax(240px,.8fr)_1.2fr] sm:gap-12 sm:p-10">
        <div className={`overflow-hidden rounded-2xl ${book.tone}`}>
          <img
            src={book.cover}
            alt={`Capa ilustrativa para ${book.title}`}
            className="h-full max-h-[520px] min-h-[300px] w-full object-cover"
          />
        </div>
        <div className="py-1 sm:py-4">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#c67655]">
            {book.category} · Livro impresso
          </p>
          <h1 className="mt-3 font-display text-3xl leading-tight text-[#243d35] sm:text-5xl">
            {book.title}
          </h1>
          <p className="mt-3 text-lg text-slate-500">
            por{" "}
            <span className="font-medium text-slate-700">{book.author}</span>
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-amber-500">★★★★★</span>
            <strong>{book.rating}</strong>
            <a
              href="#avaliacoes"
              className="text-slate-500 underline underline-offset-2"
            >
              ({book.reviews} avaliações)
            </a>
          </div>
          <p className="mt-6 text-sm leading-7 text-slate-600">
            {book.description}
          </p>
          <div className="mt-7 rounded-2xl bg-[#f7f8f4] p-5">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-[#243d35]">
                R$ {formatPrice(book.price)}
              </span>
              {book.oldPrice > book.price && <span className="text-sm text-slate-400 line-through">R$ {formatPrice(book.oldPrice)}</span>}
              <span className="text-xs font-semibold text-[#527061]">
                no Pix
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              ou 3x de R$ {formatPrice(book.price / 3)} sem juros
            </p>
            <button
              onClick={() => onAddToCart(book)}
              className="mt-5 w-full rounded-full bg-[#243d35] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#35564a] sm:w-auto"
            >
              Adicionar ao carrinho
            </button>
          </div>
          <div className="mt-5 flex gap-3 rounded-xl border border-stone-200 p-4">
            <span className="text-xl" aria-hidden="true">
              ▣
            </span>
            <div>
              <h2 className="text-sm font-semibold">
                Entrega para todo o Brasil
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Frete grátis em compras a partir de R$ 99. O prazo e o valor
                variam conforme o CEP.
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Detalhes: brochura{book.pages ? ` · ${book.pages} páginas` : ""} · Edição em português
          </p>
        </div>
      </section>
      <section
        id="avaliacoes"
        className="mt-8 grid gap-8 sm:grid-cols-[.8fr_1.2fr]"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#c67655]">
            Opiniões de leitores
          </p>
          <h2 className="mt-2 text-2xl font-semibold">O que estão dizendo</h2>
          <form onSubmit={addReview} className="mt-5">
            {!user && <button type="button" onClick={onRequireAccount} className="mb-3 rounded-full border border-[#dce8dd] px-4 py-2 text-xs font-semibold text-[#486556]">Entre para avaliar este livro</button>}
            <label htmlFor="review" className="sr-only">
              Escreva uma avaliação
            </label>
            <textarea
              id="review"
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              placeholder="Conte o que achou deste livro..."
              rows="3"
              className="w-full resize-none rounded-2xl border border-stone-200 bg-white p-4 text-sm outline-none focus:border-[#78917e] focus:ring-2 focus:ring-[#78917e]/20"
            />
            <label className="mt-3 flex items-center gap-3 text-sm font-medium">Sua nota
              <select value={reviewRating} onChange={(event) => setReviewRating(event.target.value)} className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800">{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} estrelas</option>)}</select>
            </label>
            <button className="mt-3 rounded-full bg-[#243d35] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#35564a]">
              {user ? "Publicar avaliação" : "Entrar para publicar"}
            </button>
            {reviewError && <p role="alert" className="mt-3 text-xs text-rose-600">{reviewError}</p>}
          </form>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3"><p className="text-xs text-slate-500">{filteredReviews.length} {filteredReviews.length === 1 ? "avaliação" : "avaliações"}</p><label className="flex items-center gap-2 text-xs text-slate-500">Filtrar<select value={reviewFilter} onChange={(event) => setReviewFilter(event.target.value)} className="rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-xs dark:border-slate-600 dark:bg-slate-800"><option value="all">Todas as notas</option>{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} estrelas</option>)}</select></label></div>
          {filteredReviews.map((review, index) => (
            <article
              key={`${review.name}-${index}`}
              className="rounded-2xl border border-stone-200/80 bg-white p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold">{review.name}</h3>
                <span
                  className="text-sm tracking-wide text-amber-500"
                  aria-label={`${review.rating || 5} de 5 estrelas`}
                >
                  {"★".repeat(review.rating || 5)}{"☆".repeat(5 - (review.rating || 5))}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {review.text}
              </p>
            </article>
          ))}
          {filteredReviews.length === 0 && (
            <p className="rounded-2xl border border-dashed border-stone-300 p-6 text-sm text-slate-500">
              {reviews.length === 0 ? "Seja o primeiro a avaliar este livro." : "Não há avaliações com essa nota."}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
