
# Projeto de Desenvolvimento de Dispositivos Móveis, Web e Games - Lojas Duraren

Desenvolvimento de um site de vendas com funcionalidades de comentários e recomendações de produtos, como projeto avaliativo da disciplina de Desenvolvimento de Dispositivos Móveis, Web e Games.


## Funcionalidades

- Temas dark e light
- Sistema de contas
- Sistema de Recomendação de produtos com base no gosto do usuario
- Sistema de comentarios
- Sistema de cadastro de livros
- Sistema de filtro de comentarios 

## Aprendizados

Aprendi bastante com esse projeto no que diz respeito a sintaxe do javascript assim como a imprementação de sistemas mais complexos como o sistema de comentarios e recomendações me deram uma base muito forte para proximos projetos.


## Estrutura

- `frontend/`: interface em React e Tailwind.
- `backend/`: API em Express e persistência SQLite.

## Como executar localmente

Instale as dependências uma vez em cada pasta:

```powershell
cd backend
npm install
```

```powershell
cd frontend
npm install
```

Abra dois terminais na pasta principal do repositório. No primeiro:

```powershell
cd backend
npm run dev
```

No segundo:

```powershell
cd frontend
npm start
```

O frontend abre em `http://localhost:3000` e encaminha `/api` para o backend na porta `4000`. O banco é criado automaticamente em `backend/data/duraren.sqlite` na primeira execução.

Veja [backend/README.md](backend/README.md) para entender as rotas e a estrutura das tabelas.

