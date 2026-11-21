export default function Hero() {
  return (
    <section className="relative my-7 overflow-hidden rounded-[2rem] bg-[#e8eee5] sm:my-10">
      <div className="relative z-10 max-w-2xl px-7 py-12 sm:px-14 sm:py-16 lg:py-20">
        <span className="mb-5 inline-flex rounded-full bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[.16em] text-[#527061]">
          Um lugar para quem ama ler
        </span>
        <h1 className="max-w-xl text-4xl font-semibold leading-[1.08] tracking-tight text-[#243d35] sm:text-6xl">
          Cada livro abre uma{" "}
          <span className="font-serif italic text-[#c67655]">nova janela.</span>
        </h1>
        <p className="mt-5 max-w-md text-base leading-7 text-slate-600 sm:text-lg">
          Descubra histórias escolhidas por leitores como você. Sua próxima
          leitura começa aqui.
        </p>
        <a
          href="#livros"
          className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#243d35] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#35564a]"
        >
          Explorar livros <span aria-hidden="true">→</span>
        </a>
      </div>
      <div
        className="pointer-events-none absolute -right-8 bottom-0 hidden h-full w-[48%] items-end justify-center gap-4 overflow-hidden sm:flex"
        aria-hidden="true"
      >
        <div className="book-cover mb-[-25px] h-[290px] w-[185px] rotate-[-11deg] rounded-t-lg bg-[#cb8c71] p-5 text-white shadow-2xl">
          <span className="text-[9px] uppercase tracking-[.2em]">
            uma história para
          </span>
          <strong className="mt-12 block font-serif text-3xl leading-none">
            chamar
            <br />
            de sua
          </strong>
          <span className="mt-12 block text-xs">entrelinhas</span>
        </div>
        <div className="book-cover mb-[-35px] h-[345px] w-[220px] rotate-[5deg] rounded-t-lg bg-[#647c67] p-6 text-[#faf4e6] shadow-2xl">
          <span className="text-[9px] uppercase tracking-[.2em]">
            leituras que ficam
          </span>
          <strong className="mt-16 block font-serif text-4xl leading-[.95]">
            O jardim
            <br />
            secreto
          </strong>
          <span className="mt-16 block text-xs">edição especial</span>
        </div>
        <div className="book-cover mb-[-20px] h-[265px] w-[170px] rotate-[14deg] rounded-t-lg bg-[#dfc8a5] p-5 text-[#503f37] shadow-2xl">
          <span className="text-[9px] uppercase tracking-[.2em]">
            para ler devagar
          </span>
          <strong className="mt-12 block font-serif text-3xl leading-none">
            dias de
            <br />
            sol
          </strong>
        </div>
      </div>
      <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/40" />
    </section>
  );
}
