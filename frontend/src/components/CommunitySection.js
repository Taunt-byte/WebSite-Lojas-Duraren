export default function CommunitySection({
  comments,
  comment,
  onCommentChange,
  onSubmitComment,
}) {
  return (
    <>
      <section className="my-8 grid overflow-hidden rounded-3xl bg-[#f1e7dc] sm:grid-cols-[1fr_auto]">
        <div className="p-7 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#c67655]">
            Leitura compartilhada
          </p>
          <h2 className="mt-3 max-w-lg text-2xl font-semibold leading-tight text-[#433c35] sm:text-3xl">
            Uma boa indicação merece ser passada adiante.
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">
            Conte o que você está lendo, avalie seus favoritos e ajude outros
            leitores a encontrar sua próxima história.
          </p>
          <a
            href="#comunidade"
            className="mt-5 inline-block text-sm font-semibold text-[#486556]"
          >
            Participar da comunidade →
          </a>
        </div>
        <div
          className="hidden items-center pr-12 text-7xl sm:flex"
          aria-hidden="true"
        >
          📚
        </div>
      </section>
      <section
        id="comunidade"
        className="grid gap-8 py-10 sm:grid-cols-[.8fr_1.2fr] sm:py-14"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#c67655]">
            Vozes leitoras
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            A conversa continua
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
            Compartilhe uma impressão ou diga o que gostaria de ler por aqui.
          </p>
          <form onSubmit={onSubmitComment} className="mt-5">
            <label htmlFor="comment" className="sr-only">
              Escreva um comentário
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(event) => onCommentChange(event.target.value)}
              placeholder="Escreva seu comentário..."
              rows="3"
              className="w-full resize-none rounded-2xl border border-stone-200 bg-white p-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#78917e] focus:ring-2 focus:ring-[#78917e]/20"
            />
            <button className="mt-3 rounded-full bg-[#243d35] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#35564a]">
              Publicar comentário
            </button>
          </form>
        </div>
        <div className="space-y-3">
          {comments.map((item) => (
            <article
              key={item.id}
              className="flex gap-4 rounded-2xl border border-stone-200/80 bg-white p-5"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e8eee5] text-xs font-bold text-[#486556]">
                {item.initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{item.name}</h3>
                  <span className="text-amber-500" aria-label="5 de 5 estrelas">
                    ★★★★★
                  </span>
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {item.text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
