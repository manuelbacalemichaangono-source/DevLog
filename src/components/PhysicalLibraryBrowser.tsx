import React, { useState } from 'react';
import {
  ChevronRight,
  ArrowLeft,
  Compass,
  BookOpen,
  MapPin,
  Barcode,
  ArrowLeftRight,
  Eye,
  BookmarkCheck,
  RotateCcw,
  BookPlus,
  Check,
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import {
  LibrarySection,
  LibraryTheme,
  LibraryShelf,
  Book,
  BookCopy,
} from '../types/library';

interface PhysicalLibraryBrowserProps {
  onQuickLoanBookCopy: (book: Book, copy?: BookCopy) => void;
  onSelectBookForDetail: (book: Book) => void;
  onOpenNewBook: () => void;
  onOpenReturnBook: () => void;
  onOpenReserveCopyModal?: (book: Book, copy: BookCopy) => void;
}

type NavigationLevel = 1 | 2 | 3 | 4 | 5;

export const PhysicalLibraryBrowser: React.FC<PhysicalLibraryBrowserProps> = ({
  onQuickLoanBookCopy,
  onSelectBookForDetail,
  onOpenNewBook,
  onOpenReturnBook,
  onOpenReserveCopyModal,
}) => {
  const {
    sections,
    books,
    returnCopy,
    cancelReservation,
    reservations,
    claimReservation,
  } = useLibrary();

  // Consultation en 5 niveaux physiques
  // 1. Sections -> 2. Thématiques -> 3. Étagères -> 4. Livres -> 5. Exemplaires
  const [level, setLevel] = useState<NavigationLevel>(1);
  const [selectedSection, setSelectedSection] = useState<LibrarySection | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<LibraryTheme | null>(null);
  const [selectedShelf, setSelectedShelf] = useState<LibraryShelf | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Gestion des changements de niveau
  const handleSelectSection = (sec: LibrarySection) => {
    setSelectedSection(sec);
    setSelectedTheme(null);
    setSelectedShelf(null);
    setSelectedBook(null);
    setLevel(2);
  };

  const handleSelectTheme = (thm: LibraryTheme) => {
    setSelectedTheme(thm);
    setSelectedShelf(null);
    setSelectedBook(null);
    setLevel(3);
  };

  const handleSelectShelf = (shf: LibraryShelf) => {
    setSelectedShelf(shf);
    setSelectedBook(null);
    setLevel(4);
  };

  const handleSelectBook = (bk: Book) => {
    setSelectedBook(bk);
    setLevel(5);
  };

  const handleGoBack = () => {
    if (level === 5) {
      setSelectedBook(null);
      setLevel(4);
    } else if (level === 4) {
      setSelectedShelf(null);
      setLevel(3);
    } else if (level === 3) {
      setSelectedTheme(null);
      setLevel(2);
    } else if (level === 2) {
      setSelectedSection(null);
      setLevel(1);
    }
  };

  const handleJumpToLevel = (targetLevel: NavigationLevel) => {
    if (targetLevel === level) return;
    if (targetLevel === 1) {
      setSelectedSection(null);
      setSelectedTheme(null);
      setSelectedShelf(null);
      setSelectedBook(null);
    } else if (targetLevel === 2) {
      setSelectedTheme(null);
      setSelectedShelf(null);
      setSelectedBook(null);
    } else if (targetLevel === 3) {
      setSelectedShelf(null);
      setSelectedBook(null);
    } else if (targetLevel === 4) {
      setSelectedBook(null);
    }
    setLevel(targetLevel);
  };

  // Sélections actives et livres correspondants
  const shelfBooks = selectedShelf
    ? books.filter((b) => b.shelfId === selectedShelf.id)
    : [];

  const currentLiveBook = selectedBook
    ? books.find((b) => b.id === selectedBook.id) || selectedBook
    : null;

  return (
    <div className="space-y-4">
      {/* ======================================================== */}
      {/* 1. BARRE D'ACTIONS SOUS L'EN-TÊTE (SEULEMENT NIVEAU 1)    */}
      {/* Deux boutons bien séparés, de même taille :             */}
      {/* « Ranger un livre » et « Retourner un livre ».           */}
      {/* Sur mobile, ils tiennent sur une ligne ou s'empilent.    */}
      {/* Ne se répète PAS dans la navigation (niveaux 2, 3, 4, 5).*/}
      {/* ======================================================== */}
      {level === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
          <button
            type="button"
            onClick={onOpenNewBook}
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-sm active:scale-[0.99] border border-slate-800 cursor-pointer"
          >
            <BookPlus className="w-4 h-4 shrink-0 text-indigo-400" />
            <span>Ranger un livre</span>
          </button>

          <button
            type="button"
            onClick={onOpenReturnBook}
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-sm active:scale-[0.99] border border-indigo-700 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 shrink-0 text-white" />
            <span>Retourner un livre</span>
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. PANNEAU D'ORIENTATION ET FIL D'ARIANE PHYSIQUE         */}
      {/* ======================================================== */}
      <div className="bg-slate-900 text-white rounded-xl border border-slate-800 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono tracking-wider text-indigo-300 uppercase">
                  Orientation physique de la médiathèque
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-[11px] font-mono tabular-nums text-slate-400">
                  Niveau {level} sur 5
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white mt-0.5">
                {level === 1 && '1. Choix de la Section'}
                {level === 2 && `2. Thématiques de la ${selectedSection?.code}`}
                {level === 3 && `3. Étagères de « ${selectedTheme?.name} »`}
                {level === 4 && `4. Livres rangés sur « ${selectedShelf?.name} »`}
                {level === 5 && `5. Exemplaires de « ${currentLiveBook?.title} »`}
              </h2>
            </div>
          </div>

          {/* Bouton de retour dans l'arborescence (niveaux 2, 3, 4, 5) */}
          {level > 1 && (
            <button
              onClick={handleGoBack}
              className="self-start sm:self-auto px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700 shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>
                {level === 2 && 'Retour aux Sections'}
                {level === 3 && 'Retour aux Thématiques'}
                {level === 4 && 'Retour aux Étagères'}
                {level === 5 && 'Retour aux Livres'}
              </span>
            </button>
          )}
        </div>

        {/* Fil d'ariane interactif */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => handleJumpToLevel(1)}
            className={`transition-colors font-medium cursor-pointer ${
              level === 1 ? 'text-indigo-400 font-semibold underline' : 'text-slate-400 hover:text-white'
            }`}
          >
            Bibliothèque
          </button>

          {selectedSection && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <button
                onClick={() => handleJumpToLevel(2)}
                className={`transition-colors font-medium truncate max-w-xs cursor-pointer ${
                  level === 2 ? 'text-indigo-400 font-semibold underline' : 'text-slate-400 hover:text-white'
                }`}
              >
                {selectedSection.code}
              </button>
            </>
          )}

          {selectedTheme && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <button
                onClick={() => handleJumpToLevel(3)}
                className={`transition-colors font-medium truncate max-w-xs cursor-pointer ${
                  level === 3 ? 'text-indigo-400 font-semibold underline' : 'text-slate-400 hover:text-white'
                }`}
              >
                {selectedTheme.name}
              </button>
            </>
          )}

          {selectedShelf && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <button
                onClick={() => handleJumpToLevel(4)}
                className={`transition-colors font-medium truncate max-w-xs cursor-pointer ${
                  level === 4 ? 'text-indigo-400 font-semibold underline' : 'text-slate-400 hover:text-white'
                }`}
              >
                {selectedShelf.name}
              </button>
            </>
          )}

          {selectedBook && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span className="text-indigo-300 font-semibold truncate max-w-xs">
                {selectedBook.title}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. VUE PAR NIVEAU                                         */}
      {/* ======================================================== */}
      <div className="relative overflow-hidden min-h-[460px]">
        {/* ======================================================== */}
        {/* NIVEAU 1: SECTIONS                                       */}
        {/* ======================================================== */}
        {level === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Sélectionnez une section pour parcourir ses rayons :</span>
              <span className="font-mono tabular-nums">{sections.length} sections ouvertes</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sections.map((section) => {
                const sectionBooks = books.filter((b) => b.sectionId === section.id);
                const sectionCopies = sectionBooks.flatMap((b) => b.copies || []);
                const availableCount = sectionCopies.filter((c) => c.status === 'Disponible').length;

                return (
                  <button
                    key={section.id}
                    onClick={() => handleSelectSection(section)}
                    className="group bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden cursor-pointer"
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-1.5"
                      style={{ backgroundColor: section.color }}
                    />

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                          {section.code}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mt-3 group-hover:text-indigo-600 transition-colors">
                        {section.name}
                      </h3>

                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                        {section.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{section.themes.length} thématiques</span>
                      <span className="font-mono tabular-nums font-semibold text-emerald-700">
                        {availableCount} dispo / {sectionCopies.length} ex.
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* NIVEAU 2: THÉMATIQUES                                     */}
        {/* ======================================================== */}
        {level === 2 && selectedSection && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="flex items-center justify-between text-xs text-slate-600 px-1">
              <div>
                <span>Vous êtes dans la </span>
                <strong className="text-slate-900">{selectedSection.code} : {selectedSection.name}</strong>
              </div>
              <span className="font-mono tabular-nums">{selectedSection.themes.length} thématiques</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedSection.themes.map((theme) => {
                const themeBooks = books.filter((b) => b.themeId === theme.id);
                const themeCopies = themeBooks.flatMap((b) => b.copies || []);
                const availableCount = themeCopies.filter((c) => c.status === 'Disponible').length;

                return (
                  <button
                    key={theme.id}
                    onClick={() => handleSelectTheme(theme)}
                    className="group bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                          Rayon
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 mt-2 group-hover:text-indigo-600 transition-colors">
                        {theme.name}
                      </h3>

                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {theme.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{theme.shelves.length} étagères</span>
                      <span className="font-mono tabular-nums font-semibold text-emerald-700">
                        {availableCount} dispo / {themeCopies.length} ex.
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* NIVEAU 3: ÉTAGÈRES (AVEC NUMÉRO)                          */}
        {/* ======================================================== */}
        {level === 3 && selectedTheme && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="flex items-center justify-between text-xs text-slate-600 px-1">
              <div>
                <span>Thématique : </span>
                <strong className="text-slate-900">{selectedTheme.name}</strong>
                <span className="text-slate-400"> ({selectedSection?.code})</span>
              </div>
              <span className="font-mono tabular-nums">{selectedTheme.shelves.length} étagère(s)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedTheme.shelves.map((shelf) => {
                const booksOnShelf = books.filter((b) => b.shelfId === shelf.id);
                const shelfCopies = booksOnShelf.flatMap((b) => b.copies || []);
                const availableCount = shelfCopies.filter((c) => c.status === 'Disponible').length;

                return (
                  <button
                    key={shelf.id}
                    onClick={() => handleSelectShelf(shelf)}
                    className="group bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-mono font-bold text-xs flex items-center justify-center">
                          {shelf.shelfNumber}
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 mt-3 group-hover:text-indigo-600 transition-colors">
                        {shelf.name}
                      </h3>

                      <p className="text-xs text-slate-500 mt-1">
                        Rangée physique #{shelf.shelfNumber}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-mono tabular-nums">
                        {booksOnShelf.length} livre(s) rangé(s)
                      </span>
                      <span
                        className={`font-mono tabular-nums font-semibold ${
                          availableCount > 0 ? 'text-emerald-700' : 'text-slate-500'
                        }`}
                      >
                        {availableCount} dispo / {shelfCopies.length} ex.
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* NIVEAU 4: TITRES (LIVRES SUR CETTE ÉTAGÈRE)               */}
        {/* Règle : Affiche le titre, et l'auteur en dessous en plus  */}
        {/* petit. Pas de bouton « Ranger un livre » répété ici.      */}
        {/* ======================================================== */}
        {level === 4 && selectedShelf && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="flex items-center justify-between text-xs text-slate-600 px-1">
              <div>
                <span>Ouvrages rangés sur l'</span>
                <strong className="text-slate-900">{selectedShelf.name}</strong>
                <span className="text-slate-400"> ({selectedTheme?.name})</span>
              </div>
              <span className="font-mono tabular-nums">{shelfBooks.length} ouvrage(s)</span>
            </div>

            {shelfBooks.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-slate-900">Cette étagère est vide</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Aucun ouvrage n’est encore rangé sur cette étagère précise.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                {shelfBooks.map((book) => {
                  const copies = book.copies || [];
                  const countDisp = copies.filter((c) => c.status === 'Disponible').length;
                  const countIndisp = copies.filter(
                    (c) => c.status === 'Indisponible' || c.status === 'Non disponible'
                  ).length;
                  const countRes = copies.filter((c) => c.status === 'Réservé').length;

                  return (
                    <button
                      key={book.id}
                      onClick={() => handleSelectBook(book)}
                      className="w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Dos du livre stylisé */}
                        <div
                          className="w-9 h-12 rounded shadow-xs flex items-center justify-center text-white shrink-0 font-mono text-[10px] font-bold"
                          style={{ backgroundColor: book.coverAccent || '#1e293b' }}
                        >
                          {book.publishedYear}
                        </div>

                        <div className="min-w-0">
                          {/* Titre */}
                          <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                            {book.title}
                          </div>

                          {/* Auteur en dessous en plus petit */}
                          <div className="text-xs text-slate-500 mt-0.5 truncate">
                            {book.author}
                          </div>

                          {/* Cote Dewey */}
                          <div className="text-[11px] text-slate-400 font-mono tabular-nums mt-0.5">
                            Cote {book.deweyCode} · {book.publisher}
                          </div>
                        </div>
                      </div>

                      {/* Badges d'état résumés */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium">
                          {countDisp > 0 && (
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                              {countDisp} dispo
                            </span>
                          )}
                          {countIndisp > 0 && (
                            <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-mono">
                              {countIndisp} indispo
                            </span>
                          )}
                          {countRes > 0 && (
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-mono">
                              {countRes} réservé
                            </span>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* NIVEAU 5: EXEMPLAIRES PHYSIQUES DU LIVRE                  */}
        {/* RÈGLES STRICTES :                                         */}
        {/* Les 3 états :                                             */}
        {/* - « Disponible » (vert) : boutons « Emprunter » & « Réserver » */}
        {/* - « Indisponible » (rouge) : pas de bouton d'emprunt      */}
        {/* - « Réservé » (orange) : pas d'emprunt pour autres pers.  */}
        {/* ======================================================== */}
        {level === 5 && currentLiveBook && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
            {/* Carte d'en-tête de l'ouvrage */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div
                    className="w-12 h-16 rounded-md shadow-md flex items-center justify-center text-white shrink-0 font-mono text-xs font-bold"
                    style={{ backgroundColor: currentLiveBook.coverAccent || '#1e293b' }}
                  >
                    {currentLiveBook.publishedYear}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 font-bold block">
                      {currentLiveBook.genre}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 leading-tight mt-0.5">
                      {currentLiveBook.title}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      {currentLiveBook.author} · {currentLiveBook.publisher} ({currentLiveBook.publishedYear})
                    </p>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 max-w-xl">
                      {currentLiveBook.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onSelectBookForDetail(currentLiveBook)}
                  className="px-3 py-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 shrink-0 self-start sm:self-auto font-medium cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Notice complète</span>
                </button>
              </div>

              {/* Positionnement physique exact */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Emplacement exact : </span>
                <span className="font-semibold text-slate-900">
                  {selectedSection?.code} &gt; {selectedTheme?.name} &gt; {selectedShelf?.name}
                </span>
                <span className="text-slate-400 font-mono">· Cote {currentLiveBook.deweyCode}</span>
              </div>
            </div>

            {/* En-tête de la liste des exemplaires */}
            <div className="flex items-center justify-between text-xs text-slate-600 px-1">
              <span className="font-semibold text-slate-900">
                Exemplaires physiques ({currentLiveBook.copies?.length || 0}) :
              </span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Disponible</span>
                </span>
                <span className="flex items-center gap-1 text-rose-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>Indisponible</span>
                </span>
                <span className="flex items-center gap-1 text-amber-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>Réservé</span>
                </span>
              </div>
            </div>

            {/* Liste des exemplaires */}
            <div className="space-y-3">
              {(currentLiveBook.copies || []).map((copy) => {
                const isDisponible = copy.status === 'Disponible';
                const isIndisponible = copy.status === 'Indisponible' || copy.status === 'Non disponible';
                const isReserve = copy.status === 'Réservé';

                const activeRes = reservations.find(
                  (r) =>
                    (r.copyId === copy.id || (r.bookId === currentLiveBook.id && (!r.copyId || r.copyId === copy.id))) &&
                    r.status === 'Réservé'
                );

                return (
                  <div
                    key={copy.id}
                    className={`bg-white rounded-xl border p-4 transition-all shadow-xs ${
                      isDisponible
                        ? 'border-emerald-200/80 bg-white'
                        : isIndisponible
                        ? 'border-rose-200/80 bg-rose-50/20'
                        : 'border-amber-200/80 bg-amber-50/20'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        {/* Numéro et Badge d'état strict en couleur */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                            {copy.copyNumber}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                            {copy.exactLocation}
                          </h4>

                          {/* État 1 : « Disponible » (vert) */}
                          {isDisponible && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              <span>Disponible</span>
                            </span>
                          )}

                          {/* État 2 : « Indisponible » (rouge) */}
                          {isIndisponible && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300 inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                              <span>Indisponible</span>
                            </span>
                          )}

                          {/* État 3 : « Réservé » (orange) */}
                          {isReserve && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                              <span>Réservé</span>
                            </span>
                          )}
                        </div>

                        {/* Informations complémentaires */}
                        <div className="mt-2 text-xs text-slate-500 flex flex-wrap items-center gap-2">
                          <span className="font-mono tabular-nums flex items-center gap-1">
                            <Barcode className="w-3 h-3 text-slate-400" />
                            <span>{copy.barcode}</span>
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>État physique : <strong className="text-slate-700">{copy.condition}</strong></span>

                          {isIndisponible && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-rose-700 font-medium">
                                Prêté à <strong className="text-rose-900">{copy.borrowerName || 'un adhérent'}</strong>
                              </span>
                            </>
                          )}

                          {isReserve && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-amber-800 font-medium">
                                Réservé pour <strong className="text-amber-950">{copy.reservedForName || activeRes?.memberName || 'un adhérent'}</strong>
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions selon l'état :
                          - Disponible : boutons « Emprunter » et « Réserver ».
                          - Indisponible : pas de bouton d'emprunt.
                          - Réservé : pas de bouton d'emprunt pour les autres personnes. */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isDisponible && (
                          <>
                            <button
                              onClick={() => onQuickLoanBookCopy(currentLiveBook, copy)}
                              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              <ArrowLeftRight className="w-3.5 h-3.5" />
                              <span>Emprunter</span>
                            </button>

                            {onOpenReserveCopyModal && (
                              <button
                                onClick={() => onOpenReserveCopyModal(currentLiveBook, copy)}
                                className="px-3.5 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <BookmarkCheck className="w-3.5 h-3.5" />
                                <span>Réserver</span>
                              </button>
                            )}
                          </>
                        )}

                        {isIndisponible && (
                          <button
                            onClick={() => returnCopy(currentLiveBook.id, copy.id)}
                            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Retourner</span>
                          </button>
                        )}

                        {isReserve && activeRes && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => claimReservation(activeRes.id)}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                              title={`Retirer le prêt au nom de ${activeRes.memberName}`}
                            >
                              <ArrowLeftRight className="w-3.5 h-3.5" />
                              <span>Retirer le prêt ({activeRes.memberName})</span>
                            </button>
                            <button
                              onClick={() => cancelReservation(activeRes.id)}
                              className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                            >
                              Annuler
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
