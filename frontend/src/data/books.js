export const books = [
  {
    id: 1,
    title: "A hipótese do amor",
    author: "Ali Hazelwood",
    price: 39.9,
    oldPrice: 54.9,
    rating: "4,9",
    reviews: 328,
    category: "Romance",
    cover:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=85",
    tone: "bg-rose-100",
    badge: "MAIS VENDIDO",
    description:
      "Uma comédia romântica irresistível sobre ciência, amizade e um namoro de mentira que começa a parecer real. Olive Smith só queria convencer a melhor amiga de que seguiu em frente — e acaba envolvendo o exigente professor Adam Carlsen.",
    pages: 384,
    comments: [
      {
        name: "Ana Paula",
        text: "Leitura leve e divertida, terminei em dois dias!",
        rating: 5,
      },
      {
        name: "Lucas M.",
        text: "Os personagens são ótimos. Recomendo para quem gosta de romance com humor.",
        rating: 4,
      },
    ],
  },
  {
    id: 2,
    title: "Tudo é rio",
    author: "Carla Madeira",
    price: 34.9,
    oldPrice: 44.9,
    rating: "4,8",
    reviews: 216,
    category: "Ficção",
    cover:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=85",
    tone: "bg-amber-100",
    description:
      "Com uma escrita intensa e delicada, Carla Madeira constrói uma narrativa sobre amor, perdão e as escolhas que transformam uma vida. Uma história com personagens inesquecíveis e emoções que continuam com o leitor depois da última página.",
    pages: 210,
    comments: [
      {
        name: "Bruna S.",
        text: "A escrita é linda e a história prende do começo ao fim.",
        rating: 5,
      },
    ],
  },
  {
    id: 3,
    title: "Hábitos atômicos",
    author: "James Clear",
    price: 42.9,
    oldPrice: 59.9,
    rating: "4,9",
    reviews: 512,
    category: "Desenvolvimento",
    cover:
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=85",
    tone: "bg-emerald-100",
    badge: "−28%",
    description:
      "Um guia prático para criar bons hábitos, abandonar os que atrapalham e melhorar um pouco a cada dia. James Clear apresenta estratégias simples para transformar pequenas mudanças em resultados duradouros.",
    pages: 320,
    comments: [
      {
        name: "Pedro R.",
        text: "Muito prático. As ideias são fáceis de colocar em ação.",
        rating: 5,
      },
    ],
  },
  {
    id: 4,
    title: "A biblioteca da meia-noite",
    author: "Matt Haig",
    price: 37.9,
    oldPrice: 49.9,
    rating: "4,7",
    reviews: 184,
    category: "Fantasia",
    cover:
      "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=600&q=85",
    tone: "bg-indigo-100",
    description:
      "Entre a vida e a morte existe uma biblioteca infinita. Cada livro oferece a Nora Seed a chance de experimentar uma vida diferente e descobrir o que realmente faz uma vida valer a pena.",
    pages: 308,
    comments: [
      {
        name: "Camila F.",
        text: "Uma história sensível que faz pensar nas possibilidades da vida.",
        rating: 4,
      },
    ],
  },
];

export const categories = [
  "Todos",
  "Romance",
  "Ficção",
  "Fantasia",
  "Desenvolvimento",
];

export const initialComments = [
  {
    id: 1,
    name: "Mariana Costa",
    text: "Adorei descobrir livros novos por aqui. As avaliações ajudam muito!",
    initials: "MC",
  },
  {
    id: 2,
    name: "Rafael Lima",
    text: "Minha próxima leitura já está na lista. Interface simples de usar!",
    initials: "RL",
  },
];
