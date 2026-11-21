import { useState } from "react";

export default function AccountDialog({ onClose, onAuthenticate }) {
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      await onAuthenticate({
        mode,
        name: String(form.get("name") || ""),
        email: String(form.get("email") || ""),
        password: String(form.get("password") || ""),
      });
    } catch (submissionError) {
      setError(submissionError.message || "Não foi possível concluir o acesso.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <DialogFrame onClose={onClose} title={mode === "login" ? "Que bom ter você aqui." : "Crie sua conta Duraren."}>
      <div className="mb-5 grid grid-cols-2 rounded-full bg-[#f1f3ef] p-1 dark:bg-slate-700">
        <button type="button" onClick={() => { setMode("login"); setError(""); }} className={`rounded-full py-2 text-sm font-semibold ${mode === "login" ? "bg-white text-[#243d35] shadow-sm dark:bg-slate-800 dark:text-emerald-100" : "text-slate-500"}`}>Entrar</button>
        <button type="button" onClick={() => { setMode("register"); setError(""); }} className={`rounded-full py-2 text-sm font-semibold ${mode === "register" ? "bg-white text-[#243d35] shadow-sm dark:bg-slate-800 dark:text-emerald-100" : "text-slate-500"}`}>Criar conta</button>
      </div>
      <form onSubmit={submit} className="grid gap-4">
        {mode === "register" && <label className="grid gap-1.5 text-sm font-medium">Seu nome<input name="name" required minLength="2" autoComplete="name" placeholder="Como podemos chamar você?" className="rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-[#78917e] dark:border-slate-600 dark:bg-slate-800" /></label>}
        <label className="grid gap-1.5 text-sm font-medium">E-mail<input name="email" type="email" required autoComplete="email" placeholder="voce@email.com" className="rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-[#78917e] dark:border-slate-600 dark:bg-slate-800" /></label>
        <label className="grid gap-1.5 text-sm font-medium">Senha<input name="password" type="password" required minLength="8" autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="Pelo menos 8 caracteres" className="rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-[#78917e] dark:border-slate-600 dark:bg-slate-800" /></label>
        {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">{error}</p>}
        <button disabled={busy} className="mt-1 rounded-full bg-[#243d35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#35564a] disabled:opacity-60">{busy ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar conta"}</button>
        <p className="text-center text-xs leading-5 text-slate-500">Conta demonstrativa deste navegador. Para uso real, conecte um serviço de autenticação.</p>
      </form>
    </DialogFrame>
  );
}

export function PreferencesDialog({ initialPreferences = [], categories, onClose, onSave }) {
  const [selected, setSelected] = useState(initialPreferences);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const toggle = (category) => setSelected((current) => current.includes(category) ? current.filter((item) => item !== category) : [...current, category]);
  const save = async () => {
    setBusy(true);
    setError("");
    try { await onSave(selected); } catch (saveError) { setError(saveError.message || "Não foi possível salvar as preferências."); }
    finally { setBusy(false); }
  };
  return (
    <DialogFrame onClose={onClose} title="Que tipo de livro você gosta?">
      <p className="-mt-2 mb-5 text-sm leading-6 text-slate-500">Escolha seus gêneros favoritos. Vamos usar isso para destacar leituras que combinam com você.</p>
      <div className="mb-6 flex flex-wrap gap-2">{categories.map((category) => <button key={category} type="button" aria-pressed={selected.includes(category)} onClick={() => toggle(category)} className={`rounded-full border px-4 py-2 text-sm font-medium transition ${selected.includes(category) ? "border-[#345344] bg-[#345344] text-white dark:border-emerald-200 dark:bg-emerald-200 dark:text-slate-900" : "border-stone-200 bg-white text-slate-600 hover:border-[#78917e] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"}`}>{category}</button>)}</div>
      {error && <p role="alert" className="mb-3 text-sm text-rose-600">{error}</p>}
      <button type="button" disabled={busy} onClick={save} className="w-full rounded-full bg-[#243d35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#35564a] disabled:opacity-60">{busy ? "Salvando…" : "Salvar preferências"}</button>
    </DialogFrame>
  );
}

export function DialogFrame({ children, onClose, title }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" aria-label={title} className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-stone-200 bg-[#fffefa] p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:p-8"><div className="mb-5 flex items-start justify-between gap-4"><h2 className="font-display text-2xl text-[#243d35] dark:text-emerald-100">{title}</h2><button type="button" aria-label="Fechar" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border border-stone-200 text-xl text-slate-500 hover:bg-stone-50 dark:border-slate-600 dark:hover:bg-slate-800">×</button></div>{children}</section></div>;
}
