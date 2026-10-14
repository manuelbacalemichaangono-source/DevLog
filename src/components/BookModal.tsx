import React, { useState, useEffect } from 'react';
import { X, BookPlus, RefreshCw } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { Book, BookGenre } from '../types/library';

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookToEdit?: Book | null;
}

export const BookModal: React.FC<BookModalProps> = ({
  isOpen,
  onClose,
  bookToEdit,
}) => {
  const { addBook, updateBook } = useLibrary();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState<BookGenre>('Roman');
  const [publishedYear, setPublishedYear] = useState<number>(new Date().getFullYear());
  const [publisher, setPublisher] = useState('');
  const [isbn, setIsbn] = useState('');
  const [totalCopies, setTotalCopies] = useState<number>(2);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (bookToEdit) {
      setTitle(bookToEdit.title);
      setAuthor(bookToEdit.author);
      setGenre(bookToEdit.genre);
      setPublishedYear(bookToEdit.publishedYear);
      setPublisher(bookToEdit.publisher);
      setIsbn(bookToEdit.isbn);
      setTotalCopies(bookToEdit.totalCopies);
      setDescription(bookToEdit.description);
    } else {
      setTitle('');
      setAuthor('');
      setGenre('Roman');
      setPublishedYear(new Date().getFullYear());
      setPublisher('');
      setIsbn(generateRandomIsbn());
      setTotalCopies(2);
      setDescription('');
    }
  }, [bookToEdit, isOpen]);

  if (!isOpen) return null;

  function generateRandomIsbn() {
    const p1 = Math.floor(100 + Math.random() * 900);
    const p2 = Math.floor(100000 + Math.random() * 900000);
    const check = Math.floor(Math.random() * 10);
    return `978-2-${p1}-${p2}-${check}`;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !isbn.trim()) return;

    if (bookToEdit) {
      updateBook(bookToEdit.id, {
        title: title.trim(),
        author: author.trim(),
        genre,
        publishedYear: Number(publishedYear),
        publisher: publisher.trim() || 'Éditions Diverses',
        isbn: isbn.trim(),
        totalCopies: Number(totalCopies),
        description: description.trim(),
      });
    } else {
      addBook({
        title: title.trim(),
        author: author.trim(),
        genre,
        publishedYear: Number(publishedYear),
        publisher: publisher.trim() || 'Éditions Diverses',
        isbn: isbn.trim(),
        deweyCode: '800',
        sectionId: 'sec-a',
        sectionName: 'Général',
        themeId: 'theme-a-1',
        themeName: 'Littérature',
        shelfId: 'shelf-a-1-1',
        shelfName: 'Rayon 1',
        shelfLocation: 'Rayon principal',
        totalCopies: Number(totalCopies),
        pages: 250,
        description: description.trim(),
        coverAccent: '#1e3a8a',
        language: 'Français',
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BookPlus className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {bookToEdit ? 'Modifier la notice de l’ouvrage' : 'Ajouter un nouvel ouvrage'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Title */}
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-800 mb-1">Titre de l’ouvrage *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex : Le Petit Prince"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
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
                placeholder="Ex : Antoine de Saint-Exupéry"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Publisher */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Maison d’édition *</label>
              <input
                type="text"
                required
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                placeholder="Ex : Gallimard, Seuil..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* ISBN */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-800">Code ISBN *</label>
                <button
                  type="button"
                  onClick={() => setIsbn(generateRandomIsbn())}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
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
                placeholder="978-2-07-040081-2"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Year */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Année de publication</label>
              <input
                type="number"
                value={publishedYear}
                onChange={(e) => setPublishedYear(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono tabular-nums focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Total Copies */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Nombre total d’exemplaires *</label>
              <input
                type="number"
                min="1"
                max="50"
                required
                value={totalCopies}
                onChange={(e) => setTotalCopies(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono tabular-nums focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Genre */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Genre littéraire</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value as BookGenre)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
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

            {/* Description / Summary */}
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-800 mb-1">Résumé / Description de l'ouvrage</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Présentation et résumé de l’histoire ou du contenu..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              {bookToEdit ? 'Enregistrer les modifications' : 'Ajouter l’ouvrage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
