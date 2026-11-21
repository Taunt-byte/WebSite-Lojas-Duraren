import { useEffect, useMemo, useState } from "react";
import "./CommunityForum.css";
import { apiRequest } from "../utils/api";

const communities = {
  middleearth: {
    name: "Terra Média",
    handle: "u/TerraMedia",
    kind: "Saga · 3 volumes",
    icon: "TM",
    members: "2.841",
    description:
      "Das pequenas colinas do Condado às sombras de Mordor. Uma conversa de cada vez, sem spoilers fora de hora.",
    volumes: [
      { id: "book1", label: "A Sociedade do Anel" },
      { id: "book2", label: "As Duas Torres" },
      { id: "book3", label: "O Retorno do Rei" },
      { id: "saga", label: "Saga Completa" },
    ],
  },
  dune: {
    name: "Universo Duna",
    handle: "u/UniversoDuna",
    kind: "Saga · 3 volumes",
    icon: "DU",
    members: "1.673",
    description:
      "Política, ecologia e profecia nas areias de Arrakis. Escolha seu ponto de leitura antes de entrar na conversa.",
    volumes: [
      { id: "dune1", label: "Duna" },
      { id: "dune2", label: "Messias de Duna" },
      { id: "dune3", label: "Filhos de Duna" },
      { id: "saga", label: "Saga Completa" },
    ],
  },
  orwell: {
    name: "1984",
    handle: "u/1984",
    kind: "Livro · George Orwell",
    icon: "84",
    members: "926",
    description:
      "Leituras, perguntas e interpretações sobre o romance de George Orwell. Os spoilers ficam ocultos até você decidir revelá-los.",
    volumes: [{ id: "whole", label: "Livro completo" }],
  },
};

