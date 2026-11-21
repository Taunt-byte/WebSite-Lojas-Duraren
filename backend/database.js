const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");

const dataDirectory = path.join(__dirname, "data");
fs.mkdirSync(dataDirectory, { recursive: true });
const databasePath = process.env.DURAREN_DB_PATH || path.join(dataDirectory, "duraren.sqlite");
const db = new Database(databasePath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS user_preferences (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    PRIMARY KEY (user_id, category)
  );
  CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL CHECK (price > 0),
    old_price REAL NOT NULL DEFAULT 0,
    rating TEXT NOT NULL DEFAULT 'Novo',
    review_count INTEGER NOT NULL DEFAULT 0,
    cover TEXT NOT NULL,
    tone TEXT NOT NULL DEFAULT 'bg-amber-100',
    badge TEXT,
    description TEXT NOT NULL,
    pages INTEGER NOT NULL DEFAULT 0,
    created_by INTEGER REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS book_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    body TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS site_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS communities (
    slug TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    handle TEXT NOT NULL UNIQUE,
    kind TEXT NOT NULL,
    description TEXT NOT NULL,
    members INTEGER NOT NULL DEFAULT 0,
    icon TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS community_volumes (
    community_slug TEXT NOT NULL REFERENCES communities(slug) ON DELETE CASCADE,
    id TEXT NOT NULL,
    label TEXT NOT NULL,
    position INTEGER NOT NULL,
    PRIMARY KEY (community_slug, id)
  );
  CREATE TABLE IF NOT EXISTS forum_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    community_slug TEXT NOT NULL REFERENCES communities(slug) ON DELETE CASCADE,
    volume_id TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    body TEXT NOT NULL,
    spoiler INTEGER NOT NULL DEFAULT 0,
    base_score INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (community_slug, volume_id) REFERENCES community_volumes(community_slug, id)
  );
  CREATE TABLE IF NOT EXISTS forum_votes (
    post_id INTEGER NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    value INTEGER NOT NULL CHECK (value IN (-1, 1)),
    PRIMARY KEY (post_id, user_id)
  );
  CREATE TABLE IF NOT EXISTS forum_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    body TEXT NOT NULL,
    spoiler INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
  CREATE INDEX IF NOT EXISTS idx_book_comments_book ON book_comments(book_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_forum_posts_feed ON forum_posts(community_slug, volume_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_forum_comments_post ON forum_comments(post_id, created_at);
`);

const categories = ["Romance", "Ficção", "Fantasia", "Desenvolvimento"];
const seedBooks = [
  { id: "book-love-hypothesis", title: "A hipótese do amor", author: "Ali Hazelwood", price: 39.9, oldPrice: 54.9, rating: "4,9", reviewCount: 328, category: "Romance", cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=85", tone: "bg-rose-100", badge: "MAIS VENDIDO", description: "Uma comédia romântica irresistível sobre ciência, amizade e um namoro de mentira que começa a parecer real.", pages: 384, comments: [{ name: "Ana Paula", text: "Leitura leve e divertida, terminei em dois dias!", rating: 5 }, { name: "Lucas M.", text: "Os personagens são ótimos. Recomendo para quem gosta de romance com humor.", rating: 4 }] },
  { id: "book-tudo-e-rio", title: "Tudo é rio", author: "Carla Madeira", price: 34.9, oldPrice: 44.9, rating: "4,8", reviewCount: 216, category: "Ficção", cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=85", tone: "bg-amber-100", description: "Uma narrativa sobre amor, perdão e escolhas que transformam uma vida, escrita com intensidade e delicadeza.", pages: 210, comments: [{ name: "Bruna S.", text: "A escrita é linda e a história prende do começo ao fim.", rating: 5 }] },
  { id: "book-atomic-habits", title: "Hábitos atômicos", author: "James Clear", price: 42.9, oldPrice: 59.9, rating: "4,9", reviewCount: 512, category: "Desenvolvimento", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=85", tone: "bg-emerald-100", badge: "−28%", description: "Um guia prático para criar bons hábitos, abandonar os que atrapalham e melhorar um pouco a cada dia.", pages: 320, comments: [{ name: "Pedro R.", text: "Muito prático. As ideias são fáceis de colocar em ação.", rating: 5 }] },
  { id: "book-midnight-library", title: "A biblioteca da meia-noite", author: "Matt Haig", price: 37.9, oldPrice: 49.9, rating: "4,7", reviewCount: 184, category: "Fantasia", cover: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=600&q=85", tone: "bg-indigo-100", description: "Entre a vida e a morte existe uma biblioteca infinita. Cada livro oferece a chance de experimentar outra vida.", pages: 308, comments: [{ name: "Camila F.", text: "Uma história sensível que faz pensar nas possibilidades da vida.", rating: 4 }] },
];

const insertBook = db.prepare(`INSERT OR IGNORE INTO books
  (id,title,author,category,price,old_price,rating,review_count,cover,tone,badge,description,pages)
  VALUES (@id,@title,@author,@category,@price,@oldPrice,@rating,@reviewCount,@cover,@tone,@badge,@description,@pages)`);
const insertBookComment = db.prepare(`INSERT INTO book_comments(book_id,author_name,body,rating) VALUES(?,?,?,?)`);
const insertSeedComments = db.prepare("SELECT COUNT(*) AS total FROM book_comments WHERE book_id = ?");
const insertSiteComment = db.prepare("INSERT INTO site_comments(author_name,body) VALUES(?,?)");
const insertSeedSiteComment = db.prepare("SELECT COUNT(*) AS total FROM site_comments");
const seedData = db.transaction(() => {
  for (const book of seedBooks) {
    const { comments, ...bookData } = book;
    insertBook.run({ ...bookData, badge: book.badge || null });
    if (insertSeedComments.get(book.id).total === 0) {
      for (const review of comments) insertBookComment.run(book.id, review.name, review.text, review.rating);
    }
  }
  if (insertSeedSiteComment.get().total === 0) {
    insertSiteComment.run("Mariana Costa", "Adorei descobrir livros novos por aqui. As avaliações ajudam muito!");
    insertSiteComment.run("Rafael Lima", "Minha próxima leitura já está na lista. Interface simples de usar!");
  }
});
seedData();

const seedCommunities = [
  { slug: "middleearth", name: "Terra Média", handle: "u/TerraMedia", kind: "Saga · 3 volumes", description: "Das pequenas colinas do Condado às sombras de Mordor. Uma conversa de cada vez, sem spoilers fora de hora.", members: 2841, icon: "TM", volumes: [["book1", "A Sociedade do Anel"], ["book2", "As Duas Torres"], ["book3", "O Retorno do Rei"], ["saga", "Saga Completa"]] },
  { slug: "dune", name: "Universo Duna", handle: "u/UniversoDuna", kind: "Saga · 3 volumes", description: "Política, ecologia e profecia nas areias de Arrakis. Escolha seu ponto de leitura antes de entrar na conversa.", members: 1673, icon: "DU", volumes: [["dune1", "Duna"], ["dune2", "Messias de Duna"], ["dune3", "Filhos de Duna"], ["saga", "Saga Completa"]] },
  { slug: "orwell", name: "1984", handle: "u/1984", kind: "Livro · George Orwell", description: "Leituras, perguntas e interpretações sobre o romance de George Orwell. Os spoilers ficam ocultos até você decidir revelá-los.", members: 926, icon: "84", volumes: [["whole", "Livro completo"]] },
];

const insertCommunity = db.prepare(`INSERT OR IGNORE INTO communities(slug,name,handle,kind,description,members,icon)
  VALUES(@slug,@name,@handle,@kind,@description,@members,@icon)`);
const insertVolume = db.prepare("INSERT OR IGNORE INTO community_volumes(community_slug,id,label,position) VALUES(?,?,?,?)");
const seedCommunityData = db.transaction(() => {
  for (const community of seedCommunities) {
    const { slug, name, handle, kind, description, members, icon } = community;
    insertCommunity.run({ slug, name, handle, kind, description, members, icon });
    community.volumes.forEach(([id, label], position) => insertVolume.run(community.slug, id, label, position));
  }
});
seedCommunityData();

const seedPosts = [
  { community: "middleearth", volume: "book1", title: "A hospitalidade de Tom Bombadil muda o ritmo da jornada?", category: "Análise", author: "Lia das Letras", body: "A chegada à casa de Tom parece suspender a urgência da história. Para mim, esse intervalo apresenta uma forma diferente de poder, que não nasce do desejo de possuir ou controlar. Como vocês leram esse trecho?", spoiler: 0, score: 34, minutes: 18 },
  { community: "middleearth", volume: "book1", title: "Por que o Condado parece tão distante do resto do mundo?", category: "Teoria", author: "PippinReader", body: "Tenho pensado no contraste entre a vida cotidiana do Condado e os perigos que cercam a Terra Média. Será que esse isolamento é só geográfico ou também uma escolha narrativa?", spoiler: 0, score: 21, minutes: 60 },
  { community: "middleearth", volume: "book2", title: "A floresta como personagem em As Duas Torres", category: "Análise", author: "RaizAntiga", body: "[SPOILER] A relação dos Ents com a floresta me parece uma das maneiras mais bonitas de falar sobre responsabilidade coletiva.", spoiler: 1, score: 42, minutes: 300 },
  { community: "middleearth", volume: "saga", title: "Qual tema atravessa os três livros com mais força?", category: "Teoria", author: "Beren & Lúthien", body: "[SPOILER] Para quem terminou a trilogia: tenho dúvidas se o tema central é renúncia, amizade ou passagem do tempo.", spoiler: 1, score: 53, minutes: 180 },
  { community: "dune", volume: "dune1", title: "A ecologia de Arrakis é quase uma personagem", category: "Análise", author: "AreiaAzul", body: "A descrição da água e dos ciclos do deserto transforma cada decisão em algo material. O cenário altera política, costumes e até a linguagem dos personagens.", spoiler: 0, score: 39, minutes: 26 },
  { community: "dune", volume: "dune2", title: "A solidão de governar em Messias de Duna", category: "Análise", author: "SietchReader", body: "[SPOILER] O livro parece interessado no preço de se tornar um símbolo. Como a história conversa com as expectativas que o primeiro volume cria?", spoiler: 1, score: 28, minutes: 1440 },
  { community: "dune", volume: "saga", title: "O que a saga diz sobre profecia e escolha?", category: "Teoria", author: "Duncan Idaho fã", body: "[SPOILER] Depois de ler os três volumes, vocês acham que a saga trata a profecia como destino ou ferramenta política?", spoiler: 1, score: 46, minutes: 360 },
  { community: "orwell", volume: "whole", title: "A linguagem reduzida é o instrumento de controle mais assustador?", category: "Análise", author: "Clara Martins", body: "A ideia de que palavras podem desaparecer e, com elas, certas formas de pensamento continua muito atual. O que mais chamou sua atenção na construção da Novafala?", spoiler: 0, score: 31, minutes: 42 },
  { community: "orwell", volume: "whole", title: "O desconforto como escolha narrativa", category: "Resenha", author: "R. Azevedo", body: "[SPOILER] A leitura é desconfortável de propósito, mas isso não a torna menos envolvente. Como vocês equilibraram o peso do livro com a vontade de continuar?", spoiler: 1, score: 24, minutes: 240 },
];

const seedPost = db.prepare(`INSERT INTO forum_posts(community_slug,volume_id,title,category,author_name,body,spoiler,base_score,created_at)
  VALUES(@community,@volume,@title,@category,@author,@body,@spoiler,@score,@createdAt)`);
const hasPosts = db.prepare("SELECT COUNT(*) AS total FROM forum_posts");
const seedForumData = db.transaction(() => {
  if (hasPosts.get().total > 0) return;
  for (const post of seedPosts) {
    const createdAt = new Date(Date.now() - post.minutes * 60000).toISOString();
    seedPost.run({ ...post, createdAt });
  }
});
seedForumData();

module.exports = { db, categories };
