import React, { useState, useEffect } from 'react';
import { X, BookPlus, RefreshCw, MapPin } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { Book, BookGenre } from '../types/library';

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookToEdit?: Book | null;
  initialLocation?: {
    sectionId?: string;
    themeId?: string;
    shelfId?: string;
  };
}

export const BookModal: React.FC<BookModalProps> = ({
  isOpen,
  onClose,
  bookToEdit,
  initialLocation,
}) => {
  const { sections, addBook, updateBook } = useLibrary();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState<BookGenre>('Roman');
  const [publishedYear, setPublishedYear] = useState<number>(new Date().getFullYear());
  const [publisher, setPublisher] = useState('');
  const [isbn, setIsbn] = useState('');
  const [deweyCode, setDeweyCode] = useState('843.92');

  // Physical Location
  const [sectionId, setSectionId] = useState('sec-a');
  const [themeId, setThemeId] = useState('theme-a-1');
  const [shelfId, setShelfId] = useState('shelf-a-1-1');

  const [totalCopies, setTotalCopies] = useState<number>(2);
  const [pages, setPages] = useState<number>(280);
  const [description, setDescription] = useState('');
  const [coverAccent, setCoverAccent] = useState('#1e3a8a');

  useEffect(() => {
    if (bookToEdit) {
      setTitle(bookToEdit.title);
      setAuthor(bookToEdit.author);
      setGenre(bookToEdit.genre);
      setPublishedYear(bookToEdit.publishedYear);
      setPublisher(bookToEdit.publisher);
      setIsbn(bookToEdit.isbn);
      setDeweyCode(bookToEdit.deweyCode);
      setSectionId(bookToEdit.sectionId || 'sec-a');
      setThemeId(bookToEdit.themeId || 'theme-a-1');
      setShelfId(bookToEdit.shelfId || 'shelf-a-1-1');
      setTotalCopies(bookToEdit.totalCopies);
      setPages(bookToEdit.pages);
      setDescription(bookToEdit.description);
      setCoverAccent(bookToEdit.coverAccent);
    } else {
      setTitle('');
      setAuthor('');
      setGenre('Roman');
      setPublishedYear(new Date().getFullYear());
      setPublisher('');
      setIsbn(generateRandomIsbn());
      setDeweyCode('843.92');
      setSectionId(initialLocation?.sectionId || 'sec-a');
      setThemeId(initialLocation?.themeId || 'theme-a-1');
      setShelfId(initialLocation?.shelfId || 'shelf-a-1-1');
      setTotalCopies(2);
      setPages(250);
      setDescription('');
      setCoverAccent('#1e3a8a');
    }
  }, [bookToEdit, isOpen, initialLocation]);

  if (!isOpen) return null;

  function generateRandomIsbn() {
    const p1 = Math.floor(100 + Math.random() * 900);
    const p2 = Math.floor(100000 + Math.random() * 900000);
    const check = Math.floor(Math.random() * 10);
    return `978-2${p1}${p2}${check}`.replace(/(\d{3})-(\d)(\d{3})(\d{5})(\d)/, '$1-$2$3-$4-$5');
  }

  const selectedSection = sections.find((s) => s.id === sectionId) || sections[0];
  const selectedTheme = selectedSection?.themes.find((t) => t.id === themeId) || selectedSection?.themes[0];
  const selectedShelf = selectedTheme?.shelves.find((sh) => sh.id === shelfId) || selectedTheme?.shelves[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !isbn.trim()) return;

    const finalShelfLocation = `${selectedSection?.code || 'Section'} > ${selectedTheme?.name || 'Thème'} > ${selectedShelf?.name || 'Étagère'}`;

    if (bookToEdit) {
      updateBook(bookToEdit.id, {
        title: title.trim(),
        author: author.trim(),
        genre,
        publishedYear: Number(publishedYear),
        publisher: publisher.trim() || 'Éditions Diverses',
        isbn: isbn.trim(),
        deweyCode: deweyCode.trim(),
        sectionId: selectedSection.id,
        sectionName: `${selectedSection.code} : ${selectedSection.name}`,
        themeId: selectedTheme.id,
        themeName: selectedTheme.name,
        shelfId: selectedShelf.id,
        shelfName: selectedShelf.name,
        shelfLocation: finalShelfLocation,
        totalCopies: Number(totalCopies),
        pages: Number(pages),
        description: description.trim(),
        coverAccent,
      });
    } else {
      addBook({
        title: title.trim(),
        author: author.trim(),
        genre,
        publishedYear: Number(publishedYear),
        publisher: publisher.trim() || 'Éditions Diverses',
        isbn: isbn.trim(),
        deweyCode: deweyCode.trim(),
        sectionId: selectedSection.id,
        sectionName: `${selectedSection.code} : ${selectedSection.name}`,
        themeId: selectedTheme.id,
        themeName: selectedTheme.name,
        shelfId: selectedShelf.id,
        shelfName: selectedShelf.name,
        shelfLocation: finalShelfLocation,
        totalCopies: Number(totalCopies),
        pages: Number(pages),
        description: description.trim(),
        coverAccent,
        language: 'Français',
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 max-w-xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BookPlus className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {bookToEdit ? 'Modifier la notice de l’ouvrage' : 'Ranger un nouvel ouvrage dans la bibliothèque'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {/* Physical Location in Library */}
          <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 space-y-2">
            <div className="flex items-center gap-1.5 text-indigo-900 font-bold">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              <span>Emplacement physique en rayon (Navigation en 5 niveaux)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Section :</label>
                <select
                  value={sectionId}
                  onChange={(e) => {
                    const nextSecId = e.target.value;
                    setSectionId(nextSecId);
                    const sec = sections.find((s) => s.id === nextSecId);
                    if (sec && sec.themes[0]) {
                      setThemeId(sec.themes[0].id);
                      if (sec.themes[0].shelves[0]) {
                        setShelfId(sec.themes[0].shelves[0].id);
                      }
                    }
                  }}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs"
                >
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Thématique :</label>
                <select
                  value={themeId}
                  onChange={(e) => {
                    const nextThmId = e.target.value;
                    setThemeId(nextThmId);
                    const thm = selectedSection?.themes.find((t) => t.id === nextThmId);
                    if (thm && thm.shelves[0]) {
                      setShelfId(thm.shelves[0].id);
                    }
                  }}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs"
                >
                  {(selectedSection?.themes || []).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Étagère :</label>
                <select
                  value={shelfId}
                  onChange={(e) => setShelfId(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs"
                >
                  {(selectedTheme?.shelves || []).map((sh) => (
                    <option key={sh.id} value={sh.id}>
                      {sh.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-800 mb-1">Titre de l’ouvrage *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex : Peter Pan"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            {/* Author */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Auteur(e) principal(e) *</label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Ex : J.M. Barrie"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            {/* Genre */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Genre littéraire *</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value as BookGenre)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              >
                <option value="Roman">Roman</option>
                <option value="Science-Fiction">Science-Fiction</option>
                <option value="Histoire">Histoire</option>
                <option value="Bande Dessinée">Bande Dessinée</option>
                <option value="Philosophie">Philosophie</option>
                <option value="Sciences">Sciences</option>
                <option value="Jeunesse">Jeunesse</option>
                <option value="Policier & Thriller">Policier & Thriller</option>
                <option value="Poésie">Poésie</option>
                <option value="Art & Architecture">Art & Architecture</option>
              </select>
            </div>

            {/* ISBN */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-800">Code ISBN *</label>
                <button
                  type="button"
                  onClick={() => setIsbn(generateRandomIsbn())}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Générer</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="978-2070400812"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
              />
            </div>

            {/* Dewey Code */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Cote de rangement (Dewey)</label>
              <input
                type="text"
                value={deweyCode}
                onChange={(e) => setDeweyCode(e.target.value)}
                placeholder="823.912 BAR"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
              />
            </div>

            {/* Publisher */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Maison d’édition</label>
              <input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                placeholder="Gallimard, Le Livre de Poche..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            {/* Year */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Année de publication</label>
              <input
                type="number"
                value={publishedYear}
                onChange={(e) => setPublishedYear(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono tabular-nums"
              />
            </div>

            {/* Total Copies */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Nombre d’exemplaires physiques *</label>
              <input
                type="number"
                min="1"
                max="50"
                required
                value={totalCopies}
                onChange={(e) => setTotalCopies(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono tabular-nums"
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Chaque exemplaire sera numéroté sur cette étagère.
              </span>
            </div>

            {/* Pages */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Nombre de pages</label>
              <input
                type="number"
                min="1"
                value={pages}
                onChange={(e) => setPages(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono tabular-nums"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-800 mb-1">Résumé / Quatrième de couverture</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brève présentation du livre..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
            >
              {bookToEdit ? 'Enregistrer les modifications' : 'Placer sur l’étagère'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
