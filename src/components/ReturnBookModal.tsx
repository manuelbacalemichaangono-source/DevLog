import React, { useState } from 'react';
import { X, RotateCcw, AlertCircle, CheckCircle2, MapPin } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';

interface ReturnBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReturnBookModal: React.FC<ReturnBookModalProps> = ({ isOpen, onClose }) => {
  const { sections, manualReturnBook } = useLibrary();

  const [sectionId, setSectionId] = useState<string>(() => sections[0]?.id || 'sec-a');
  const [themeId, setThemeId] = useState<string>(() => sections[0]?.themes[0]?.id || 'theme-a-1');
  const [shelfId, setShelfId] = useState<string>(
    () => sections[0]?.themes[0]?.shelves[0]?.id || 'shelf-a-1-1'
  );

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [copyNumber, setCopyNumber] = useState<number | ''>(2);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentSection = sections.find((s) => s.id === sectionId) || sections[0];
  const currentThemes = currentSection?.themes || [];
  const currentTheme = currentThemes.find((t) => t.id === themeId) || currentThemes[0];
  const currentShelves = currentTheme?.shelves || [];
  const currentShelf = currentShelves.find((sh) => sh.id === shelfId) || currentShelves[0];

  const handleSectionChange = (newSecId: string) => {
    setSectionId(newSecId);
    const sec = sections.find((s) => s.id === newSecId);
    if (sec && sec.themes[0]) {
      setThemeId(sec.themes[0].id);
      if (sec.themes[0].shelves[0]) {
        setShelfId(sec.themes[0].shelves[0].id);
      }
    }
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleThemeChange = (newThmId: string) => {
    setThemeId(newThmId);
    const thm = currentThemes.find((t) => t.id === newThmId);
    if (thm && thm.shelves[0]) {
      setShelfId(thm.shelves[0].id);
    }
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleShelfChange = (newShelfId: string) => {
    setShelfId(newShelfId);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!title.trim()) {
      setErrorMessage('Veuillez saisir le titre de l’ouvrage.');
      return;
    }

    if (!author.trim()) {
      setErrorMessage('Veuillez saisir l’auteur de l’ouvrage.');
      return;
    }

    if (copyNumber === '' || Number(copyNumber) < 1) {
      setErrorMessage('Veuillez indiquer un numéro d’exemplaire valide (ex : 2).');
      return;
    }

    const res = manualReturnBook({
      sectionId,
      themeId,
      shelfId: currentShelf?.id || shelfId,
      title: title.trim(),
      author: author.trim(),
      copyNumber: Number(copyNumber),
    });

    if (res.success) {
      setSuccessMessage(res.message);
      setErrorMessage(null);
    } else {
      setErrorMessage(res.message);
      setSuccessMessage(null);
    }
  };

  const handleClose = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 max-w-xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* En-tête - Même présentation que la boîte de dialogue « Ranger un livre » */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Retourner un livre</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corps du formulaire */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {/* Alerte Erreur */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Alerte Confirmation Succès */}
          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs space-y-1.5">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-semibold text-sm text-emerald-950">
                  {successMessage}
                </div>
              </div>
              <div className="text-[11px] text-emerald-700 pl-7">
                L'exemplaire est désormais remis sur son étagère et son statut est passé à « Disponible » (ou « Réservé » s'il était attendu).
              </div>
            </div>
          )}

          {/* Emplacement de remise en rayon */}
          <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2.5">
            <div className="flex items-center gap-1.5 text-indigo-900 font-bold">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              <span>Emplacement de rangement en rayon</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Section */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Section :
                </label>
                <select
                  value={sectionId}
                  onChange={(e) => handleSectionChange(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs"
                >
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code}
                    </option>
                  ))}
                </select>
              </div>

              {/* Thématique (dynamique selon la section) */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Thématique :
                </label>
                <select
                  value={themeId}
                  onChange={(e) => handleThemeChange(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs"
                >
                  {currentThemes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Étagère (dynamique selon la thématique, avec son numéro) */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Étagère :
                </label>
                <select
                  value={shelfId}
                  onChange={(e) => handleShelfChange(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs"
                >
                  {currentShelves.map((sh) => (
                    <option key={sh.id} value={sh.id}>
                      {sh.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Informations demandées : Titre, Auteur, Numéro d'exemplaire */}
          <div className="space-y-3 pt-1">
            {/* Titre */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Titre *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                placeholder="Ex : Peter Pan"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Auteur */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Auteur *
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => {
                  setAuthor(e.target.value);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                placeholder="Ex : J.M. Barrie"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Numéro d'exemplaire */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Numéro d'exemplaire *
              </label>
              <input
                type="number"
                min="1"
                required
                value={copyNumber}
                onChange={(e) => {
                  setCopyNumber(e.target.value === '' ? '' : Number(e.target.value));
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                placeholder="Ex : 2"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono tabular-nums focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Indiquez le numéro de l'exemplaire (par ex. exemplaire 2).
              </span>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {successMessage ? 'Fermer' : 'Annuler'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Confirmer le retour</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