const initialPosts = [
  {
    id: 1,
    community: "middleearth",
    volume: "book1",
    title: "A hospitalidade de Tom Bombadil muda o ritmo da jornada?",
    category: "Análise",
    author: "Lia das Letras",
    initials: "LL",
    time: "há 18 min",
    score: 34,
    body: "A chegada à casa de Tom parece suspender a urgência da história. Para mim, esse intervalo nos apresenta uma forma diferente de poder, que não nasce do desejo de possuir ou controlar. Como vocês leram esse trecho?",
    spoiler: false,
    comments: [
      {
        author: "M. Tavares",
        text: "Também senti que a casa funciona como um contraponto ao Um Anel: Tom convive com ele sem querer dominá-lo.",
        spoiler: false,
      },
      {
        author: "Nina",
        text: "A canção dele dá uma sensação de liberdade que não volta a aparecer do mesmo jeito.",
        spoiler: false,
      },
    ],
  },
  {
    id: 2,
    community: "middleearth",
    volume: "book1",
    title: "Por que o Condado parece tão distante do resto do mundo?",
    category: "Teoria",
    author: "PippinReader",
    initials: "PR",
    time: "há 1 h",
    score: 21,
    body: "Tenho pensado no contraste entre a vida cotidiana do Condado e os perigos que cercam a Terra Média. Será que esse isolamento é só geográfico ou também uma escolha narrativa para fazer a mudança pesar mais?",
    spoiler: false,
    comments: [
      {
        author: "Elanor",
        text: "A escala pequena faz a coragem dos hobbits parecer ainda maior.",
        spoiler: false,
      },
    ],
  },
  {
    id: 3,
    community: "middleearth",
    volume: "book2",
    title: "A floresta como personagem em As Duas Torres",
    category: "Análise",
    author: "RaizAntiga",
    initials: "RA",
    time: "há 5 h",
    score: 42,
    body: "A relação dos Ents com a floresta me parece uma das maneiras mais bonitas de falar sobre responsabilidade coletiva. A decisão de agir só acontece quando a perda deixa de ser abstrata.",
    spoiler: true,
    comments: [
      {
        author: "Mellon",
        text: "O ritmo lento da assembleia dos Ents combina com a ideia de que decidir também exige escutar.",
        spoiler: true,
      },
    ],
  },
  {
    id: 4,
    community: "middleearth",
    volume: "book3",
    title: "Resenha sem spoilers: o encerramento da trilogia",
    category: "Resenha",
    author: "Caio L.",
    initials: "CL",
    time: "ontem",
    score: 67,
    body: "Terminei o último volume e ainda estou pensando no que significa voltar para casa depois de uma jornada dessas. A trilogia consegue ser grandiosa sem perder o cuidado com os personagens pequenos.",
    spoiler: false,
    comments: [
      {
        author: "Marta",
        text: "Essa sensação de retorno ficou comigo por dias.",
        spoiler: false,
      },
    ],
  },
  {
    id: 5,
    community: "middleearth",
    volume: "saga",
    title: "Qual tema atravessa os três livros com mais força?",
    category: "Teoria",
    author: "Beren & Lúthien",
    initials: "BL",
    time: "há 3 h",
    score: 53,
    body: "Para quem terminou a trilogia: tenho dúvidas se o tema central é a renúncia, a amizade ou a passagem do tempo. Talvez seja justamente a combinação dos três. Qual leitura faz mais sentido para vocês?",
    spoiler: true,
    comments: [
      {
        author: "FrodoBag",
        text: "A passagem do tempo aparece até nos momentos de vitória. Por isso o final tem uma melancolia tão particular.",
        spoiler: true,
      },
    ],
  },
  {
    id: 6,
    community: "dune",
    volume: "dune1",
    title: "A ecologia de Arrakis é quase uma personagem",
    category: "Análise",
    author: "AreiaAzul",
    initials: "AA",
    time: "há 26 min",
    score: 39,
    body: "A descrição da água e dos ciclos do deserto transforma cada decisão em algo material. O cenário não fica ao fundo: ele altera política, costumes e até a linguagem dos personagens.",
    spoiler: false,
    comments: [
      {
        author: "Fremen de Estante",
        text: "Concordo. O apêndice ecológico também amplia muito a leitura.",
        spoiler: false,
      },
    ],
  },
  {
    id: 7,
    community: "dune",
    volume: "dune1",
    title: "Dúvida sobre as visões de Paul",
    category: "Dúvida",
    author: "João P.",
    initials: "JP",
    time: "há 3 h",
    score: 12,
    body: "Estou no começo do livro e queria entender como vocês interpretam as visões: elas parecem previsões fechadas ou possibilidades que ainda podem mudar?",
    spoiler: false,
    comments: [],
  },
  {
    id: 8,
    community: "dune",
    volume: "dune2",
    title: "A solidão de governar em Messias de Duna",
    category: "Análise",
    author: "SietchReader",
    initials: "SR",
    time: "ontem",
    score: 28,
    body: "O livro parece interessado no preço de se tornar um símbolo. Como a história conversa com as expectativas que o primeiro volume cria?",
    spoiler: true,
    comments: [
      {
        author: "Chani S.",
        text: "Para mim, o conflito está entre a pessoa e a imagem pública que já não consegue controlar.",
        spoiler: true,
      },
    ],
  },
  {
    id: 9,
    community: "dune",
    volume: "saga",
    title: "O que a saga diz sobre profecia e escolha?",
    category: "Teoria",
    author: "Duncan Idaho fã",
    initials: "DI",
    time: "há 6 h",
    score: 46,
    body: "Depois de ler os três volumes, vocês acham que a saga trata a profecia como destino ou como ferramenta política? Queria comparar interpretações.",
    spoiler: true,
    comments: [],
  },
  {
    id: 10,
    community: "orwell",
    volume: "whole",
    title: "A linguagem reduzida é o instrumento de controle mais assustador?",
    category: "Análise",
    author: "Clara Martins",
    initials: "CM",
    time: "há 42 min",
    score: 31,
    body: "A ideia de que palavras podem desaparecer e, com elas, certas formas de pensamento continua muito atual. O que mais chamou sua atenção na construção da Novafala?",
    spoiler: false,
    comments: [
      {
        author: "Leitor anônimo",
        text: "O apêndice sobre a gramática da Novafala parece quase um segundo livro.",
        spoiler: false,
      },
    ],
  },
  {
    id: 11,
    community: "orwell",
    volume: "whole",
    title: "O desconforto como escolha narrativa",
    category: "Resenha",
    author: "R. Azevedo",
    initials: "RA",
    time: "há 4 h",
    score: 24,
    body: "A leitura é desconfortável de propósito, mas isso não a torna menos envolvente. Como vocês equilibraram o peso do livro com a vontade de continuar?",
    spoiler: true,
    comments: [
      {
        author: "Sofia",
        text: "O final me deixou em silêncio por um tempo. É uma escolha difícil, mas coerente com a proposta.",
        spoiler: true,
      },
    ],
  },
];

