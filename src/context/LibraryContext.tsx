import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Book,
  Member,
  Loan,
  LibrarySettings,
  ActivityLog,
  BookCondition,
  LibrarySection,
  BookCopy,
  CopyStatus,
  LoanStatus,
} from '../types/library';
import {
  INITIAL_SETTINGS,
  INITIAL_SECTIONS,
  INITIAL_BOOKS,
  INITIAL_MEMBERS,
  INITIAL_LOANS,
  INITIAL_LOGS,
} from '../data/seedData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

export interface OverdueInfo {
  isOverdue: boolean;
  daysOverdue: number;
}

interface LibraryContextType {
  sections: LibrarySection[];
  books: Book[];
  members: Member[];
  loans: Loan[];
  settings: LibrarySettings;
  activityLogs: ActivityLog[];
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Authentication & Security
  currentUser: Member | null;
  login: (identifier: string, password?: string) => { success: boolean; error?: string };
  logout: () => void;
  registerStudent: (data: {
    firstName: string;
    lastName: string;
    memberNumber: string;
    email: string;
    password?: string;
    filiere?: string;
    phone?: string;
  }) => { success: boolean; error?: string; student?: Member };

  // Book methods
  addBook: (book: Omit<Book, 'id' | 'availableCopies' | 'borrowedCopies' | 'addedDate' | 'copies'>) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  deleteBook: (id: string) => boolean;

  // Student methods
  addMember: (member: { firstName: string; lastName: string; memberNumber?: string; email?: string; phone?: string; filiere?: string }) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  deleteMember: (id: string) => boolean;
  verifyStudent: (matricule: string, lastName: string) => { student: Member | null; error?: string };

  // Loan & Return methods
  borrowBook: (bookId: string, memberId: string, copyId?: string, dueDate?: string) => { success: boolean; error?: string };
  returnBook: (loanId: string, condition?: BookCondition) => void;
  returnCopy: (bookId: string, copyId: string) => { success: boolean; message: string };
  manualReturnBook: (params: {
    sectionId: string;
    themeId: string;
    shelfId: string;
    title: string;
    author: string;
    copyNumber: number;
  }) => { success: boolean; message: string };

  // Helpers for overdue and dates
  getLoanOverdueInfo: (loan: Loan) => OverdueInfo;
  getCopyLiveStatus: (copy: BookCopy) => { status: 'Disponible' | 'Emprunté' | 'En retard'; loan?: Loan; daysOverdue?: number };

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
    activeLoansCount: number;
    overdueLoansCount: number;
    totalMembers: number;
    activeMembersCount: number;
  };
}

const STORAGE_KEY_PREFIX = 'bibliotech_v5_';

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

