import { useState } from "react";
import { categories } from "../data/books";
import { DialogFrame } from "./AccountDialog";

export default function BookRegistrationDialog({ onClose, onSave }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const price = Number(form.get("price"));
    const oldPrice = Number(form.get("oldPrice")) || price;
    try {
      await onSave({
      id: Date.now(),
      title: String(form.get("title")).trim(),
      author: String(form.get("author")).trim(),
      category: String(form.get("category")),
      price,
      oldPrice,
      rating: "Novo",
      reviews: 0,
      cover: String(form.get("cover")).trim() || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=85",
      tone: "bg-amber-100",
      description: String(form.get("description")).trim(),
      pages: Number(form.get("pages")) || 0,
      comments: [],
      });
    } catch (saveError) {
      setError(saveError.message || "Não foi possível cadastrar o livro.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <DialogFrame onClose={onClose} title="Cadastrar livro">
      <p className="-mt-2 mb-5 text-sm leading-6 text-slate-500">Adicione um título ao catálogo Duraren.</p>
      <form onSubmit={submit} className="grid gap-3.5">
        <label className="grid gap-1 text-sm font-medium">Título<input name="title" required maxLength="100" placeholder="Nome do livro" className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#78917e] dark:border-slate-600 dark:bg-slate-800" /></label>
        <label className="grid gap-1 text-sm font-medium">Autor<input name="author" required maxLength="80" placeholder="Nome do autor" className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#78917e] dark:border-slate-600 dark:bg-slate-800" /></label>
        <label className="grid gap-1 text-sm font-medium">Gênero<select name="category" className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#78917e] dark:border-slate-600 dark:bg-slate-800">{categories.filter((category) => category !== "Todos").map((category) => <option key={category}>{category}</option>)}</select></label>
        <div className="grid grid-cols-2 gap-3"><label className="grid gap-1 text-sm font-medium">Preço (R$)<input name="price" type="number" required min="0.01" step="0.01" placeholder="39,90" className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#78917e] dark:border-slate-600 dark:bg-slate-800" /></label><label className="grid gap-1 text-sm font-medium">Preço anterior<input name="oldPrice" type="number" min="0" step="0.01" placeholder="Opcional" className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#78917e] dark:border-slate-600 dark:bg-slate-800" /></label></div>
        <label className="grid gap-1 text-sm font-medium">Páginas<input name="pages" type="number" min="1" placeholder="240" className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#78917e] dark:border-slate-600 dark:bg-slate-800" /></label>
        <label className="grid gap-1 text-sm font-medium">Imagem da capa (URL)<input name="cover" type="url" placeholder="Opcional" className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#78917e] dark:border-slate-600 dark:bg-slate-800" /></label>
        <label className="grid gap-1 text-sm font-medium">Descrição<textarea name="description" required maxLength="900" rows="3" placeholder="Apresente o livro aos leitores" className="resize-y rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#78917e] dark:border-slate-600 dark:bg-slate-800" /></label>
        {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
        <button disabled={busy} className="mt-1 rounded-full bg-[#243d35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#35564a] disabled:opacity-60">{busy ? "Cadastrando…" : "Adicionar ao catálogo"}</button>
      </form>
    </DialogFrame>
  );
}
