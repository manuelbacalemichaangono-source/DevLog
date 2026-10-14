import React, { useState, useRef } from 'react';
import {
  Settings,
  Save,
  Download,
  Upload,
  RefreshCw,
  FileSpreadsheet,
  Building,
  Clock,
  Euro,
  Layers,
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { LibrarySettings } from '../types/library';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    exportDatabase,
    importDatabase,
    resetToDefaults,
    books,
    loans,
  } = useLibrary();

  const [form, setForm] = useState<LibrarySettings>(settings);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
  };

  // Download JSON backup
  const handleDownloadBackup = () => {
    const jsonStr = exportDatabase();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sauvegarde_bibliotech_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importDatabase(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Export CSV Catalogue
  const handleExportBooksCSV = () => {
    const headers = ['ISBN', 'Titre', 'Auteur', 'Genre', 'Annee', 'Editeur', 'Cote', 'Emplacement', 'Exemplaires_Totaux', 'Exemplaires_Disponibles'];
    const rows = books.map((b) => [
      `"${b.isbn}"`,
      `"${b.title.replace(/"/g, '""')}"`,
      `"${b.author.replace(/"/g, '""')}"`,
      `"${b.genre}"`,
      b.publishedYear,
      `"${b.publisher.replace(/"/g, '""')}"`,
      `"${b.deweyCode}"`,
      `"${b.shelfLocation.replace(/"/g, '""')}"`,
      b.totalCopies,
      b.availableCopies,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `catalogue_livres_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV Prêts
  const handleExportLoansCSV = () => {
    const headers = ['ID_Pret', 'Livre', 'Auteur', 'Adherent', 'Email', 'Date_Pret', 'Date_Retour', 'Statut'];
    const rows = loans.map((l) => [
      `"${l.id}"`,
      `"${l.bookTitle.replace(/"/g, '""')}"`,
      `"${l.bookAuthor.replace(/"/g, '""')}"`,
      `"${l.memberName.replace(/"/g, '""')}"`,
      `"${l.memberEmail}"`,
      l.loanDate,
      l.returnDate || '',
      `"${l.status}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `registre_prets_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* General Settings */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Informations de l’établissement & Quotas
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Nom de la bibliothèque :
              </label>
              <input
                type="text"
                value={form.libraryName}
                onChange={(e) => setForm({ ...form, libraryName: e.target.value })}
                required
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Adresse postale :
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                required
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Quota d’emprunts simultanés par adhérent :
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={form.defaultMaxLoans}
                onChange={(e) => setForm({ ...form, defaultMaxLoans: Number(e.target.value) })}
                required
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono tabular-nums"
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Nombre maximum de livres empruntables à la fois
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Enregistrer les paramètres</span>
            </button>
          </div>
        </form>
      </div>

      {/* Export & Backup */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Exportations & Sauvegardes du Système
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Téléchargez vos données aux formats standards (JSON complet, tableur CSV compatible Excel / LibreOffice).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleDownloadBackup}
            className="p-3 text-left rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <Download className="w-4 h-4 text-indigo-600 mb-2" />
            <div className="font-semibold text-slate-900 text-xs">Sauvegarde JSON complète</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Fonds, adhérents, prêts et historique
            </div>
          </button>

          <button
            onClick={handleExportBooksCSV}
            className="p-3 text-left rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 mb-2" />
            <div className="font-semibold text-slate-900 text-xs">Catalogue en CSV</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Export tableur des {books.length} ouvrages
            </div>
          </button>

          <button
            onClick={handleExportLoansCSV}
            className="p-3 text-left rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-sky-600 mb-2" />
            <div className="font-semibold text-slate-900 text-xs">Registre des prêts en CSV</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Export tableur des emprunts & retards
            </div>
          </button>
        </div>

        {/* Import JSON */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="font-semibold text-slate-900 text-xs">Restaurer un fichier de sauvegarde</div>
            <div className="text-[11px] text-slate-500">
              Restaure l’état complet de l’application depuis un fichier JSON précédemment exporté.
            </div>
          </div>

          <div className="shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Charger un fichier JSON</span>
            </button>
          </div>
        </div>

        {/* Reset */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="font-semibold text-rose-900 text-xs">Réinitialiser les données</div>
            <div className="text-[11px] text-slate-500">
              Recharge le jeu de données d’exemple réaliste (romans, BD, adhérents types et prêts de test).
            </div>
          </div>

          <button
            onClick={() => {
              if (confirm('Voulez-vous vraiment réinitialiser toutes les données avec le jeu de démo d’origine ?')) {
                resetToDefaults();
              }
            }}
            className="px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200 shrink-0 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réinitialiser la démo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
