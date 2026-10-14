import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Book,
  Member,
  Loan,
  Reservation,
  LibrarySettings,
  ActivityLog,
  BookCondition,
  LibrarySection,
  BookCopy,
  CopyStatus,
} from '../types/library';
import {
  INITIAL_SETTINGS,
  INITIAL_SECTIONS,
  INITIAL_BOOKS,
  INITIAL_MEMBERS,
  INITIAL_LOANS,
  INITIAL_RESERVATIONS,
  INITIAL_LOGS,
} from '../data/seedData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

interface LibraryContextType {
  sections: LibrarySection[];
  books: Book[];
  members: Member[];
  loans: Loan[];
  reservations: Reservation[];
  settings: LibrarySettings;
  activityLogs: ActivityLog[];
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Book methods
  addBook: (book: Omit<Book, 'id' | 'availableCopies' | 'addedDate' | 'copies'>) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  deleteBook: (id: string) => boolean;

  // Member (Student) methods
  addMember: (member: { firstName: string; lastName: string; memberNumber?: string }) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  deleteMember: (id: string) => boolean;
  renewMemberCard: (id: string) => void;
  verifyStudent: (matricule: string, lastName: string) => { student: Member | null; error?: string };

  // Loan & Return methods (No due dates, no fines, simple status flow)
  borrowBook: (bookId: string, memberId: string, copyId?: string) => { success: boolean; error?: string };
  returnBook: (loanId: string, condition?: BookCondition) => void;
  returnCopy: (bookId: string, copyId: string) => { success: boolean; message: string; isReserved?: boolean };
  manualReturnBook: (params: {
    sectionId: string;
    themeId: string;
    shelfId: string;
    title: string;
    author: string;
    copyNumber: number;
  }) => { success: boolean; message: string; isReserved?: boolean };

  // Reservation methods
  reserveBook: (bookId: string, memberId: string, copyId?: string) => { success: boolean; error?: string };
  cancelReservation: (reservationId: string) => void;
  claimReservation: (reservationId: string) => { success: boolean; error?: string };

  // Settings & System
  updateSettings: (newSettings: LibrarySettings) => void;
  resetToDefaults: () => void;
  exportDatabase: () => string;
  importDatabase: (jsonStr: string) => boolean;

  // Computed metrics
  stats: {
    totalBooks: number;
    totalTitles: number;
    availableCopies: number;
    borrowedCopies: number;
    reservedCopies: number;
    activeLoansCount: number;
    activeReservationsCount: number;
    totalMembers: number;
    activeMembersCount: number;
  };
}

