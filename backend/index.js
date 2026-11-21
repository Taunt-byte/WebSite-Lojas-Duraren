const crypto = require("node:crypto");
const express = require("express");
const { db, categories } = require("./database");
const { authenticate, createAccount, createSession, destroySession, getPublicUser, optionalAuth, requireAuth } = require("./auth");

const app = express();
const port = Number(process.env.PORT) || 4000;
const postCategories = ["Teoria", "Análise", "Dúvida", "Resenha"];
const fallbackCover = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=85";

app.disable("x-powered-by");
app.use(express.json({ limit: "200kb" }));
app.use(optionalAuth);
app.use((_request, response, next) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

function fail(response, status, message) {
  return response.status(status).json({ error: message });
}

function cleanString(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function mapBook(row) {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    price: row.price,
    oldPrice: row.old_price,
    rating: row.rating,
    reviews: row.review_count,
    category: row.category,
    cover: row.cover,
    tone: row.tone,
    badge: row.badge || undefined,
    description: row.description,
    pages: row.pages,
  };
}

function mapReview(row) {
  return { id: row.id, name: row.author_name, text: row.body, rating: row.rating, createdAt: row.created_at };
}

function relativeTime(value) {
  const ageMinutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (ageMinutes < 1) return "agora";
  if (ageMinutes < 60) return `há ${ageMinutes} min`;
  const hours = Math.floor(ageMinutes / 60);
  if (hours < 24) return `há ${hours} h`;
  if (hours < 48) return "ontem";
  return `há ${Math.floor(hours / 24)} dias`;
}

function mapForumPost(row) {
  return {
    id: row.id,
    community: row.community_slug,
    volume: row.volume_id,
    volumeLabel: row.volume_label,
    title: row.title,
    category: row.category,
    author: row.author_name,
    initials: row.author_name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase(),
    time: relativeTime(row.created_at),
    score: row.score,
    userVote: row.user_vote || 0,
    commentsCount: row.comments_count,
    body: row.body,
    spoiler: Boolean(row.spoiler),
  };
}

function validateReviewRating(value) {
  const rating = Number(value);
  return Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null;
}

app.get("/api/health", (_request, response) => response.json({ status: "ok" }));

app.post("/api/auth/register", (request, response) => {
  const name = cleanString(request.body?.name, 80);
  const email = cleanString(request.body?.email, 254).toLowerCase();
  const password = typeof request.body?.password === "string" ? request.body.password : "";
  if (name.length < 2) return fail(response, 400, "Informe seu nome.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(response, 400, "Informe um e-mail válido.");
  if (password.length < 8 || password.length > 128) return fail(response, 400, "A senha precisa ter entre 8 e 128 caracteres.");
  try {
    const user = createAccount({ name, email, password });
    createSession(user.id, response);
    response.status(201).json({ user });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") return fail(response, 409, "Já existe uma conta com este e-mail.");
    throw error;
  }
});

app.post("/api/auth/login", (request, response) => {
  const email = cleanString(request.body?.email, 254).toLowerCase();
  const password = typeof request.body?.password === "string" ? request.body.password : "";
  const user = authenticate(email, password);
  if (!user) return fail(response, 401, "E-mail ou senha incorretos.");
  createSession(user.id, response);
  response.json({ user });
});

app.post("/api/auth/logout", (request, response) => {
  destroySession(request, response);
  response.status(204).end();
});

app.get("/api/auth/me", (request, response) => {
  if (!request.user) return fail(response, 401, "Entre na sua conta para continuar.");
  response.json({ user: request.user });
});

app.put("/api/preferences", requireAuth, (request, response) => {
  const preferences = Array.isArray(request.body?.preferences) ? [...new Set(request.body.preferences)] : null;
  if (!preferences || preferences.some((item) => !categories.includes(item))) return fail(response, 400, "A lista de gêneros contém valores inválidos.");
  const save = db.transaction(() => {
    db.prepare("DELETE FROM user_preferences WHERE user_id=?").run(request.user.id);
    const insert = db.prepare("INSERT INTO user_preferences(user_id,category) VALUES(?,?)");
    for (const category of preferences) insert.run(request.user.id, category);
  });
  save();
  response.json({ user: getPublicUser(request.user.id) });
});

app.get("/api/books", (request, response) => {
  const query = cleanString(request.query.q, 100);
  const category = cleanString(request.query.category, 40);
  let rows = db.prepare("SELECT * FROM books ORDER BY created_at DESC, title COLLATE NOCASE").all();
  if (category && category !== "Todos") rows = rows.filter((book) => book.category === category);
  if (query) {
    const needle = query.toLocaleLowerCase("pt-BR");
    rows = rows.filter((book) => `${book.title} ${book.author}`.toLocaleLowerCase("pt-BR").includes(needle));
  }
  response.json({ books: rows.map(mapBook) });
});

app.get("/api/books/:id", (request, response) => {
  const row = db.prepare("SELECT * FROM books WHERE id=?").get(request.params.id);
  if (!row) return fail(response, 404, "Livro não encontrado.");
  response.json({ book: mapBook(row) });
});

app.post("/api/books", requireAuth, (request, response) => {
  const body = request.body || {};
  const title = cleanString(body.title, 100);
  const author = cleanString(body.author, 80);
  const category = cleanString(body.category, 40);
  const description = cleanString(body.description, 900);
  const price = Number(body.price);
  const oldPrice = Number(body.oldPrice) || price;
  const pages = Number(body.pages) || 0;
  const cover = cleanString(body.cover, 1000) || fallbackCover;
  if (title.length < 1 || author.length < 1 || description.length < 10) return fail(response, 400, "Preencha título, autor e uma descrição com pelo menos 10 caracteres.");
  if (!categories.includes(category)) return fail(response, 400, "Escolha um gênero válido.");
  if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(oldPrice) || oldPrice < 0) return fail(response, 400, "Informe um preço válido.");
  if (!/^https?:\/\//i.test(cover)) return fail(response, 400, "A capa precisa ser uma URL HTTP ou HTTPS.");
  const id = crypto.randomUUID();
  db.prepare(`INSERT INTO books(id,title,author,category,price,old_price,rating,review_count,cover,tone,description,pages,created_by)
    VALUES(?,?,?,?,?,?,?,0,?,?,?,?,?)`).run(id, title, author, category, price, oldPrice, "Novo", cover, "bg-amber-100", description, pages, request.user.id);
  response.status(201).json({ book: mapBook(db.prepare("SELECT * FROM books WHERE id=?").get(id)) });
});

app.get("/api/recommendations", requireAuth, (request, response) => {
  const preferred = new Set(request.user.preferences);
  const books = db.prepare("SELECT * FROM books ORDER BY title COLLATE NOCASE").all().map(mapBook);
  books.sort((left, right) => Number(preferred.has(right.category)) - Number(preferred.has(left.category)) || Number(String(right.rating).replace(",", ".")) - Number(String(left.rating).replace(",", ".")));
  response.json({ books: books.slice(0, 8), preferences: [...preferred] });
});

app.get("/api/books/:id/reviews", (request, response) => {
  const exists = db.prepare("SELECT id FROM books WHERE id=?").get(request.params.id);
  if (!exists) return fail(response, 404, "Livro não encontrado.");
  const rating = request.query.rating ? validateReviewRating(request.query.rating) : null;
  if (request.query.rating && !rating) return fail(response, 400, "A nota precisa estar entre 1 e 5.");
  const rows = rating
    ? db.prepare("SELECT * FROM book_comments WHERE book_id=? AND rating=? ORDER BY created_at DESC,id DESC").all(request.params.id, rating)
    : db.prepare("SELECT * FROM book_comments WHERE book_id=? ORDER BY created_at DESC,id DESC").all(request.params.id);
  response.json({ comments: rows.map(mapReview) });
});

app.post("/api/books/:id/reviews", requireAuth, (request, response) => {
  const book = db.prepare("SELECT id,rating,review_count FROM books WHERE id=?").get(request.params.id);
  if (!book) return fail(response, 404, "Livro não encontrado.");
  const text = cleanString(request.body?.text, 1500);
  const rating = validateReviewRating(request.body?.rating);
  if (text.length < 2) return fail(response, 400, "Escreva uma avaliação antes de publicar.");
  if (!rating) return fail(response, 400, "A nota precisa estar entre 1 e 5.");
  const insert = db.prepare("INSERT INTO book_comments(book_id,user_id,author_name,body,rating) VALUES(?,?,?,?,?)");
  const transaction = db.transaction(() => {
    const result = insert.run(book.id, request.user.id, request.user.name, text, rating);
    const previousRating = Number(String(book.rating).replace(",", ".")) || rating;
    const newCount = book.review_count + 1;
    const average = ((previousRating * book.review_count) + rating) / newCount;
    db.prepare("UPDATE books SET rating=?,review_count=? WHERE id=?").run(average.toFixed(1).replace(".", ","), newCount, book.id);
    return result.lastInsertRowid;
  });
  const id = transaction();
  response.status(201).json({
    comment: mapReview(db.prepare("SELECT * FROM book_comments WHERE id=?").get(id)),
    book: mapBook(db.prepare("SELECT * FROM books WHERE id=?").get(book.id)),
  });
});

app.get("/api/comments", (_request, response) => {
  const comments = db.prepare("SELECT id,author_name,body,created_at FROM site_comments ORDER BY created_at DESC,id DESC")
    .all().map((row) => ({ id: row.id, name: row.author_name, text: row.body, initials: row.author_name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase(), createdAt: row.created_at }));
  response.json({ comments });
});

app.post("/api/comments", requireAuth, (request, response) => {
  const text = cleanString(request.body?.text, 1000);
  if (text.length < 2) return fail(response, 400, "O comentário precisa ter pelo menos 2 caracteres.");
  const result = db.prepare("INSERT INTO site_comments(user_id,author_name,body) VALUES(?,?,?)").run(request.user.id, request.user.name, text);
  const comment = db.prepare("SELECT id,author_name,body,created_at FROM site_comments WHERE id=?").get(result.lastInsertRowid);
  response.status(201).json({ comment: { id: comment.id, name: comment.author_name, text: comment.body, initials: request.user.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase(), createdAt: comment.created_at } });
});

app.get("/api/communities", (_request, response) => {
  const communities = db.prepare("SELECT * FROM communities ORDER BY name").all().map((community) => ({
    ...community,
    volumes: db.prepare("SELECT id,label FROM community_volumes WHERE community_slug=? ORDER BY position").all(community.slug),
    discussions: db.prepare("SELECT COUNT(*) AS total FROM forum_posts WHERE community_slug=?").get(community.slug).total,
  }));
  response.json({ communities });
});

app.get("/api/communities/:slug/posts", (request, response) => {
  const community = db.prepare("SELECT slug FROM communities WHERE slug=?").get(request.params.slug);
  if (!community) return fail(response, 404, "Comunidade não encontrada.");
  const volume = cleanString(request.query.volume, 60);
  const search = cleanString(request.query.search, 100).toLocaleLowerCase("pt-BR");
  const order = request.query.sort === "popular" ? "score DESC, p.created_at DESC" : request.query.sort === "commented" ? "comments_count DESC, p.created_at DESC" : "p.created_at DESC";
  let rows = db.prepare(`SELECT p.*, v.label AS volume_label,
      p.base_score + COALESCE((SELECT SUM(fv.value) FROM forum_votes fv WHERE fv.post_id=p.id),0) AS score,
      (SELECT COUNT(*) FROM forum_comments fc WHERE fc.post_id=p.id) AS comments_count,
      (SELECT fv.value FROM forum_votes fv WHERE fv.post_id=p.id AND fv.user_id=?) AS user_vote
    FROM forum_posts p JOIN community_volumes v ON v.community_slug=p.community_slug AND v.id=p.volume_id
    WHERE p.community_slug=? AND (?='saga' OR p.volume_id=?)
    ORDER BY ${order}`).all(request.user?.id || -1, request.params.slug, volume, volume);
  if (search) rows = rows.filter((post) => `${post.title} ${post.body} ${post.author_name} ${post.category}`.toLocaleLowerCase("pt-BR").includes(search));
  response.json({ posts: rows.map(mapForumPost) });
});

app.get("/api/forum/posts/:id/comments", (request, response) => {
  const post = db.prepare("SELECT id FROM forum_posts WHERE id=?").get(Number(request.params.id));
  if (!post) return fail(response, 404, "Discussão não encontrada.");
  const comments = db.prepare("SELECT id,author_name,body,spoiler,created_at FROM forum_comments WHERE post_id=? ORDER BY created_at,id").all(post.id)
    .map((comment) => ({ id: comment.id, author: comment.author_name, text: comment.body, spoiler: Boolean(comment.spoiler), createdAt: comment.created_at }));
  response.json({ comments });
});

app.post("/api/communities/:slug/posts", requireAuth, (request, response) => {
  const community = db.prepare("SELECT slug FROM communities WHERE slug=?").get(request.params.slug);
  if (!community) return fail(response, 404, "Comunidade não encontrada.");
  const title = cleanString(request.body?.title, 150);
  const body = cleanString(request.body?.body, 4000);
  const category = cleanString(request.body?.category, 30);
  const volume = cleanString(request.body?.volume, 60);
  const spoiler = Boolean(request.body?.spoiler);
  if (title.length < 4 || body.length < 10) return fail(response, 400, "Informe um título e uma discussão com pelo menos 10 caracteres.");
  if (!postCategories.includes(category)) return fail(response, 400, "Escolha uma categoria válida.");
  if (!db.prepare("SELECT id FROM community_volumes WHERE community_slug=? AND id=?").get(community.slug, volume)) return fail(response, 400, "Escolha um volume válido para esta comunidade.");
  const result = db.prepare(`INSERT INTO forum_posts(community_slug,volume_id,title,category,author_id,author_name,body,spoiler,base_score)
    VALUES(?,?,?,?,?,?,?,?,0)`).run(community.slug, volume, title, category, request.user.id, request.user.name, body, spoiler ? 1 : 0);
  const row = db.prepare(`SELECT p.*,v.label AS volume_label,p.base_score AS score,0 AS comments_count,0 AS user_vote
    FROM forum_posts p JOIN community_volumes v ON v.community_slug=p.community_slug AND v.id=p.volume_id WHERE p.id=?`).get(result.lastInsertRowid);
  response.status(201).json({ post: mapForumPost(row) });
});

app.post("/api/forum/posts/:id/vote", requireAuth, (request, response) => {
  const postId = Number(request.params.id);
  const vote = Number(request.body?.value);
  if (!Number.isInteger(postId) || !db.prepare("SELECT id FROM forum_posts WHERE id=?").get(postId)) return fail(response, 404, "Discussão não encontrada.");
  if (![ -1, 0, 1 ].includes(vote)) return fail(response, 400, "O voto precisa ser -1, 0 ou 1.");
  if (vote === 0) db.prepare("DELETE FROM forum_votes WHERE post_id=? AND user_id=?").run(postId, request.user.id);
  else db.prepare(`INSERT INTO forum_votes(post_id,user_id,value) VALUES(?,?,?)
    ON CONFLICT(post_id,user_id) DO UPDATE SET value=excluded.value`).run(postId, request.user.id, vote);
  const score = db.prepare("SELECT base_score + COALESCE((SELECT SUM(value) FROM forum_votes WHERE post_id=?),0) AS score FROM forum_posts WHERE id=?").get(postId, postId).score;
  response.json({ score, userVote: vote });
});

app.post("/api/forum/posts/:id/comments", requireAuth, (request, response) => {
  const postId = Number(request.params.id);
  if (!db.prepare("SELECT id FROM forum_posts WHERE id=?").get(postId)) return fail(response, 404, "Discussão não encontrada.");
  const body = cleanString(request.body?.text, 1500);
  if (body.length < 2) return fail(response, 400, "O comentário precisa ter pelo menos 2 caracteres.");
  const spoiler = Boolean(request.body?.spoiler);
  const result = db.prepare("INSERT INTO forum_comments(post_id,user_id,author_name,body,spoiler) VALUES(?,?,?,?,?)").run(postId, request.user.id, request.user.name, body, spoiler ? 1 : 0);
  const comment = db.prepare("SELECT id,author_name,body,spoiler,created_at FROM forum_comments WHERE id=?").get(result.lastInsertRowid);
  response.status(201).json({ comment: { id: comment.id, author: comment.author_name, text: comment.body, spoiler: Boolean(comment.spoiler), createdAt: comment.created_at } });
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: "Ocorreu um erro interno. Consulte o terminal do servidor." });
});

app.listen(port, () => {
  console.log(`Duraren API pronta em http://localhost:${port}`);
  console.log(`SQLite: ${process.env.DURAREN_DB_PATH || "data/duraren.sqlite"}`);
});
