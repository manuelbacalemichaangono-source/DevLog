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

export type CopyStatus = 'Disponible' | 'Emprunté';

export interface BookCopy {
  id: string; // e.g. "liv-001-ex-1"
  copyNumber: number; // e.g. 1, 2, 3
  copyIdentifier: string; // Identifiant lisible et unique, e.g. "EX-LIV001-01"
  bookId: string;
  barcode: string;
  status: CopyStatus;
  condition: BookCondition;
  exactLocation: string; // Emplacement physique e.g. "Section A > Romans > Étagère 1"
  borrowerName?: string;
  borrowerMemberNumber?: string;
  borrowerMemberId?: string;
  loanDate?: string; // Date de l'emprunt en cours
  dueDate?: string; // Date de retour prévue
}

export interface LibraryShelf {
  id: string;
  shelfNumber: number;
  name: string;
  themeId: string;
  description?: string;
}

export interface LibraryTheme {
  id: string;
  name: string;
  sectionId: string;
  description: string;
  icon?: string;
  shelves: LibraryShelf[];
}

export interface LibrarySection {
  id: string;
  code: string;
  name: string;
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
  keywords?: string[];
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
  borrowedCopies: number;
  description: string;
  coverAccent: string;
  pages: number;
  language: string;
  addedDate: string;
  copies: BookCopy[];
}

export type MemberCategory = 'Étudiant' | 'Adulte' | 'Enseignant';
export type MemberStatus = 'Actif' | 'Suspendu' | 'Expiré';

export interface Member {
  id: string;
  memberNumber: string; // Numéro de matricule unique (e.g. "ETU-2024-001")
  firstName: string; // Prénom
  lastName: string; // Nom
  email?: string;
  phone?: string;
  filiere?: string; // Optionnel : filière ou promotion
  category?: MemberCategory;
  registrationDate?: string;
  status?: MemberStatus;
  maxLoans?: number;
  notes?: string;
  password?: string; // Mot de passe du compte bibliothèque
}

export type LoanStatus = 'En cours' | 'En retard' | 'Terminé';

export interface Loan {
  id: string;
  bookId: string;
  copyId: string;
  copyNumber: number;
  copyIdentifier: string; // Numéro d'identification lisible de l'exemplaire
  exactLocation: string;
  bookTitle: string;
  bookAuthor: string;
  bookIsbn: string;
  memberId: string;
  memberName: string;
  memberNumber: string; // Numéro de matricule étudiant
  memberEmail: string;
  loanDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD : Date de retour prévue
  returnDate?: string | null; // Date de retour effective lorsque rendu
  status: LoanStatus;
  conditionOnReturn?: BookCondition | null;
  notes?: string;
}

export interface LibrarySettings {
  libraryName: string;
  address: string;
  defaultMaxLoans: number;
  defaultLoanDurationDays: number; // Durée par défaut d'un emprunt en jours (ex : 14 ou 21)
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'loan' | 'return' | 'member_new' | 'book_new';
  description: string;
  actor?: string;
}
