import React, { useState } from 'react';
import {
  BookmarkCheck,
  Plus,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BookOpen,
  MapPin,
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { Reservation } from '../types/library';

interface ReservationsViewProps {
  onOpenNewLoan?: () => void;
}

export const ReservationsView: React.FC<ReservationsViewProps> = () => {
  const { reservations, cancelReservation, claimReservation, books, members, reserveBook } = useLibrary();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');

  const selectedBook = books.find((b) => b.id === selectedBookId);
  const availableCopies = selectedBook?.copies?.filter((c) => c.status === 'Disponible') || [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId || !selectedMemberId) return;

    reserveBook(selectedBookId, selectedMemberId);
    setIsModalOpen(false);
    setSelectedBookId('');
    setSelectedMemberId('');
  };

  const activeReservations = reservations.filter((r) => r.status === 'Réservé');

  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Exemplaires Réservés & Mis de côté ({activeReservations.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Un exemplaire réservé passe à <strong>« Réservé »</strong> (orange). Dès qu'il est retiré par l'adhérent, il passe à <strong>« Non disponible »</strong>.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Réserver un exemplaire</span>
        </button>
      </div>

      {/* Reservations List */}
      {reservations.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <BookmarkCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-900">Aucune réservation active</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Les exemplaires réservés sont mis de côté pour un adhérent sans pouvoir être empruntés par d'autres.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  <th className="py-3 px-4">Ouvrage & Exemplaire réservé</th>
                  <th className="py-3 px-3">Adhérent bénéficiaire</th>
                  <th className="py-3 px-3">Date de réservation</th>
                  <th className="py-3 px-3">Statut actuel</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {reservations.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{res.bookTitle}</div>
                      <div className="text-slate-500 text-[11px] font-mono mt-0.5">
                        Exemplaire n°{res.copyNumber}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 font-medium">
                      {res.memberName}
                    </td>
                    <td className="py-3.5 px-3 font-mono tabular-nums text-slate-500">
                      {res.reservationDate}
                    </td>
                    <td className="py-3.5 px-3">
                      {res.status === 'Réservé' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                          <span>Réservé (mis de côté)</span>
                        </span>
                      ) : res.status === 'Retiré' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-300 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Retiré (Non disponible)</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">Annulée (Disponible)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {res.status === 'Réservé' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => claimReservation(res.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded transition-colors inline-flex items-center gap-1"
                            title="L'adhérent retire le livre : passe à Non disponible"
                          >
                            <span>Retirer le prêt</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => cancelReservation(res.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                            title="Annuler (repasse à Disponible)"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Reservation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-5 shadow-xl">
            <h4 className="text-sm font-bold text-slate-900 mb-1">
              Réserver un exemplaire physique
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              L'exemplaire passera immédiatement à <strong>« Réservé »</strong> et sera mis de côté pour l'adhérent.
            </p>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  1. Sélectionner l'ouvrage :
                </label>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="">-- Choisir un livre --</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.author}) - {b.availableCopies} dispo en rayon
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  2. Adhérent qui réserve :
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="">-- Choisir un adhérent --</option>
                  {members
                    .filter((m) => m.status === 'Actif')
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.firstName} {m.lastName} ({m.memberNumber})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!selectedBookId || !selectedMemberId}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50"
                >
                  Confirmer la réservation (Passer à Réservé)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