function Spoiler({ children, hidden }) {
  const [revealed, setRevealed] = useState(!hidden);
  if (!hidden) return <div className="forum-copy">{children}</div>;
  return (
    <div className={`forum-spoiler ${revealed ? "revealed" : ""}`}>
      <div className="forum-copy">{children}</div>
      {!revealed && (
        <button
          type="button"
          className="forum-reveal"
          onClick={() => setRevealed(true)}
        >
          Revelar spoiler
        </button>
      )}
    </div>
  );
}

function CommunityForum({ user, onRequireAccount }) {
  const [communityData, setCommunityData] = useState(communities);
  const [communityId, setCommunityId] = useState("middleearth");
  const [volumeId, setVolumeId] = useState("book1");
  const [posts, setPosts] = useState(initialPosts);
  const [expandedPost, setExpandedPost] = useState(null);
  const [votes, setVotes] = useState({});
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");
  const [isComposerOpen, setComposerOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [apiError, setApiError] = useState("");
  const community = communityData[communityId] || communities[communityId];
  const volumeName = (id) =>
    community.volumes.find((volume) => volume.id === id)?.label || "Livro";

  useEffect(() => {
    let cancelled = false;
    apiRequest("/communities")
      .then(({ communities: loaded }) => {
        if (cancelled) return;
        const next = Object.fromEntries(loaded.map((item) => [item.slug, item]));
        setCommunityData(next);
        if (!next[communityId]) setCommunityId(loaded[0]?.slug || "middleearth");
      })
      .catch((error) => { if (!cancelled) setApiError(error.message); });
    return () => { cancelled = true; };
  }, [communityId]);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ volume: volumeId, sort });
    if (query.trim()) params.set("search", query.trim());
    apiRequest(`/communities/${communityId}/posts?${params.toString()}`)
      .then(({ posts: loaded }) => {
        if (cancelled) return;
        setPosts(loaded.map((post) => ({ ...post, comments: [], commentsLoaded: false })));
        setVotes(Object.fromEntries(loaded.filter((post) => post.userVote).map((post) => [post.id, post.userVote])));
        setApiError("");
      })
      .catch((error) => { if (!cancelled) setApiError(error.message); });
    return () => { cancelled = true; };
  }, [communityId, volumeId, query, sort, user]);

  const visiblePosts = useMemo(() => {
    let result = posts.filter(
        (post) => post.community === communityId && (volumeId === "saga" || post.volume === volumeId),
    );
    const term = query.trim().toLocaleLowerCase("pt-BR");
    if (term)
      result = result.filter((post) =>
        `${post.title} ${post.body} ${post.author} ${post.category}`
          .toLocaleLowerCase("pt-BR")
          .includes(term),
      );
    if (sort === "popular")
      result = [...result].sort((a, b) => b.score - a.score);
    else if (sort === "commented")
      result = [...result].sort(
        (a, b) => (b.commentsCount ?? b.comments.length) - (a.commentsCount ?? a.comments.length),
      );
    else result = [...result].sort((a, b) => b.id - a.id);
    return result;
  }, [posts, communityId, volumeId, query, sort]);

  const chooseCommunity = (id) => {
    setCommunityId(id);
    setVolumeId((communityData[id] || communities[id]).volumes[0].id);
    setExpandedPost(null);
  };

  const toggleVote = async (postId, value) => {
    if (!user) { onRequireAccount(); return; }
    const nextVote = votes[postId] === value ? 0 : value;
    try {
      const result = await apiRequest(`/forum/posts/${postId}/vote`, { method: "POST", body: { value: nextVote } });
      setVotes((current) => ({ ...current, [postId]: result.userVote }));
      setPosts((current) => current.map((post) => post.id === postId ? { ...post, score: result.score } : post));
    } catch (error) { setToast(error.message); window.setTimeout(() => setToast(""), 2400); }
  };

  const toggleExpanded = async (post) => {
    if (expandedPost === post.id) { setExpandedPost(null); return; }
    setExpandedPost(post.id);
    if (post.commentsLoaded !== false) return;
    try {
      const { comments: loaded } = await apiRequest(`/forum/posts/${post.id}/comments`);
      setPosts((current) => current.map((item) => item.id === post.id ? { ...item, comments: loaded, commentsLoaded: true } : item));
    } catch (error) { setToast(error.message); window.setTimeout(() => setToast(""), 2400); }
  };

  const submitComment = async (event, postId) => {
    event.preventDefault();
    if (!user) { onRequireAccount(); return; }
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const text = String(form.get("comment") || "").trim();
    if (!text) return;
    try {
      const { comment } = await apiRequest(`/forum/posts/${postId}/comments`, { method: "POST", body: { text, spoiler: form.has("spoiler") } });
      setPosts((current) => current.map((post) => post.id === postId ? { ...post, comments: [...post.comments, comment], commentsCount: (post.commentsCount ?? post.comments.length) + 1, commentsLoaded: true } : post));
      setToast("Comentário publicado.");
      formElement.reset();
      window.setTimeout(() => setToast(""), 2200);
    } catch (error) { setToast(error.message); window.setTimeout(() => setToast(""), 2400); }
  };

  const submitPost = async (event) => {
    event.preventDefault();
    if (!user) { onRequireAccount(); return; }
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const { post: newPost } = await apiRequest(`/communities/${communityId}/posts`, { method: "POST", body: { volume: String(form.get("volume")), title: String(form.get("title")).trim(), category: String(form.get("category")), body: String(form.get("body")).trim(), spoiler: form.has("spoiler") } });
      setVolumeId(newPost.volume);
      setExpandedPost(null);
      setComposerOpen(false);
      formElement.reset();
      setCommunityData((current) => ({ ...current, [communityId]: { ...current[communityId], discussions: (current[communityId]?.discussions || 0) + 1 } }));
      setToast("Sua discussão foi publicada.");
      window.setTimeout(() => setToast(""), 2200);
    } catch (error) { setToast(error.message); window.setTimeout(() => setToast(""), 2400); }
  };

  return (
    <section className="literary-forum" aria-label="Fórum literário Duraren">
      <div className="forum-layout">
        <aside className="forum-community-rail">
          <p className="forum-overline">Seus universos</p>
          <div className="forum-community-list">
            {Object.entries(communities).map(([id, item]) => (
              <button
                type="button"
                key={id}
                onClick={() => chooseCommunity(id)}
                className={`forum-community-choice ${communityId === id ? "active" : ""}`}
              >
                <span className="forum-community-icon">{item.icon}</span>
                <span>{item.handle}</span>
              </button>
            ))}
          </div>
          <div className="forum-note">
            <strong>Leia sem pressa.</strong>
            <p>
              Conversas cuidadosas, com espaço para cada leitor seguir no
              próprio ritmo.
            </p>
          </div>
        </aside>

        <div className="forum-main">
          {apiError && <p role="status" className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">{apiError}</p>}
          <div
            className="forum-mobile-communities"
            aria-label="Trocar de comunidade"
          >
            {Object.entries(communities).map(([id, item]) => (
              <button
                type="button"
                key={id}
                onClick={() => chooseCommunity(id)}
                className={communityId === id ? "active" : ""}
              >
                {item.handle}
              </button>
            ))}
          </div>
          <section className="forum-community-header">
            <div className="forum-header-top">
              <div>
                <p className="forum-kicker">
                  <span className="forum-online" />
                  {community.kind}
                </p>
                <h1>{community.handle}</h1>
                <p className="forum-description">{community.description}</p>
              </div>
              <span className="forum-member-count">
                <strong>{community.members}</strong> leitores
              </span>
            </div>
            <div className="forum-volume-area">
              <p className="forum-overline">Escolha até onde você leu</p>
              <div
                className="forum-volume-tabs"
                role="tablist"
                aria-label="Filtrar discussões por volume"
              >
                {community.volumes.map((volume) => (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={volumeId === volume.id}
                    key={volume.id}
                    onClick={() => {
                      setVolumeId(volume.id);
                      setExpandedPost(null);
                    }}
                    className={`forum-volume-tab ${volumeId === volume.id ? "active" : ""}`}
                  >
                    {volume.label}
                  </button>
                ))}
              </div>
              <p className="forum-volume-hint">
                {volumeId === "saga"
                  ? "Este recorte reúne conversas sobre a saga inteira e pode conter spoilers de todos os volumes."
                  : community.volumes.length === 1
                    ? "Discussões sobre o livro completo. Posts com spoiler continuam ocultos até você revelá-los."
                    : `Aqui aparecem apenas discussões sobre “${volumeName(volumeId)}”. A saga completa fica em uma aba separada.`}
              </p>
            </div>
          </section>

          <div className="forum-toolbar">
            <h2>
              {volumeId === "saga"
                ? "Discussões · Saga completa"
                : `Discussões · ${volumeName(volumeId)}`}
            </h2>
            <div className="forum-toolbar-controls">
              <label className="forum-search">
                <span aria-hidden="true">⌕</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar nesta comunidade"
                  aria-label="Buscar discussões"
                />
              </label>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                aria-label="Ordenar discussões"
                className="forum-sort"
              >
                <option value="recent">Recentes</option>
                <option value="popular">Mais votadas</option>
                <option value="commented">Mais comentadas</option>
              </select>
            </div>
          </div>

          <div className="forum-post-list">
            {visiblePosts.length ? (
              visiblePosts.map((post) => {
                const expanded = expandedPost === post.id;
                const vote = votes[post.id] || 0;
                const excerpt =
                  post.body.length > 190
                    ? `${post.body.slice(0, 187)}…`
                    : post.body;
                return (
                  <article className="forum-post-card" key={post.id}>
                    <div className="forum-post-meta">
                      <span className="forum-avatar">{post.initials}</span>
                      <strong>{post.author}</strong>
                      <span>·</span>
                      <span>{post.time}</span>
                      <span className="forum-tag volume">
                        {volumeName(post.volume)}
                      </span>
                      <span className="forum-tag">{post.category}</span>
                      {post.spoiler && (
                        <span className="forum-tag spoiler">Spoiler</span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="forum-post-title"
                      onClick={() => toggleExpanded(post)}
                    >
                      {post.title}
                    </button>
                    <Spoiler hidden={post.spoiler}>
                      {post.spoiler ? post.body : excerpt}
                    </Spoiler>
                    <div className="forum-post-actions">
                      <div className="forum-vote">
                        <button
                          type="button"
                          aria-label="Votar a favor"
                          aria-pressed={vote === 1}
                          className={vote === 1 ? "voted" : ""}
                          onClick={() => toggleVote(post.id, 1)}
                        >
                          ↑
                        </button>
                        <strong>{post.score}</strong>
                        <button
                          type="button"
                          aria-label="Votar contra"
                          aria-pressed={vote === -1}
                          className={vote === -1 ? "voted" : ""}
                          onClick={() => toggleVote(post.id, -1)}
                        >
                          ↓
                        </button>
                      </div>
                      <button
                        type="button"
                        className="forum-action-link"
                        onClick={() => toggleExpanded(post)}
                      >
                        ◯ {post.commentsCount ?? post.comments.length} comentários
                      </button>
                      <button
                        type="button"
                        className="forum-action-link forum-read-link"
                        onClick={() => toggleExpanded(post)}
                      >
                        {expanded ? "Fechar discussão" : "Ler discussão"} →
                      </button>
                    </div>
                    {expanded && (
                      <section className="forum-thread">
                        <h3>Conversa</h3>
                        <Spoiler hidden={post.spoiler}>{post.body}</Spoiler>
                        <div className="forum-comments">
                          {post.comments.length ? (
                            post.comments.map((comment, index) => (
                              <article
                                className="forum-comment"
                                key={`${post.id}-${index}`}
                              >
                                <strong>{comment.author}</strong>
                                <Spoiler hidden={comment.spoiler}>
                                  {comment.text}
                                </Spoiler>
                              </article>
                            ))
                          ) : (
                            <p className="forum-empty-comments">
                              Ainda não há comentários. Comece a conversa.
                            </p>
                          )}
                        </div>
                        <form
                          className="forum-comment-form"
                          onSubmit={(event) => submitComment(event, post.id)}
                        >
                          <input
                            name="comment"
                            required
                            maxLength="500"
                            placeholder="Escreva um comentário respeitoso…"
                            aria-label="Novo comentário"
                          />
                          <label className="forum-spoiler-check">
                            <input name="spoiler" type="checkbox" /> spoiler
                          </label>
                          <button type="submit">Comentar</button>
                        </form>
                      </section>
                    )}
                  </article>
                );
              })
            ) : (
              <div className="forum-empty">
                <span>✧</span>
                <strong>Nenhuma discussão neste recorte ainda.</strong>
                <p>
                  {query
                    ? "Tente buscar por outro termo."
                    : "Que tal abrir a primeira conversa?"}
                </p>
              </div>
            )}
          </div>
          <div className="forum-mobile-note">
            <strong>Combinados de leitura</strong>
            <span>
              Marque spoilers e escolha o volume certo para sua discussão.
            </span>
          </div>
        </div>

        <aside className="forum-info-rail">
          <section className="forum-info-card">
            <p className="forum-overline">Sobre a comunidade</p>
            <h2>{community.name}</h2>
            <p>{community.description}</p>
            <div className="forum-stats">
              <div>
                <strong>{community.members}</strong>
                <span>leitores</span>
              </div>
              <div>
                <strong>
                  {
                    community.discussions ?? posts.filter((post) => post.community === communityId).length
                  }
                </strong>
                <span>discussões</span>
              </div>
            </div>
          </section>
          <section className="forum-info-card">
            <p className="forum-overline">Combinados de leitura</p>
            <h2>Para uma boa conversa</h2>
            <ol className="forum-rules">
              <li>
                <b>01</b>Marque spoilers antes de publicar.
              </li>
              <li>
                <b>02</b>Escolha o volume certo para a discussão.
              </li>
              <li>
                <b>03</b>Discorde das ideias com gentileza.
              </li>
            </ol>
          </section>
          <section className="forum-info-card">
            <p className="forum-overline">Estante coletiva</p>
            <h2>Leituras em andamento</h2>
            <div className="forum-book-stack" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
            <p>
              Uma comunidade cresce quando cada leitor traz uma pergunta, teoria
              ou página favorita.
            </p>
          </section>
        </aside>
      </div>

      {isComposerOpen && (
        <div
          className="forum-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setComposerOpen(false);
          }}
        >
          <section
            className="forum-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="forum-modal-title"
          >
            <div className="forum-modal-head">
              <div>
                <h2 id="forum-modal-title">Nova discussão</h2>
                <p>Publicando em {community.handle}</p>
              </div>
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setComposerOpen(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={submitPost} className="forum-new-post-form">
              <label>
                Título
                <input
                  name="title"
                  maxLength="110"
                  required
                  placeholder="Qual assunto está na sua cabeça?"
                />
              </label>
              <label>
                Livro ou recorte
                <select name="volume" defaultValue={volumeId}>
                  {community.volumes.map((volume) => (
                    <option key={volume.id} value={volume.id}>
                      {volume.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Tipo de discussão
                <select name="category">
                  <option>Teoria</option>
                  <option>Análise</option>
                  <option>Dúvida</option>
                  <option>Resenha</option>
                </select>
              </label>
              <label>
                Sua discussão
                <textarea
                  name="body"
                  required
                  maxLength="2400"
                  placeholder="Desenvolva sua ideia. Evite spoilers fora do recorte escolhido."
                />
              </label>
              <label className="forum-spoiler-check">
                <input name="spoiler" type="checkbox" /> Esta discussão contém
                spoilers
              </label>
              <button type="submit" className="forum-publish">
                Publicar discussão
              </button>
            </form>
          </section>
        </div>
      )}
      {toast && (
        <div className="forum-toast" role="status">
          {toast}
        </div>
      )}
      <button
        type="button"
        className="forum-floating-new"
        onClick={() => setComposerOpen(true)}
      >
        <span>＋</span> Nova discussão
      </button>
    </section>
  );
}

export default CommunityForum;
