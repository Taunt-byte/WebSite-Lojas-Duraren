import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Header from "./components/Header";
import Hero from "./components/Hero";
import BookCatalog from "./components/BookCatalog";
import CommunitySection from "./components/CommunitySection";
import Footer from "./components/Footer";
import BookDetails from "./components/BookDetails";
import CommunityForum from "./components/CommunityForum";
import Recommendations from "./components/Recommendations";
import AccountDialog, { PreferencesDialog } from "./components/AccountDialog";
import BookRegistrationDialog from "./components/BookRegistrationDialog";
import { books as catalogBooks, initialComments } from "./data/books";
import { categories } from "./data/books";
import { apiRequest } from "./utils/api";

function App() {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("duraren-theme") === "dark",
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [books, setBooks] = useState(catalogBooks);
  const [recommendationBooks, setRecommendationBooks] = useState(catalogBooks);
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(initialComments);
  const [selectedBook, setSelectedBook] = useState(null);
  const [page, setPage] = useState(() =>
    window.location.pathname === "/comunidade" ? "community" : "home",
  );
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [preferencesDialogOpen, setPreferencesDialogOpen] = useState(false);
  const [bookDialogOpen, setBookDialogOpen] = useState(false);
  const [backendError, setBackendError] = useState("");

  useEffect(() => {
    localStorage.setItem("duraren-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([apiRequest("/books"), apiRequest("/comments")])
      .then(([bookResult, commentResult]) => {
        if (cancelled) return;
        setBooks(bookResult.books);
        setComments(commentResult.comments);
        setBackendError("");
      })
      .catch(() => {
        if (!cancelled) setBackendError("Não foi possível conectar ao backend. Inicie-o com npm run server e atualize a página.");
      });
    apiRequest("/auth/me")
      .then(({ user: currentUser }) => { if (!cancelled) setUser(currentUser); })
      .catch(() => { if (!cancelled) setUser(null); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!user) {
      setRecommendationBooks(books);
      return;
    }
    let cancelled = false;
    apiRequest("/recommendations")
      .then(({ books: recommended }) => { if (!cancelled) setRecommendationBooks(recommended); })
      .catch(() => { if (!cancelled) setRecommendationBooks(books); });
    return () => { cancelled = true; };
  }, [user, books]);

  useEffect(() => {
    const handleHistoryChange = () => {
      const nextPage =
        window.location.pathname === "/comunidade" ? "community" : "home";
      setPage(nextPage);
      setSelectedBook(null);
      if (nextPage === "home") setCategory("Todos");
    };
    window.addEventListener("popstate", handleHistoryChange);
    return () => window.removeEventListener("popstate", handleHistoryChange);
  }, []);

  const filteredBooks = useMemo(
    () =>
      books.filter(
        (book) =>
          (category === "Todos" || book.category === category) &&
          `${book.title} ${book.author}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [books, category, query],
  );

  const addComment = async (event) => {
    event.preventDefault();
    const text = comment.trim();
    if (!text) return;
    if (!user) { setAccountDialogOpen(true); return; }
    try {
      const { comment: savedComment } = await apiRequest("/comments", { method: "POST", body: { text } });
      setComments((currentComments) => [savedComment, ...currentComments]);
      setComment("");
    } catch (error) {
      setBackendError(error.message);
    }
  };

  const toggleFavorite = (bookId) => {
    setFavorites((currentFavorites) =>
      currentFavorites.includes(bookId)
        ? currentFavorites.filter((id) => id !== bookId)
        : [...currentFavorites, bookId],
    );
  };

  const goHome = () => {
    if (window.location.pathname !== "/") window.history.pushState({}, "", "/");
    setSelectedBook(null);
    setPage("home");
    setCategory("Todos");
  };

  const goCommunity = () => {
    if (window.location.pathname !== "/comunidade")
      window.history.pushState({}, "", "/comunidade");
    setSelectedBook(null);
    setPage("community");
  };

  const showGenre = (genre) => {
    if (window.location.pathname === "/comunidade")
      window.history.pushState({}, "", "/");
    setCategory(genre);
    setSelectedBook(null);
    setPage("catalog");
  };

  const handleAuthenticate = async (credentials) => {
    const { user: account } = await apiRequest(`/auth/${credentials.mode === "register" ? "register" : "login"}`, { method: "POST", body: credentials });
    setUser(account);
    setAccountDialogOpen(false);
    if (!account.preferences.length) setPreferencesDialogOpen(true);
  };

  const handleSavePreferences = async (preferences) => {
    const { user: updatedUser } = await apiRequest("/preferences", { method: "PUT", body: { preferences } });
    setUser(updatedUser);
    setPreferencesDialogOpen(false);
  };

  const handleAddBook = async (book) => {
    const { book: savedBook } = await apiRequest("/books", { method: "POST", body: book });
    setBooks((currentBooks) => [savedBook, ...currentBooks]);
    setCategory("Todos");
    setQuery("");
    setSelectedBook(null);
    setPage("home");
    setBookDialogOpen(false);
    if (window.location.pathname === "/comunidade") window.history.pushState({}, "", "/");
  };

  const handleAddReview = async (bookId, review) => {
    const { comment: savedReview, book: updatedBook } = await apiRequest(`/books/${bookId}/reviews`, { method: "POST", body: review });
    setBooks((currentBooks) => currentBooks.map((book) => book.id === bookId ? updatedBook : book));
    setSelectedBook((currentBook) => currentBook?.id === bookId ? updatedBook : currentBook);
    return savedReview;
  };

  const handleLogout = async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch (error) {
      setBackendError(error.message);
    } finally {
      setUser(null);
    }
  };

  return (
    <div
      className={`min-h-screen bg-[#fbfaf7] text-slate-800 ${darkMode ? "theme-dark dark" : ""}`}
    >
      <Header
        query={query}
        onQueryChange={setQuery}
        cartCount={cart.length}
        onHome={goHome}
        onCommunity={goCommunity}
        onSelectGenre={showGenre}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((currentMode) => !currentMode)}
        user={user}
        onOpenAccount={() => setAccountDialogOpen(true)}
        onOpenPreferences={() => setPreferencesDialogOpen(true)}
        onOpenRegisterBook={() => setBookDialogOpen(true)}
        onLogout={handleLogout}
      />
      {backendError && <div role="status" className="mx-auto mt-4 max-w-7xl px-4 text-sm text-rose-700 sm:px-8">{backendError}</div>}
      <main id="inicio" className="mx-auto max-w-7xl px-4 sm:px-8">
        {page === "community" ? (
          <CommunityForum user={user} onRequireAccount={() => setAccountDialogOpen(true)} />
        ) : selectedBook ? (
          <BookDetails
            book={selectedBook}
            onBack={() => setSelectedBook(null)}
            onAddReview={(review) => handleAddReview(selectedBook.id, review)}
            user={user}
            onRequireAccount={() => setAccountDialogOpen(true)}
            onAddToCart={(book) =>
              setCart((currentCart) => [...currentCart, book])
            }
          />
        ) : page === "catalog" ? (
          <>
            <div className="pt-8 sm:pt-10">
              <button
                onClick={goHome}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#486556] hover:text-[#243d35]"
              >
                ← Voltar ao início
              </button>
              <p className="mt-6 text-xs font-bold uppercase tracking-[.18em] text-[#c67655]">
                Catálogo Duraren
              </p>
              <h1 className="mt-2 font-display text-3xl text-[#243d35] sm:text-4xl">
                {category === "Todos"
                  ? "Todos os livros"
                  : `Livros de ${category}`}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                {filteredBooks.length}{" "}
                {filteredBooks.length === 1
                  ? "livro encontrado"
                  : "livros encontrados"}{" "}
                nesta seleção.
              </p>
            </div>
            <BookCatalog
              books={filteredBooks}
              activeCategory={category}
              onCategoryChange={setCategory}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onAddToCart={(book) =>
                setCart((currentCart) => [...currentCart, book])
              }
              onOpenBook={setSelectedBook}
              title={
                category === "Todos"
                  ? "Explore nosso catálogo"
                  : `Gênero: ${category}`
              }
            />
            <CommunitySection
              comments={comments}
              comment={comment}
              onCommentChange={setComment}
              onSubmitComment={addComment}
            />
          </>
        ) : (
          <>
            <Hero />
          <Recommendations books={recommendationBooks} user={user} onOpenBook={setSelectedBook} onOpenPreferences={() => setPreferencesDialogOpen(true)} onOpenAccount={() => setAccountDialogOpen(true)} />
            <BookCatalog
              books={filteredBooks}
              activeCategory={category}
              onCategoryChange={setCategory}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onAddToCart={(book) =>
                setCart((currentCart) => [...currentCart, book])
              }
              onOpenBook={setSelectedBook}
            />
            <CommunitySection
              comments={comments}
              comment={comment}
              onCommentChange={setComment}
              onSubmitComment={addComment}
            />
          </>
        )}
      </main>
      <Footer />
      {accountDialogOpen && <AccountDialog onClose={() => setAccountDialogOpen(false)} onAuthenticate={handleAuthenticate} />}
      {preferencesDialogOpen && user && <PreferencesDialog initialPreferences={user.preferences} categories={categories.filter((item) => item !== "Todos")} onClose={() => setPreferencesDialogOpen(false)} onSave={handleSavePreferences} />}
      {bookDialogOpen && user && <BookRegistrationDialog onClose={() => setBookDialogOpen(false)} onSave={handleAddBook} />}
    </div>
  );
}

export default App;