// Helper to calculate days between dates
export function calculateDaysBetween(fromIsoDate: string, toIsoDate: string): number {
  const d1 = new Date(fromIsoDate + 'T00:00:00');
  const d2 = new Date(toIsoDate + 'T00:00:00');
  const diffTime = d2.getTime() - d1.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// Get today formatted as YYYY-MM-DD
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Add days to date
export function addDaysToDate(baseDateIso: string, days: number): string {
  const date = new Date(baseDateIso + 'T00:00:00');
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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
        return parsed.map((b) => {
          const copies = (b.copies || []).map((c, idx) => ({
            ...c,
            copyIdentifier: c.copyIdentifier || `EX-${b.id.toUpperCase()}-${String(c.copyNumber || idx + 1).padStart(2, '0')}`,
            status: ((c.status as string) === 'Réservé' ? 'Disponible' : ((c.status as string) === 'Indisponible' ? 'Emprunté' : c.status)) as CopyStatus,
          }));
          const available = copies.filter((c) => c.status === 'Disponible').length;
          const borrowed = copies.filter((c) => c.status === 'Emprunté').length;
          return {
            ...b,
            copies,
            availableCopies: available,
            borrowedCopies: borrowed,
          };
        });
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
        return JSON.parse(saved);
      } catch {
        return INITIAL_MEMBERS;
      }
    }
    return INITIAL_MEMBERS;
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}loans`);
    if (saved) {
      try {
        const parsed: Loan[] = JSON.parse(saved);
        return parsed.map((l) => {
          const dueDate = l.dueDate || addDaysToDate(l.loanDate, 14);
          const isOverdue = l.status !== 'Terminé' && (l.returnDate === null || l.returnDate === undefined) && dueDate < getTodayDateString();
          return {
            ...l,
            dueDate,
            status: l.status === 'Terminé' || (l.status as string) === 'Rendu'
              ? 'Terminé'
              : (isOverdue ? 'En retard' : 'En cours') as LoanStatus,
            copyIdentifier: l.copyIdentifier || `EX-${l.bookId.toUpperCase()}-${String(l.copyNumber).padStart(2, '0')}`,
          };
        });
      } catch {
        return INITIAL_LOANS;
      }
    }
    return INITIAL_LOANS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}logs`);
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  // Authenticated Student User Session
  const [currentUser, setCurrentUser] = useState<Member | null>(() => {
    const savedUser = localStorage.getItem(`${STORAGE_KEY_PREFIX}current_user`);
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}current_user`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}current_user`);
    }
  }, [currentUser]);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 4500);
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

  // Helper for overdue checks
  const getLoanOverdueInfo = (loan: Loan): OverdueInfo => {
    if (loan.status === 'Terminé' || loan.returnDate) {
      return { isOverdue: false, daysOverdue: 0 };
    }
    const today = getTodayDateString();
    if (today > loan.dueDate) {
      const days = calculateDaysBetween(loan.dueDate, today);
      return { isOverdue: true, daysOverdue: Math.max(1, days) };
    }
    return { isOverdue: false, daysOverdue: 0 };
  };

  const getCopyLiveStatus = (copy: BookCopy): { status: 'Disponible' | 'Emprunté' | 'En retard'; loan?: Loan; daysOverdue?: number } => {
    if (copy.status === 'Disponible') {
      return { status: 'Disponible' };
    }
    // Find active loan
    const activeLoan = loans.find(
      (l) => (l.copyId === copy.id || (l.bookId === copy.bookId && l.copyNumber === copy.copyNumber)) && l.status !== 'Terminé'
    );
    if (!activeLoan) {
      return { status: 'Emprunté' };
    }
    const overdue = getLoanOverdueInfo(activeLoan);
    if (overdue.isOverdue) {
      return { status: 'En retard', loan: activeLoan, daysOverdue: overdue.daysOverdue };
    }
    return { status: 'Emprunté', loan: activeLoan };
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
    localStorage.setItem(`${STORAGE_KEY_PREFIX}logs`, JSON.stringify(activityLogs));
  }, [activityLogs]);

  // Book methods
  const addBook = (bookData: Omit<Book, 'id' | 'availableCopies' | 'borrowedCopies' | 'addedDate' | 'copies'>) => {
    const id = `liv-${Date.now()}`;
    const titleSlug = bookData.title.slice(0, 6).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const copies: BookCopy[] = [];
    for (let i = 1; i <= bookData.totalCopies; i++) {
      const copyIdentifier = `EX-${titleSlug || 'BK'}-${String(i).padStart(2, '0')}`;
      copies.push({
        id: `${id}-ex-${i}`,
        copyNumber: i,
        copyIdentifier,
        bookId: id,
        barcode: `EX-${id.toUpperCase()}-${String(i).padStart(2, '0')}`,
        status: 'Disponible',
        condition: 'Parfait',
        exactLocation: `${bookData.sectionName} > ${bookData.themeName} > ${bookData.shelfName}`,
      });
    }

    const newBook: Book = {
      ...bookData,
      id,
      availableCopies: bookData.totalCopies,
      borrowedCopies: 0,
      addedDate: getTodayDateString(),
      copies,
    };

    setBooks((prev) => [newBook, ...prev]);
    logActivity('book_new', `Nouvel ouvrage enregistré : "${newBook.title}" (${newBook.totalCopies} exemplaires)`);
    addToast('success', 'Ouvrage enregistré', `"${newBook.title}" a été ajouté avec ${newBook.totalCopies} exemplaire(s).`);
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
              const titleSlug = (updated.title || 'BK').slice(0, 6).toUpperCase().replace(/[^A-Z0-9]/g, '');
              for (let i = currentCopies.length + 1; i <= updates.totalCopies; i++) {
                newCopies.push({
                  id: `${id}-ex-${i}`,
                  copyNumber: i,
                  copyIdentifier: `EX-${titleSlug}-${String(i).padStart(2, '0')}`,
                  bookId: id,
                  barcode: `EX-${id.toUpperCase()}-${String(i).padStart(2, '0')}`,
                  status: 'Disponible',
                  condition: 'Bon',
                  exactLocation: `${updated.sectionName} > ${updated.themeName} > ${updated.shelfName}`,
                });
              }
              updated.copies = newCopies;
            }
          }
          const available = (updated.copies || []).filter((c) => c.status === 'Disponible').length;
          const borrowed = (updated.copies || []).filter((c) => c.status === 'Emprunté').length;
          updated.availableCopies = available;
          updated.borrowedCopies = borrowed;
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

    const hasActiveLoan = loans.some((l) => l.bookId === id && l.status !== 'Terminé');
    if (hasActiveLoan) {
      addToast('error', 'Suppression impossible', `Des exemplaires de "${book.title}" sont actuellement empruntés.`);
      return false;
    }

    setBooks((prev) => prev.filter((b) => b.id !== id));
    logActivity('book_new', `Ouvrage retiré du fonds : "${book.title}"`);
    addToast('success', 'Ouvrage supprimé', `"${book.title}" a été retiré.`);
    return true;
  };

  // Student methods
  const addMember = (studentData: {
    firstName: string;
    lastName: string;
    memberNumber?: string;
    email?: string;
    phone?: string;
    filiere?: string;
  }) => {
    const id = `etu-${Date.now()}`;
    const year = new Date().getFullYear();
    const count = members.length + 1;
    const memberNumber = studentData.memberNumber?.trim().toUpperCase() || `ETU-${year}-${String(count).padStart(3, '0')}`;

    const newMember: Member = {
      id,
      memberNumber,
      firstName: studentData.firstName.trim(),
      lastName: studentData.lastName.trim(),
      email: studentData.email?.trim() || `${studentData.firstName.toLowerCase()}.${studentData.lastName.toLowerCase()}@etudiant.univ.fr`,
      phone: studentData.phone?.trim() || '',
      filiere: studentData.filiere?.trim() || 'Licence Universitaire',
      category: 'Étudiant',
      registrationDate: getTodayDateString(),
      status: 'Actif',
      maxLoans: settings.defaultMaxLoans || 5,
    };

    setMembers((prev) => [newMember, ...prev]);
    logActivity('member_new', `Inscription de l’étudiant(e) ${newMember.firstName} ${newMember.lastName} (${memberNumber})`);
    addToast('success', 'Étudiant inscrit', `${newMember.firstName} ${newMember.lastName} inscrit(e) (Matricule : ${memberNumber}).`);
  };

  const updateMember = (id: string, updates: Partial<Member>) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    addToast('info', 'Fiche actualisée', 'Informations de l’étudiant modifiées.');
  };

  const deleteMember = (id: string): boolean => {
    const member = members.find((m) => m.id === id);
    if (!member) return false;

    const hasActiveLoans = loans.some((l) => l.memberId === id && l.status !== 'Terminé');
    if (hasActiveLoans) {
      addToast('error', 'Suppression impossible', `${member.firstName} ${member.lastName} a des exemplaires en cours d’emprunt.`);
      return false;
    }

    setMembers((prev) => prev.filter((m) => m.id !== id));
    addToast('success', 'Étudiant supprimé', `Dossier de ${member.firstName} ${member.lastName} retiré.`);
    return true;
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
          'Accès refusé : seuls les étudiants inscrits peuvent emprunter un livre. Vous pouvez consulter les livres, mais pas les emprunter.',
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
          'Accès refusé : seuls les étudiants inscrits peuvent emprunter un livre. Vous pouvez consulter les livres, mais pas les emprunter.',
      };
    }

    return { student: found };
  };

  // Student Authentication Flow
  const login = (identifier: string, password?: string): { success: boolean; error?: string } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanMatriculeOnly = cleanId.replace(/[^a-z0-9]/g, '');

    const student = members.find((m) => {
      const mNum = m.memberNumber.toLowerCase();
      const mNumClean = mNum.replace(/[^a-z0-9]/g, '');
      const mEmail = (m.email || '').toLowerCase();
      return mNum === cleanId || mNumClean === cleanMatriculeOnly || mEmail === cleanId;
    });

    if (!student) {
      return {
        success: false,
        error: "Aucun étudiant inscrit trouvé avec ce numéro de matricule ou cette adresse e-mail. Veuillez procéder à votre inscription.",
      };
    }

    if (student.status && student.status !== 'Actif') {
      return {
        success: false,
        error: `Votre compte étudiant est actuellement « ${student.status} ». Veuillez contacter l'administration de la bibliothèque.`,
      };
    }

    // Verify password if set and password was provided
    if (student.password && password && student.password !== password) {
      return {
        success: false,
        error: "Mot de passe incorrect. Veuillez vérifier vos identifiants.",
      };
    }

    setCurrentUser(student);
    addToast('success', 'Connexion réussie', `Bienvenue à la bibliothèque, ${student.firstName} ${student.lastName} (Matricule : ${student.memberNumber}).`);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}current_user`);
    addToast('info', 'Déconnexion', 'Vous avez fermé votre session de bibliothèque.');
  };

  const registerStudent = (data: {
    firstName: string;
    lastName: string;
    memberNumber: string;
    email: string;
    password?: string;
    filiere?: string;
    phone?: string;
  }): { success: boolean; error?: string; student?: Member } => {
    const cleanMatricule = data.memberNumber.trim().toUpperCase();
    const cleanEmail = data.email.trim().toLowerCase();

    // Check duplicate matricule or email
    const duplicate = members.find(
      (m) =>
        m.memberNumber.trim().toUpperCase() === cleanMatricule ||
        (m.email && m.email.trim().toLowerCase() === cleanEmail)
    );

    if (duplicate) {
      return {
        success: false,
        error: `Un compte étudiant existe déjà avec le matricule ${cleanMatricule} ou l'e-mail ${cleanEmail}. Vous pouvez vous connecter directement.`,
      };
    }

    const newStudent: Member = {
      id: `etu-${Date.now()}`,
      memberNumber: cleanMatricule,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: cleanEmail,
      phone: data.phone?.trim() || '',
      filiere: data.filiere?.trim() || 'Étudiant universitaire',
      category: 'Étudiant',
      registrationDate: getTodayDateString(),
      status: 'Actif',
      maxLoans: 5,
      password: data.password || 'bibliotech',
    };

    setMembers((prev) => [newStudent, ...prev]);
    setCurrentUser(newStudent);
    logActivity('member_new', `Nouvelle inscription : ${newStudent.firstName} ${newStudent.lastName} (${newStudent.memberNumber})`);
    addToast('success', 'Inscription validée', `Compte créé avec succès ! Bienvenue ${newStudent.firstName}.`);

    return { success: true, student: newStudent };
  };

  // Borrow Flow
  const borrowBook = (
    bookId: string,
    memberId: string,
    copyId?: string,
    dueDateParam?: string
  ): { success: boolean; error?: string } => {
    const book = books.find((b) => b.id === bookId);
    const member = members.find((m) => m.id === memberId);

    if (!book) return { success: false, error: 'Ouvrage introuvable.' };
    if (!member) return { success: false, error: 'Étudiant introuvable.' };

    if (member.status && member.status !== 'Actif') {
      const err = `L’inscription de ${member.firstName} ${member.lastName} est suspendue ou expirée.`;
      addToast('warning', 'Emprunt refusé', err);
      return { success: false, error: err };
    }

    const maxAllowed = member.maxLoans ?? settings.defaultMaxLoans ?? 5;
    const memberActiveLoans = loans.filter((l) => l.memberId === memberId && l.status !== 'Terminé');
    if (memberActiveLoans.length >= maxAllowed) {
      const err = `Quota atteint : ${memberActiveLoans.length}/${maxAllowed} exemplaires déjà empruntés.`;
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
      if (targetCopy.status === 'Emprunté') {
        const err = `L'exemplaire ${targetCopy.copyIdentifier} est déjà emprunté.`;
        addToast('warning', 'Exemplaire indisponible', err);
        return { success: false, error: err };
      }
    } else {
      targetCopy = book.copies?.find((c) => c.status === 'Disponible');
      if (!targetCopy) {
        const err = `Aucun exemplaire disponible pour "${book.title}".`;
        addToast('warning', 'Stock épuisé', err);
        return { success: false, error: err };
      }
    }

    const todayStr = getTodayDateString();
    const finalDueDate = dueDateParam || addDaysToDate(todayStr, settings.defaultLoanDurationDays || 14);

    const newLoan: Loan = {
      id: `pret-${Date.now()}`,
      bookId: book.id,
      copyId: targetCopy.id,
      copyNumber: targetCopy.copyNumber,
      copyIdentifier: targetCopy.copyIdentifier,
      exactLocation: targetCopy.exactLocation,
      bookTitle: book.title,
      bookAuthor: book.author,
      bookIsbn: book.isbn,
      memberId: member.id,
      memberName: `${member.firstName} ${member.lastName}`,
      memberNumber: member.memberNumber,
      memberEmail: member.email || '',
      loanDate: todayStr,
      dueDate: finalDueDate,
      returnDate: null,
      status: 'En cours',
    };

    // Update book copy in state
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          const updatedCopies = (b.copies || []).map((c) =>
            c.id === targetCopy!.id
              ? {
                  ...c,
                  status: 'Emprunté' as const,
                  borrowerName: `${member.firstName} ${member.lastName}`,
                  borrowerMemberNumber: member.memberNumber,
                  borrowerMemberId: member.id,
                  loanDate: todayStr,
                  dueDate: finalDueDate,
                }
              : c
          );
          const availableCount = updatedCopies.filter((c) => c.status === 'Disponible').length;
          const borrowedCount = updatedCopies.filter((c) => c.status === 'Emprunté').length;
          return {
            ...b,
            availableCopies: availableCount,
            borrowedCopies: borrowedCount,
            copies: updatedCopies,
          };
        }
        return b;
      })
    );

    setLoans((prev) => [newLoan, ...prev]);

    logActivity(
      'loan',
      `Prêt de l'exemplaire ${targetCopy.copyIdentifier} ("${book.title}") à ${member.firstName} ${member.lastName} (Retour prévu : ${finalDueDate})`
    );
    addToast(
      'success',
      'Emprunt enregistré',
      `Exemplaire ${targetCopy.copyIdentifier} prêté à ${member.firstName} ${member.lastName}. Date de retour prévue : ${finalDueDate}.`
    );

    return { success: true };
  };

  // Return Flow
  const returnBook = (loanId: string, condition: BookCondition = 'Bon') => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan || loan.status === 'Terminé') return;

    const todayStr = getTodayDateString();

    // Set copy to 'Disponible'
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === loan.bookId) {
          const updatedCopies = (b.copies || []).map((c) => {
            if (c.id === loan.copyId) {
              return {
                ...c,
                status: 'Disponible' as const,
                condition,
                borrowerName: undefined,
                borrowerMemberNumber: undefined,
                borrowerMemberId: undefined,
                loanDate: undefined,
                dueDate: undefined,
              };
            }
            return c;
          });
          const availableCount = updatedCopies.filter((c) => c.status === 'Disponible').length;
          const borrowedCount = updatedCopies.filter((c) => c.status === 'Emprunté').length;
          return {
            ...b,
            availableCopies: availableCount,
            borrowedCopies: borrowedCount,
            copies: updatedCopies,
          };
        }
        return b;
      })
    );

    // Update loan
    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId
          ? {
              ...l,
              returnDate: todayStr,
              status: 'Terminé',
              conditionOnReturn: condition,
            }
          : l
      )
    );

    logActivity(
      'return',
      `Retour de l'exemplaire ${loan.copyIdentifier} ("${loan.bookTitle}") par ${loan.memberName}`
    );
    addToast(
      'success',
      'Retour enregistré',
      `L'exemplaire ${loan.copyIdentifier} de "${loan.bookTitle}" a été rendu et remis en rayon (Disponible).`
    );
  };

  // Return copy directly by IDs
  const returnCopy = (
    bookId: string,
    copyId: string
  ): { success: boolean; message: string } => {
    const book = books.find((b) => b.id === bookId);
    if (!book) return { success: false, message: 'Ouvrage introuvable.' };

    const copy = (book.copies || []).find((c) => c.id === copyId);
    if (!copy) return { success: false, message: 'Exemplaire introuvable.' };

    if (copy.status === 'Disponible') {
      const msg = `L'exemplaire ${copy.copyIdentifier} de "${book.title}" est déjà en rayon (Disponible).`;
      addToast('warning', 'Déjà disponible', msg);
      return { success: false, message: msg };
    }

    const todayStr = getTodayDateString();

    // Update book copy
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          const updatedCopies = (b.copies || []).map((c) => {
            if (c.id === copyId) {
              return {
                ...c,
                status: 'Disponible' as const,
                condition: 'Bon' as const,
                borrowerName: undefined,
                borrowerMemberNumber: undefined,
                borrowerMemberId: undefined,
                loanDate: undefined,
                dueDate: undefined,
              };
            }
            return c;
          });
          const availableCount = updatedCopies.filter((c) => c.status === 'Disponible').length;
          const borrowedCount = updatedCopies.filter((c) => c.status === 'Emprunté').length;
          return {
            ...b,
            availableCopies: availableCount,
            borrowedCopies: borrowedCount,
            copies: updatedCopies,
          };
        }
        return b;
      })
    );

    // Close corresponding active loan
    setLoans((prev) =>
      prev.map((l) =>
        (l.copyId === copyId || (l.bookId === bookId && l.copyNumber === copy.copyNumber)) && l.status !== 'Terminé'
          ? {
              ...l,
              returnDate: todayStr,
              status: 'Terminé',
              conditionOnReturn: 'Bon',
            }
          : l
      )
    );

    const resultMessage = `Exemplaire ${copy.copyIdentifier} de « ${book.title} » remis en rayon (Disponible).`;
    logActivity('return', resultMessage);
    addToast('success', 'Retour confirmé', resultMessage);

    return { success: true, message: resultMessage };
  };

  // Manual return form (shelf + title + author + copyNumber)
  const manualReturnBook = (params: {
    sectionId: string;
    themeId: string;
    shelfId: string;
    title: string;
    author: string;
    copyNumber: number;
  }): { success: boolean; message: string } => {
    const sec = sections.find((s) => s.id === params.sectionId);
    const thm = sec?.themes.find((t) => t.id === params.themeId);
    const shf = thm?.shelves.find((sh) => sh.id === params.shelfId);

    if (!sec || !thm || !shf) {
      return { success: false, message: 'Emplacement invalide (section, thématique ou étagère introuvable).' };
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

    if (!targetTitle) return { success: false, message: 'Veuillez saisir le titre de l’ouvrage.' };
    if (!targetAuthor) return { success: false, message: 'Veuillez saisir l’auteur de l’ouvrage.' };
    if (isNaN(targetCopyNum) || targetCopyNum < 1) {
      return { success: false, message: 'Veuillez saisir un numéro d’exemplaire valide.' };
    }

    const bookOnShelf = books.find((b) => {
      if (b.shelfId !== shf.id) return false;
      const bTitle = cleanStr(b.title);
      const bAuthor = cleanStr(b.author);
      return (bTitle.includes(targetTitle) || targetTitle.includes(bTitle)) &&
             (bAuthor.includes(targetAuthor) || targetAuthor.includes(bAuthor));
    });

    if (!bookOnShelf) {
      return { success: false, message: 'Aucun exemplaire emprunté ne correspond à ces informations.' };
    }

    const targetCopy = (bookOnShelf.copies || []).find((c) => c.copyNumber === targetCopyNum);
    if (!targetCopy) {
      return { success: false, message: 'Aucun exemplaire emprunté ne correspond à ce numéro.' };
    }

    if (targetCopy.status === 'Disponible') {
      return {
        success: false,
        message: `L'exemplaire ${targetCopy.copyIdentifier} est déjà présent sur l'étagère (Disponible).`,
      };
    }

    const todayStr = getTodayDateString();

    // Update book copies
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookOnShelf.id) {
          const updatedCopies = (b.copies || []).map((c) => {
            if (c.id === targetCopy.id) {
              return {
                ...c,
                status: 'Disponible' as const,
                borrowerName: undefined,
                borrowerMemberNumber: undefined,
                borrowerMemberId: undefined,
                loanDate: undefined,
                dueDate: undefined,
              };
            }
            return c;
          });
          const availableCount = updatedCopies.filter((c) => c.status === 'Disponible').length;
          const borrowedCount = updatedCopies.filter((c) => c.status === 'Emprunté').length;
          return {
            ...b,
            availableCopies: availableCount,
            borrowedCopies: borrowedCount,
            copies: updatedCopies,
          };
        }
        return b;
      })
    );

    // Close loan
    setLoans((prev) =>
      prev.map((l) =>
        (l.copyId === targetCopy.id || (l.bookId === bookOnShelf.id && l.copyNumber === targetCopy.copyNumber)) &&
        l.status !== 'Terminé'
          ? {
              ...l,
              returnDate: todayStr,
              status: 'Terminé',
              conditionOnReturn: targetCopy.condition || 'Bon',
            }
          : l
      )
    );

    const confirmationMsg = `Exemplaire ${targetCopy.copyIdentifier} de « ${bookOnShelf.title} » remis sur ${shf.name}, ${thm.name}, ${sec.code} (Disponible).`;
    logActivity('return', confirmationMsg);
    addToast('success', 'Retour confirmé', confirmationMsg);

    return { success: true, message: confirmationMsg };
  };

  const updateSettings = (newSettings: LibrarySettings) => {
    setSettings(newSettings);
    addToast('success', 'Paramètres mis à jour', 'Configuration enregistrée.');
  };

  const resetToDefaults = () => {
    setSections(INITIAL_SECTIONS);
    setSettings(INITIAL_SETTINGS);
    setBooks(INITIAL_BOOKS);
    setMembers(INITIAL_MEMBERS);
    setLoans(INITIAL_LOANS);
    setActivityLogs(INITIAL_LOGS);
    localStorage.clear();
    addToast('info', 'Données réinitialisées', 'Jeu de démonstration rechargé.');
  };

  const exportDatabase = (): string => {
    const data = {
      version: '5.0',
      exportDate: new Date().toISOString(),
      sections,
      settings,
      books,
      members,
      loans,
      activityLogs,
    };
    return JSON.stringify(data, null, 2);
  };

  const importDatabase = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.books || !data.members) throw new Error('Format invalide');
      if (data.sections) setSections(data.sections);
      if (data.settings) setSettings(data.settings);
      if (data.books) setBooks(data.books);
      if (data.members) setMembers(data.members);
      if (data.loans) setLoans(data.loans);
      if (data.activityLogs) setActivityLogs(data.activityLogs);
      addToast('success', 'Restauration réussie', 'Données importées avec succès.');
      return true;
    } catch {
      addToast('error', 'Erreur d’import', 'Fichier de sauvegarde non reconnu.');
      return false;
    }
  };

  // Live metrics computation
  const stats = useMemo(() => {
    const totalTitles = books.length;
    const allCopies = books.flatMap((b) => b.copies || []);
    const totalBooks = allCopies.length;
    const availableCopies = allCopies.filter((c) => c.status === 'Disponible').length;
    const borrowedCopies = allCopies.filter((c) => c.status === 'Emprunté').length;

    const activeLoans = loans.filter((l) => l.status !== 'Terminé');
    const today = getTodayDateString();
    const overdueLoans = activeLoans.filter((l) => l.dueDate < today);

    const totalMembers = members.length;
    const activeMembersCount = members.filter((m) => m.status === 'Actif').length;

    return {
      totalBooks,
      totalTitles,
      availableCopies,
      borrowedCopies,
      activeLoansCount: activeLoans.length,
      overdueLoansCount: overdueLoans.length,
      totalMembers,
      activeMembersCount,
    };
  }, [books, loans, members]);

  return (
    <LibraryContext.Provider
      value={{
        sections,
        books,
        members,
        loans,
        settings,
        activityLogs,
        toasts,
        addToast,
        removeToast,
        currentUser,
        login,
        logout,
        registerStudent,
        addBook,
        updateBook,
        deleteBook,
        addMember,
        updateMember,
        deleteMember,
        verifyStudent,
        borrowBook,
        returnBook,
        returnCopy,
        manualReturnBook,
        getLoanOverdueInfo,
        getCopyLiveStatus,
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
