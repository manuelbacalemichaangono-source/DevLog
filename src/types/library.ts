export type BookGenre =
  | 'Roman'
  | 'Science-Fiction'
  | 'Histoire'
  | 'Bande Dessinée'
  | 'Philosophie'
  | 'Sciences'
  | 'Jeunesse'
  | 'Policier & Thriller'
  | 'Poésie'
  | 'Art & Architecture';

export type BookCondition = 'Parfait' | 'Bon' | 'Légèrement abîmé' | 'Endommagé';

export type CopyStatus = 'Disponible' | 'Indisponible' | 'Non disponible' | 'Réservé';

export interface BookCopy {
  id: string;
  copyNumber: number; // e.g. 1, 2, 3
  bookId: string;
  barcode: string;
  status: CopyStatus;
  condition: BookCondition;
  exactLocation: string; // e.g. "Exemplaire 2 de Peter Pan, Section C, Contes & Romans Jeunesse, Étagère 1"
  borrowerName?: string;
  reservedForName?: string;
  reservedForMemberId?: string;
}

export interface LibraryShelf {
  id: string; // e.g. 'etagere-a-1-1'
  shelfNumber: number; // 1, 2, 3
  name: string; // e.g. "Étagère 1"
  themeId: string;
  description?: string;
}

export interface LibraryTheme {
  id: string; // e.g. 'theme-sf'
  name: string; // e.g. "Science-Fiction & Anticipation"
  sectionId: string;
  description: string;
  icon?: string;
  shelves: LibraryShelf[];
}

export interface LibrarySection {
  id: string; // e.g. 'sec-a'
  code: string; // e.g. "Section A"
  name: string; // e.g. "Lettres & Imaginaires"
  description: string;
  color: string;
  themes: LibraryTheme[];
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  genre: BookGenre;
  sectionId: string;
  sectionName: string;
  themeId: string;
  themeName: string;
  shelfId: string;
  shelfName: string;
  publishedYear: number;
  publisher: string;
  deweyCode: string;
  shelfLocation: string;
  totalCopies: number;
  availableCopies: number;
  description: string;
  coverAccent: string;
  pages: number;
  language: string;
  addedDate: string;
  copies: BookCopy[];
}

export type MemberCategory = 'Adulte' | 'Étudiant' | 'Enfant' | 'Enseignant' | 'Senior';
export type MemberStatus = 'Actif' | 'Suspendu' | 'Expiré';

export interface Member {
  id: string;
  memberNumber: string; // e.g. "ADH-2024-042"
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  category: MemberCategory;
  registrationDate: string;
  expiryDate: string;
  status: MemberStatus;
  maxLoans: number;
  notes?: string;
}

export type LoanStatus = 'En cours' | 'Rendu';

export interface Loan {
  id: string;
  bookId: string;
  copyId: string;
  copyNumber: number;
  exactLocation: string;
  bookTitle: string;
  bookAuthor: string;
  bookIsbn: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  loanDate: string; // YYYY-MM-DD
  returnDate?: string | null;
  status: LoanStatus;
  conditionOnReturn?: BookCondition | null;
  notes?: string;
}

export interface Reservation {
  id: string;
  bookId: string;
  copyId: string;
  copyNumber: number;
  bookTitle: string;
  memberId: string;
  memberName: string;
  reservationDate: string;
  status: 'Réservé' | 'Retiré' | 'Annulée';
}

export interface LibrarySettings {
  libraryName: string;
  address: string;
  defaultMaxLoans: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'loan' | 'return' | 'member_new' | 'book_new' | 'reservation';
  description: string;
  actor?: string;
}