const STORAGE_KEY_PREFIX = 'bibliotech_v4_';

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sections, setSections] = useState<LibrarySection[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}sections`);
    return saved ? JSON.parse(saved) : INITIAL_SECTIONS;
  });

  const [settings, setSettings] = useState<LibrarySettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}settings`);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}books`);
    if (saved) {
      try {
        const parsed: Book[] = JSON.parse(saved);
        return parsed.map((b) => ({
          ...b,
          copies: (b.copies || []).map((c) => ({
            ...c,
            status: ((c.status as string) === 'Non disponible' ? 'Indisponible' : c.status) as CopyStatus,
          })),
        }));
      } catch {
        return INITIAL_BOOKS;
      }
    }
    return INITIAL_BOOKS;
  });

  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}members`);
    if (saved) {
      try {
        const parsed: Member[] = JSON.parse(saved);
        return parsed.map((m) => ({
          ...m,
          memberNumber: (m.memberNumber || '').replace(/^ADH-/, 'ETU-') || `ETU-2024-001`,
        }));
      } catch {
        return INITIAL_MEMBERS;
      }
    }
    return INITIAL_MEMBERS;
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}loans`);
    return saved ? JSON.parse(saved) : INITIAL_LOANS;
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}reservations`);
    return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}logs`);
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  };

  const logActivity = (type: ActivityLog['type'], description: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: 'À l’instant',
      type,
      description,
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  };

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}sections`, JSON.stringify(sections));
  }, [sections]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}settings`, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}books`, JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}members`, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}loans`, JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}reservations`, JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}logs`, JSON.stringify(activityLogs));
  }, [activityLogs]);

  // Book methods
  const addBook = (bookData: Omit<Book, 'id' | 'availableCopies' | 'addedDate' | 'copies'>) => {
    const id = `liv-${Date.now()}`;
    const copies: BookCopy[] = [];
    for (let i = 1; i <= bookData.totalCopies; i++) {
      copies.push({
        id: `${id}-ex-${i}`,
        copyNumber: i,
        bookId: id,
        barcode: `EX-${id.toUpperCase()}-${String(i).padStart(2, '0')}`,
        status: 'Disponible',
        condition: 'Parfait',
        exactLocation: `Exemplaire ${i} de ${bookData.title}, ${bookData.sectionName}, ${bookData.themeName}, ${bookData.shelfName}`,
      });
    }

    const newBook: Book = {
      ...bookData,
      id,
      availableCopies: bookData.totalCopies,
      addedDate: new Date().toISOString().split('T')[0],
      copies,
    };
    setBooks((prev) => [newBook, ...prev]);
    logActivity('book_new', `Nouvel ouvrage rangé dans ${newBook.shelfName} : "${newBook.title}"`);
    addToast('success', 'Ouvrage placé en rayon', `"${newBook.title}" est maintenant disponible.`);
  };

  const updateBook = (id: string, updates: Partial<Book>) => {
    setBooks((prev) =>
      prev.map((book) => {
        if (book.id === id) {
          const updated = { ...book, ...updates };
          if (updates.totalCopies !== undefined && updates.totalCopies !== book.totalCopies) {
            const currentCopies = book.copies || [];
            if (updates.totalCopies > currentCopies.length) {
              const newCopies = [...currentCopies];
              for (let i = currentCopies.length + 1; i <= updates.totalCopies; i++) {
                newCopies.push({
                  id: `${id}-ex-${i}`,
                  copyNumber: i,
                  bookId: id,
                  barcode: `EX-${id.toUpperCase()}-${String(i).padStart(2, '0')}`,
                  status: 'Disponible',
                  condition: 'Bon',
                  exactLocation: `Exemplaire ${i} de ${updated.title}, ${updated.sectionName}, ${updated.themeName}, ${updated.shelfName}`,
                });
              }
              updated.copies = newCopies;
            }
            const free = (updated.copies || []).filter((c) => c.status === 'Disponible').length;
            updated.availableCopies = free;
          }
          return updated;
        }
        return book;
      })
    );
    addToast('info', 'Ouvrage mis à jour', 'Informations modifiées avec succès.');
  };

  const deleteBook = (id: string): boolean => {
    const book = books.find((b) => b.id === id);
    if (!book) return false;

    const hasActiveLoan = loans.some((l) => l.bookId === id && l.status === 'En cours');
    if (hasActiveLoan) {
      addToast('error', 'Suppression impossible', `Des exemplaires de "${book.title}" sont actuellement prêtés.`);
      return false;
    }

    setBooks((prev) => prev.filter((b) => b.id !== id));
    addToast('success', 'Livre retiré', `"${book.title}" a été retiré.`);
    return true;
  };

  // Student methods
  const addMember = (studentData: { firstName: string; lastName: string; memberNumber?: string }) => {
    const id = `etu-${Date.now()}`;
    const year = new Date().getFullYear();
    const count = members.length + 1;
    const memberNumber = studentData.memberNumber?.trim().toUpperCase() || `ETU-${year}-${String(count).padStart(3, '0')}`;

    const newMember: Member = {
      id,
      memberNumber,
      firstName: studentData.firstName.trim(),
      lastName: studentData.lastName.trim(),
      status: 'Actif',
      maxLoans: 5,
    };
    setMembers((prev) => [newMember, ...prev]);
    logActivity('member_new', `Inscription de l’étudiant(e) ${newMember.firstName} ${newMember.lastName} (${memberNumber})`);
    addToast('success', 'Étudiant inscrit', `${newMember.firstName} ${newMember.lastName} a été inscrit(e) sous le matricule ${memberNumber}.`);
  };

  const updateMember = (id: string, updates: Partial<Member>) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    addToast('info', 'Fiche actualisée', 'Données de l’étudiant modifiées avec succès.');
  };

  const deleteMember = (id: string): boolean => {
    const member = members.find((m) => m.id === id);
    if (!member) return false;

    const hasActiveLoans = loans.some((l) => l.memberId === id && l.status === 'En cours');
    if (hasActiveLoans) {
      addToast('error', 'Suppression impossible', `${member.firstName} ${member.lastName} a des livres en cours d'emprunt.`);
      return false;
    }

    setMembers((prev) => prev.filter((m) => m.id !== id));
    addToast('success', 'Étudiant retiré', `Fiche de ${member.firstName} ${member.lastName} supprimée.`);
    return true;
  };

  const renewMemberCard = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          return {
            ...m,
            status: 'Actif',
          };
        }
        return m;
      })
    );
    addToast('success', 'Inscription renouvelée', 'L’accès étudiant a été renouvelé.');
  };

  const verifyStudent = (
    matricule: string,
    lastName: string
  ): { student: Member | null; error?: string } => {
    const clean = (s: string) =>
      s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '')
        .trim();

    const targetMatricule = clean(matricule);
    const targetName = clean(lastName);

    if (!targetMatricule || !targetName) {
      return {
        student: null,
        error:
          'Accès refusé : seuls les étudiants inscrits peuvent emprunter ou réserver un livre. Vous pouvez consulter les livres, mais pas les emprunter.',
      };
    }

    const found = members.find((m) => {
      const mNum = clean(m.memberNumber);
      const mNom = clean(m.lastName);
      const mFull = clean(`${m.firstName} ${m.lastName}`);
      return mNum === targetMatricule && (mNom === targetName || mFull === targetName);
    });

    if (!found) {
      return {
        student: null,
        error:
          'Accès refusé : seuls les étudiants inscrits peuvent emprunter ou réserver un livre. Vous pouvez consulter les livres, mais pas les emprunter.',
      };
    }

    return { student: found };
  };

  // ========================================================
  // LOAN FLOW:
  // 1. When loaned -> copy passes to "Indisponible"
  // ========================================================
  const borrowBook = (
    bookId: string,
    memberId: string,
    copyId?: string
  ): { success: boolean; error?: string } => {
    const book = books.find((b) => b.id === bookId);
    const member = members.find((m) => m.id === memberId);

    if (!book) return { success: false, error: 'Ouvrage introuvable.' };
    if (!member) return { success: false, error: 'Adhérent introuvable.' };

    if (member.status && member.status !== 'Actif') {
      const err = `L’adhésion de ${member.firstName} ${member.lastName} est suspendue ou expirée.`;
      addToast('warning', 'Prêt refusé', err);
      return { success: false, error: err };
    }

    const maxAllowed = member.maxLoans ?? settings.defaultMaxLoans ?? 5;
    const memberActiveLoans = loans.filter((l) => l.memberId === memberId && l.status === 'En cours');
    if (memberActiveLoans.length >= maxAllowed) {
      const err = `Quota atteint : ${memberActiveLoans.length}/${maxAllowed} livres déjà empruntés.`;
      addToast('warning', 'Quota dépassé', err);
      return { success: false, error: err };
    }

    // Locate target copy
    let targetCopy: BookCopy | undefined;
    if (copyId) {
      targetCopy = book.copies?.find((c) => c.id === copyId);
      if (!targetCopy) {
        return { success: false, error: 'Exemplaire introuvable.' };
      }
      if (targetCopy.status === 'Indisponible' || (targetCopy.status as string) === 'Non disponible') {
        const err = 'Cet exemplaire est déjà prêté (Indisponible).';
        addToast('warning', 'Exemplaire indisponible', err);
        return { success: false, error: err };
      }
      if (targetCopy.status === 'Réservé' && targetCopy.reservedForMemberId !== member.id) {
        const err = `Cet exemplaire est réservé pour ${targetCopy.reservedForName || 'un autre lecteur'}.`;
        addToast('warning', 'Exemplaire réservé', err);
        return { success: false, error: err };
      }
    } else {
      // Pick copy reserved for this member if any, or first available copy
      targetCopy =
        book.copies?.find((c) => c.status === 'Réservé' && c.reservedForMemberId === member.id) ||
        book.copies?.find((c) => c.status === 'Disponible');

      if (!targetCopy) {
        const err = `Aucun exemplaire disponible en rayon pour "${book.title}".`;
        addToast('warning', 'Stock indisponible', err);
        return { success: false, error: err };
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const newLoan: Loan = {
      id: `pret-${Date.now()}`,
      bookId: book.id,
      copyId: targetCopy.id,
      copyNumber: targetCopy.copyNumber,
      exactLocation: targetCopy.exactLocation,
      bookTitle: book.title,
      bookAuthor: book.author,
      bookIsbn: book.isbn,
      memberId: member.id,
      memberName: `${member.firstName} ${member.lastName}`,
      memberEmail: member.email || '',
      loanDate: todayStr,
      returnDate: null,
      status: 'En cours',
    };

    // Update copy status to "Indisponible"
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          const updatedCopies = (b.copies || []).map((c) =>
            c.id === targetCopy!.id
              ? {
                  ...c,
                  status: 'Indisponible' as const,
                  borrowerName: `${member.firstName} ${member.lastName}`,
                  reservedForName: undefined,
                  reservedForMemberId: undefined,
                }
              : c
          );
          const availableCount = updatedCopies.filter((c) => c.status === 'Disponible').length;
          return {
            ...b,
            availableCopies: availableCount,
            copies: updatedCopies,
          };
        }
        return b;
      })
    );

    // If there was a reservation for this copy, mark as Retiré
    setReservations((prev) =>
      prev.map((res) =>
        res.copyId === targetCopy!.id && res.status === 'Réservé'
          ? { ...res, status: 'Retiré' }
          : res
      )
    );

    setLoans((prev) => [newLoan, ...prev]);

    logActivity('loan', `Prêt de ${targetCopy.exactLocation} à ${member.firstName} ${member.lastName}`);
    addToast(
      'success',
      'Prêt enregistré',
      `Exemplaire n°${targetCopy.copyNumber} prêté à ${member.firstName} ${member.lastName} (Passé à Indisponible).`
    );

    return { success: true };
  };

  // ========================================================
  // RETURN FLOW:
  // 2. When returned -> copy passes back to "Disponible"
  // ========================================================
  const returnBook = (loanId: string, condition: BookCondition = 'Bon') => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan || loan.status === 'Rendu') return;

    const todayStr = new Date().toISOString().split('T')[0];

    // Check if this copy or book is reserved for someone
    const pendingRes = reservations.find(
      (r) =>
        (r.copyId === loan.copyId || (r.bookId === loan.bookId && (!r.copyId || r.copyId === loan.copyId))) &&
        r.status === 'Réservé'
    );
    const newStatus: CopyStatus = pendingRes ? 'Réservé' : 'Disponible';

    // Set copy to new status
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === loan.bookId) {
          const updatedCopies = (b.copies || []).map((c) => {
            if (c.id === loan.copyId) {
              return {
                ...c,
                status: newStatus,
                condition,
                borrowerName: undefined,
                reservedForName: pendingRes ? pendingRes.memberName : undefined,
                reservedForMemberId: pendingRes ? pendingRes.memberId : undefined,
              };
            }
            return c;
          });
          const availableCount = updatedCopies.filter((c) => c.status === 'Disponible').length;
          return {
            ...b,
            availableCopies: availableCount,
            copies: updatedCopies,
          };
        }
        return b;
      })
    );

    // Mark loan as Rendu
    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId
          ? {
              ...l,
              returnDate: todayStr,
              status: 'Rendu',
              conditionOnReturn: condition,
            }
          : l
      )
    );

    const msg = pendingRes
      ? `Exemplaire n°${loan.copyNumber} de « ${loan.bookTitle} » remis sur son étagère et réservé pour ${pendingRes.memberName}.`
      : `Exemplaire n°${loan.copyNumber} de « ${loan.bookTitle} » remis sur son étagère (Disponible).`;

    logActivity('return', `Retour de l’exemplaire n°${loan.copyNumber} de "${loan.bookTitle}" par ${loan.memberName}`);
    addToast('success', pendingRes ? 'Exemplaire remis & réservé' : 'Exemplaire remis en rayon', msg);
  };

  // ========================================================
  // RETURN COPY TO EXACT SHELF (Manual step-by-step return)
  // 1. Checks that the copy is NOT already 'Disponible'
  // 2. Returns to shelf -> passes to 'Disponible'
  // 3. If reserved for another member -> passes to 'Réservé'
  // ========================================================
  const returnCopy = (
    bookId: string,
    copyId: string
  ): { success: boolean; message: string; isReserved?: boolean } => {
    const book = books.find((b) => b.id === bookId);
    if (!book) return { success: false, message: 'Ouvrage introuvable dans la bibliothèque.' };

    const copy = (book.copies || []).find((c) => c.id === copyId);
    if (!copy) return { success: false, message: 'Exemplaire introuvable sur cette étagère.' };

    if (copy.status === 'Disponible') {
      const msg = `L'exemplaire n°${copy.copyNumber} de "${book.title}" est déjà présent sur l'étagère (Disponible).`;
      addToast('warning', 'Déjà en rayon', msg);
      return { success: false, message: msg };
    }

    // Check if this copy or book is reserved for someone else
    const pendingRes = reservations.find(
      (r) =>
        (r.copyId === copyId || (r.bookId === bookId && (!r.copyId || r.copyId === copyId))) &&
        r.status === 'Réservé'
    );
    const newStatus: CopyStatus = pendingRes ? 'Réservé' : 'Disponible';
    const todayStr = new Date().toISOString().split('T')[0];

    // Update book copy in stock
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          const updatedCopies = (b.copies || []).map((c) => {
            if (c.id === copyId) {
              return {
                ...c,
                status: newStatus,
                condition: 'Bon' as const,
                borrowerName: undefined,
                reservedForName: pendingRes ? pendingRes.memberName : undefined,
                reservedForMemberId: pendingRes ? pendingRes.memberId : undefined,
              };
            }
            return c;
          });
          const availableCount = updatedCopies.filter((c) => c.status === 'Disponible').length;
          return {
            ...b,
            availableCopies: availableCount,
            copies: updatedCopies,
          };
        }
        return b;
      })
    );

    // If there was an active loan for this copy, mark as Rendu
    setLoans((prev) =>
      prev.map((l) =>
        l.copyId === copyId && l.status === 'En cours'
          ? {
              ...l,
              returnDate: todayStr,
              status: 'Rendu',
              conditionOnReturn: 'Bon',
            }
          : l
      )
    );

    let resultMessage = `Exemplaire ${copy.copyNumber} de ${book.title} remis sur ${book.shelfName}, ${book.themeName}, ${book.sectionName}.`;
    if (pendingRes) {
      resultMessage += ` (Réservé pour ${pendingRes.memberName})`;
    }

    logActivity(
      'return',
      `Exemplaire n°${copy.copyNumber} de "${book.title}" remis à sa place sur ${book.shelfName} (${newStatus})`
    );

    addToast(
      'success',
      pendingRes ? 'Exemplaire remis & réservé' : 'Exemplaire remis sur son étagère',
      resultMessage
    );

    return {
      success: true,
      message: resultMessage,
      isReserved: !!pendingRes,
    };
  };

  // ========================================================
  // FORMULAIRE « RETOURNER UN LIVRE »
  // Vérifie l'étagère, le titre, l'auteur, le numéro d'exemplaire,
  // et son état « Indisponible » (emprunté).
  // Si vérification correcte : passe à « Disponible » (ou « Réservé »).
  // ========================================================
  const manualReturnBook = (params: {
    sectionId: string;
    themeId: string;
    shelfId: string;
    title: string;
    author: string;
    copyNumber: number;
  }): { success: boolean; message: string; isReserved?: boolean } => {
    const sec = sections.find((s) => s.id === params.sectionId);
    const thm = sec?.themes.find((t) => t.id === params.themeId);
    const shf = thm?.shelves.find((sh) => sh.id === params.shelfId);

    if (!sec || !thm || !shf) {
      return {
        success: false,
        message: 'Emplacement invalide : section, thématique ou étagère introuvable.',
      };
    }

    const cleanStr = (s: string) =>
      s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '')
        .trim();

    const targetTitle = cleanStr(params.title);
    const targetAuthor = cleanStr(params.author);
    const targetCopyNum = Number(params.copyNumber);

    if (!targetTitle) {
      return { success: false, message: 'Veuillez saisir le titre de l’ouvrage.' };
    }
    if (!targetAuthor) {
      return { success: false, message: 'Veuillez saisir l’auteur de l’ouvrage.' };
    }
    if (isNaN(targetCopyNum) || targetCopyNum < 1) {
      return { success: false, message: 'Veuillez saisir un numéro d’exemplaire valide (ex : 2).' };
    }

    // Vérifie que le livre (titre + auteur) existe bien sur cette étagère
    const bookOnShelf = books.find((b) => {
      if (b.shelfId !== shf.id) return false;
      const bTitle = cleanStr(b.title);
      const bAuthor = cleanStr(b.author);
      const titleMatches = bTitle === targetTitle || bTitle.includes(targetTitle) || targetTitle.includes(bTitle);
      const authorMatches = bAuthor === targetAuthor || bAuthor.includes(targetAuthor) || targetAuthor.includes(bAuthor);
      return titleMatches && authorMatches;
    });

    if (!bookOnShelf) {
      return {
        success: false,
        message: 'Aucun exemplaire emprunté ne correspond à ces informations.',
      };
    }

    // Vérifie l'exemplaire indiqué
    const targetCopy = (bookOnShelf.copies || []).find((c) => c.copyNumber === targetCopyNum);
    if (!targetCopy) {
      return {
        success: false,
        message: 'Aucun exemplaire emprunté ne correspond à ces informations.',
      };
    }

    // Règle : Un exemplaire déjà « Disponible » ne peut pas être retourné, car il est déjà sur l'étagère.
    if (targetCopy.status === 'Disponible') {
      return {
        success: false,
        message: 'Aucun exemplaire emprunté ne correspond à ces informations. (Cet exemplaire est déjà disponible sur l’étagère).',
      };
    }

    // Vérifie que l'exemplaire indiqué est bien « Indisponible » (emprunté)
    if (targetCopy.status !== 'Indisponible' && (targetCopy.status as string) !== 'Non disponible') {
      return {
        success: false,
        message: 'Aucun exemplaire emprunté ne correspond à ces informations.',
      };
    }

    // Vérifie s'il était réservé pour une autre personne
    const pendingRes = reservations.find(
      (r) =>
        (r.copyId === targetCopy.id || (r.bookId === bookOnShelf.id && (!r.copyId || r.copyId === targetCopy.id))) &&
        r.status === 'Réservé'
    );

    const newStatus: CopyStatus = pendingRes ? 'Réservé' : 'Disponible';
    const todayStr = new Date().toISOString().split('T')[0];

    // Remise à la place indiquée avec mise à jour du statut
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookOnShelf.id) {
          const updatedCopies = (b.copies || []).map((c) => {
            if (c.id === targetCopy.id) {
              return {
                ...c,
                status: newStatus,
                borrowerName: undefined,
                exactLocation: `Exemplaire ${targetCopy.copyNumber} de ${bookOnShelf.title}, ${sec.code}, ${thm.name}, ${shf.name}`,
                reservedForName: pendingRes ? pendingRes.memberName : undefined,
                reservedForMemberId: pendingRes ? pendingRes.memberId : undefined,
              };
            }
            return c;
          });
          const availableCount = updatedCopies.filter((c) => c.status === 'Disponible').length;
          return {
            ...b,
            availableCopies: availableCount,
            copies: updatedCopies,
          };
        }
        return b;
      })
    );

    // Clôture du prêt en cours correspondant
    setLoans((prev) =>
      prev.map((l) =>
        (l.copyId === targetCopy.id || (l.bookId === bookOnShelf.id && l.copyNumber === targetCopy.copyNumber)) &&
        l.status === 'En cours'
          ? {
              ...l,
              returnDate: todayStr,
              status: 'Rendu',
              conditionOnReturn: targetCopy.condition || 'Bon',
            }
          : l
      )
    );

    const shelfNameLower = shf.name.toLowerCase().startsWith('étagère')
      ? shf.name.toLowerCase()
      : shf.name;

    // Format requis : « Exemplaire 2 de Peter Pan remis à l'étagère 2, Aventures, Section B. »
    const confirmationMsg = `Exemplaire ${targetCopy.copyNumber} de ${bookOnShelf.title} remis à l'${shelfNameLower}, ${thm.name}, ${sec.code}.`;

    logActivity('return', confirmationMsg);
    addToast('success', 'Retour confirmé', confirmationMsg);

    return {
      success: true,
      message: confirmationMsg,
      isReserved: !!pendingRes,
    };
  };

  // ========================================================
  // RESERVATION FLOW:
  // 3. When an available copy is reserved -> passes to "Réservé"
  //    When cancelled -> passes back to "Disponible"
  //    When claimed by the reserving user -> passes to "Non disponible"
  // ========================================================
  const reserveBook = (
    bookId: string,
    memberId: string,
    copyId?: string
  ): { success: boolean; error?: string } => {
    const book = books.find((b) => b.id === bookId);
    const member = members.find((m) => m.id === memberId);

    if (!book || !member) return { success: false, error: 'Livre ou membre introuvable' };

    // Find copy to reserve
    let targetCopy: BookCopy | undefined;
    if (copyId) {
      targetCopy = book.copies?.find((c) => c.id === copyId);
      if (!targetCopy || targetCopy.status !== 'Disponible') {
        const err = 'Seul un exemplaire actuellement Disponible peut être réservé.';
        addToast('warning', 'Réservation impossible', err);
        return { success: false, error: err };
      }
    } else {
      targetCopy = book.copies?.find((c) => c.status === 'Disponible');
      if (!targetCopy) {
        const err = 'Aucun exemplaire disponible à mettre de côté pour le moment.';
        addToast('warning', 'Aucun exemplaire libre', err);
        return { success: false, error: err };
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const newReservation: Reservation = {
      id: `res-${Date.now()}`,
      bookId: book.id,
      copyId: targetCopy.id,
      copyNumber: targetCopy.copyNumber,
      bookTitle: book.title,
      memberId: member.id,
      memberName: `${member.firstName} ${member.lastName}`,
      reservationDate: todayStr,
      status: 'Réservé',
    };

    // Update copy status to "Réservé"
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          const updatedCopies = (b.copies || []).map((c) =>
            c.id === targetCopy!.id
              ? {
                  ...c,
                  status: 'Réservé' as const,
                  reservedForName: `${member.firstName} ${member.lastName}`,
                  reservedForMemberId: member.id,
                }
              : c
          );
          const availableCount = updatedCopies.filter((c) => c.status === 'Disponible').length;
          return {
            ...b,
            availableCopies: availableCount,
            copies: updatedCopies,
          };
        }
        return b;
      })
    );

    setReservations((prev) => [newReservation, ...prev]);

    logActivity('reservation', `Réservation de ${targetCopy.exactLocation} pour ${member.firstName} ${member.lastName}`);
    addToast(
      'success',
      'Exemplaire réservé',
      `Exemplaire n°${targetCopy.copyNumber} mis de côté pour ${member.firstName} ${member.lastName} (Statut: Réservé).`
    );

    return { success: true };
  };

  const cancelReservation = (reservationId: string) => {
    const res = reservations.find((r) => r.id === reservationId);
    if (!res) return;

    // Set copy back to "Disponible"
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === res.bookId) {
          const updatedCopies = (b.copies || []).map((c) => {
            if (c.id === res.copyId && c.status === 'Réservé') {
              return {
                ...c,
                status: 'Disponible' as const,
                reservedForName: undefined,
                reservedForMemberId: undefined,
              };
            }
            return c;
          });
          const availableCount = updatedCopies.filter((c) => c.status === 'Disponible').length;
          return {
            ...b,
            availableCopies: availableCount,
            copies: updatedCopies,
          };
        }
        return b;
      })
    );

    setReservations((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, status: 'Annulée' } : r))
    );

    addToast('info', 'Réservation annulée', 'L’exemplaire est à nouveau Disponible.');
  };

  const claimReservation = (reservationId: string): { success: boolean; error?: string } => {
    const res = reservations.find((r) => r.id === reservationId);
    if (!res || res.status !== 'Réservé') {
      return { success: false, error: 'Réservation non valide ou déjà retirée.' };
    }

    return borrowBook(res.bookId, res.memberId, res.copyId);
  };

  const updateSettings = (newSettings: LibrarySettings) => {
    setSettings(newSettings);
    addToast('success', 'Paramètres sauvegardés', 'Configuration mise à jour.');
  };

  const resetToDefaults = () => {
    setSections(INITIAL_SECTIONS);
    setSettings(INITIAL_SETTINGS);
    setBooks(INITIAL_BOOKS);
    setMembers(INITIAL_MEMBERS);
    setLoans(INITIAL_LOANS);
    setReservations(INITIAL_RESERVATIONS);
    setActivityLogs(INITIAL_LOGS);
    localStorage.clear();
    addToast('info', 'Données réinitialisées', 'Catalogue et données réinitialisés.');
  };

  const exportDatabase = (): string => {
    const data = {
      version: '3.0',
      exportDate: new Date().toISOString(),
      sections,
      settings,
      books,
      members,
      loans,
      reservations,
      activityLogs,
    };
    return JSON.stringify(data, null, 2);
  };

  const importDatabase = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.books || !data.members) {
        throw new Error('Structure JSON invalide.');
      }
      if (data.sections) setSections(data.sections);
      if (data.settings) setSettings(data.settings);
      if (data.books) setBooks(data.books);
      if (data.members) setMembers(data.members);
      if (data.loans) setLoans(data.loans);
      if (data.reservations) setReservations(data.reservations);
      if (data.activityLogs) setActivityLogs(data.activityLogs);
      addToast('success', 'Importation réussie', 'Données restaurées.');
      return true;
    } catch {
      addToast('error', 'Erreur d’importation', 'Fichier invalide.');
      return false;
    }
  };

  // Stats across the 3 statuses
  const stats = useMemo(() => {
    const totalTitles = books.length;
    const allCopies = books.flatMap((b) => b.copies || []);
    const totalBooks = allCopies.length;
    const availableCopies = allCopies.filter((c) => c.status === 'Disponible').length;
    const borrowedCopies = allCopies.filter((c) => c.status === 'Indisponible' || (c.status as string) === 'Non disponible').length;
    const reservedCopies = allCopies.filter((c) => c.status === 'Réservé').length;

    const activeLoans = loans.filter((l) => l.status === 'En cours');
    const activeReservations = reservations.filter((r) => r.status === 'Réservé');

    const totalMembers = members.length;
    const activeMembersCount = members.filter((m) => m.status === 'Actif').length;

    return {
      totalBooks,
      totalTitles,
      availableCopies,
      borrowedCopies,
      reservedCopies,
      activeLoansCount: activeLoans.length,
      activeReservationsCount: activeReservations.length,
      totalMembers,
      activeMembersCount,
    };
  }, [books, loans, reservations, members]);

  return (
    <LibraryContext.Provider
      value={{
        sections,
        books,
        members,
        loans,
        reservations,
        settings,
        activityLogs,
        toasts,
        addToast,
        removeToast,
        addBook,
        updateBook,
        deleteBook,
        addMember,
        updateMember,
        deleteMember,
        renewMemberCard,
        verifyStudent,
        borrowBook,
        returnBook,
        returnCopy,
        manualReturnBook,
        reserveBook,
        cancelReservation,
        claimReservation,
        updateSettings,
        resetToDefaults,
        exportDatabase,
        importDatabase,
        stats,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
