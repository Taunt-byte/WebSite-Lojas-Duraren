# Backend Duraren

API local do projeto, separada do React. Usa Express; os dados ficam no SQLite em `backend/data/duraren.sqlite`.

## Iniciar

No terminal, a partir da pasta `backend`:

```powershell
npm install
npm run dev
```

A API fica em `http://localhost:4000`. O banco e as tabelas são criados na primeira inicialização.

## Como o backend funciona

1. A interface React envia pedidos HTTP para caminhos `/api`, usando `../frontend/src/utils/api.js`.
2. `index.js` valida cada pedido e executa a rota correspondente.
3. `auth.js` verifica sessões e trata cadastro/login. As senhas usam `scrypt`; os tokens de sessão são aleatórios, enviados em cookie `HttpOnly` e armazenados como hash.
4. `database.js` cria o esquema e dados iniciais. O SQLite persiste usuários, preferências, livros, avaliações, comentários, posts, votos e respostas.

## Rotas principais

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- `GET /api/books`, `POST /api/books`, `GET /api/books/:id/reviews`, `POST /api/books/:id/reviews`
- `GET /api/recommendations`, `PUT /api/preferences`
- `GET /api/comments`, `POST /api/comments`
- `GET /api/communities`, `GET /api/communities/:slug/posts`, `POST /api/communities/:slug/posts`
- `GET /api/forum/posts/:id/comments`, `POST /api/forum/posts/:id/comments`, `POST /api/forum/posts/:id/vote`

Para publicar o projeto, ainda será preciso configurar HTTPS, origem permitida entre frontend e API, backups e monitoramento. A API não habilita CORS aberto. O cookie `Secure` é usado quando `NODE_ENV=production`.
