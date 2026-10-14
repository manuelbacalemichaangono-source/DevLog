import React, { useState } from 'react';
import { LibraryProvider, useLibrary } from './context/LibraryContext';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { DashboardView } from './components/DashboardView';
import { PhysicalLibraryBrowser, NavigationLevel } from './components/PhysicalLibraryBrowser';
import { BookPlus, RotateCcw } from 'lucide-react';
import { LoansView } from './components/LoansView';
import { MembersView } from './components/MembersView';
import { ReservationsView } from './components/ReservationsView';
import { SettingsView } from './components/SettingsView';
import { ToastContainer } from './components/ToastContainer';
import { NewLoanModal } from './components/NewLoanModal';
import { ReturnModal } from './components/ReturnModal';
import { ReturnBookModal } from './components/ReturnBookModal';
import { ReserveCopyModal } from './components/ReserveCopyModal';
import { BookModal } from './components/BookModal';
import { MemberModal } from './components/MemberModal';
import { BookDetailModal } from './components/BookDetailModal';
import { MemberDetailModal } from './components/MemberDetailModal';
import { StudentIdentificationModal } from './components/StudentIdentificationModal';
import { Book, BookCopy, Member } from './types/library';

function LibraryApp() {
  const { borrowBook, reserveBook, addToast } = useLibrary();

  // Par défaut sur 'books' (Plan & Consultation des Rayons)
  const [activeTab, setActiveTab] = useState<ActiveTab>('books');
  const [browserLevel, setBrowserLevel] = useState<NavigationLevel>(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Student Identity Verification state (pour emprunter ou réserver)
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [identityActionType, setIdentityActionType] = useState<'borrow' | 'reserve'>('borrow');
  const [identityTargetBook, setIdentityTargetBook] = useState<Book | null>(null);
  const [identityTargetCopy, setIdentityTargetCopy] = useState<BookCopy | null>(null);

  // Modals state
  const [isNewLoanOpen, setIsNewLoanOpen] = useState(false);
  const [preselectedBook, setPreselectedBook] = useState<Book | null>(null);
  const [preselectedCopy, setPreselectedCopy] = useState<BookCopy | null>(null);
  const [preselectedMember, setPreselectedMember] = useState<Member | null>(null);

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
  const [initialBookLocation, setInitialBookLocation] = useState<{
    sectionId?: string;
    themeId?: string;
    shelfId?: string;
  } | undefined>(undefined);

  const [isReturnBookOpen, setIsReturnBookOpen] = useState(false);

  const [isReserveCopyOpen, setIsReserveCopyOpen] = useState(false);
  const [reserveTargetBook, setReserveTargetBook] = useState<Book | null>(null);
  const [reserveTargetCopy, setReserveTargetCopy] = useState<BookCopy | null>(null);

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);

  const [selectedBookForDetail, setSelectedBookForDetail] = useState<Book | null>(null);
  const [selectedMemberForDetail, setSelectedMemberForDetail] = useState<Member | null>(null);

  const [returnLoanId, setReturnLoanId] = useState<string | null>(null);

  // Handlers pour le contrôle d'accès :
  // Quand quelqu'un clique sur « Emprunter » ou « Réserver », ouvre d'abord la vérification d'identité
  const handleRequestBorrow = (book?: Book | null, copy?: BookCopy | null) => {
    setIdentityActionType('borrow');
    setIdentityTargetBook(book || null);
    setIdentityTargetCopy(copy || null);
    setIsIdentityModalOpen(true);
  };

  const handleRequestReserve = (book: Book, copy: BookCopy) => {
    setIdentityActionType('reserve');
    setIdentityTargetBook(book);
    setIdentityTargetCopy(copy);
    setIsIdentityModalOpen(true);
  };

  const handleStudentIdentified = (student: Member) => {
    if (identityActionType === 'borrow') {
      if (identityTargetBook && identityTargetCopy) {
        // Emprunt direct de l'exemplaire ciblé pour cet étudiant identifié
        const res = borrowBook(identityTargetBook.id, student.id, identityTargetCopy.id);
        if (res.success) {
          addToast(
            'success',
            'Emprunt confirmé',
            `Exemplaire ${identityTargetCopy.copyNumber} de "${identityTargetBook.title}" emprunté par ${student.firstName} ${student.lastName} (Matricule : ${student.memberNumber}).`
          );
        }
      } else if (identityTargetBook) {
        // Trouver le premier exemplaire disponible
        const availableCopy = identityTargetBook.copies?.find((c) => c.status === 'Disponible');
        if (availableCopy) {
          const res = borrowBook(identityTargetBook.id, student.id, availableCopy.id);
          if (res.success) {
            addToast(
              'success',
              'Emprunt confirmé',
              `Exemplaire ${availableCopy.copyNumber} de "${identityTargetBook.title}" emprunté par ${student.firstName} ${student.lastName} (Matricule : ${student.memberNumber}).`
            );
          }
        } else {
          handleOpenNewLoan(identityTargetBook, null, student);
        }
      } else {
        // Emprunt libre (via guichet ou raccourci) avec l'étudiant identifié
        handleOpenNewLoan(null, null, student);
      }
    } else if (identityActionType === 'reserve') {
      if (identityTargetBook && identityTargetCopy) {
        // Réservation directe de l'exemplaire pour cet étudiant identifié
        const res = reserveBook(identityTargetBook.id, student.id, identityTargetCopy.id);
        if (res.success) {
          addToast(
            'success',
            'Réservation confirmée',
            `Exemplaire ${identityTargetCopy.copyNumber} de "${identityTargetBook.title}" réservé pour ${student.firstName} ${student.lastName} (Matricule : ${student.memberNumber}).`
          );
        }
      }
    }
  };

  const handleOpenNewLoan = (
    book?: Book | null,
    copy?: BookCopy | null,
    member?: Member | null
  ) => {
    setPreselectedBook(book || null);
    setPreselectedCopy(copy || null);
    setPreselectedMember(member || null);
    setIsNewLoanOpen(true);
  };

  const handleOpenNewBook = (location?: { sectionId?: string; themeId?: string; shelfId?: string }) => {
    setBookToEdit(null);
    setInitialBookLocation(location);
    setIsBookModalOpen(true);
  };

  const handleEditBook = (book: Book) => {
    setBookToEdit(book);
    setInitialBookLocation(undefined);
    setIsBookModalOpen(true);
  };

  const handleOpenNewMember = () => {
    setMemberToEdit(null);
    setIsMemberModalOpen(true);
  };

  const handleEditMember = (member: Member) => {
    setMemberToEdit(member);
    setIsMemberModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewLoan={() => handleRequestBorrow()}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Workspace Canvas */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Top Header - En-tête avec titre complet non tronqué */}
        <TopBar
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenNewLoan={() => handleRequestBorrow()}
          onOpenNewMember={handleOpenNewMember}
        />

        {/* Barre d'action juste sous l'en-tête (seulement écran principal des rayons) */}
        {activeTab === 'books' && browserLevel === 1 && (
          <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 shadow-xs">
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
              <button
                type="button"
                onClick={() => handleOpenNewBook()}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-sm active:scale-[0.99] border border-slate-800 cursor-pointer"
              >
                <BookPlus className="w-4 h-4 shrink-0 text-indigo-400" />
                <span>Ranger un livre</span>
              </button>

              <button
                type="button"
                onClick={() => setIsReturnBookOpen(true)}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-sm active:scale-[0.99] border border-indigo-700 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 shrink-0 text-white" />
                <span>Retourner un livre</span>
              </button>
            </div>
          </div>
        )}

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Books Consultation: 5-Level Physical Navigation (Sections -> Themes -> Shelves -> Titles -> Copies) */}
          {activeTab === 'books' && (
            <PhysicalLibraryBrowser
              level={browserLevel}
              onLevelChange={setBrowserLevel}
              onOpenNewBook={() => handleOpenNewBook()}
              onOpenReturnBook={() => setIsReturnBookOpen(true)}
              onQuickLoanBookCopy={(book, copy) => handleRequestBorrow(book, copy)}
              onSelectBookForDetail={(b) => setSelectedBookForDetail(b)}
              onOpenReserveCopyModal={(b, copy) => handleRequestReserve(b, copy)}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenNewLoan={() => handleRequestBorrow()}
              onOpenNewBook={() => handleOpenNewBook()}
              onOpenNewMember={handleOpenNewMember}
              onOpenReturnModal={(id) => setReturnLoanId(id)}
            />
          )}

          {activeTab === 'loans' && (
            <LoansView
              onOpenNewLoan={() => handleRequestBorrow()}
              onOpenReturnModal={(id) => setReturnLoanId(id)}
            />
          )}

          {activeTab === 'members' && (
            <MembersView
              onOpenNewMember={handleOpenNewMember}
              onEditMember={handleEditMember}
              onSelectMember={(m) => setSelectedMemberForDetail(m)}
              onQuickLoanForMember={(m) => handleOpenNewLoan(null, null, m)}
            />
          )}

          {activeTab === 'reservations' && (
            <ReservationsView
              onOpenNewLoan={() => handleRequestBorrow()}
            />
          )}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Modale de vérification d'identité (Contrôle d'accès étudiant obligatoire pour emprunter et réserver) */}
      <StudentIdentificationModal
        isOpen={isIdentityModalOpen}
        onClose={() => {
          setIsIdentityModalOpen(false);
          setIdentityTargetBook(null);
          setIdentityTargetCopy(null);
        }}
        actionType={identityActionType}
        book={identityTargetBook}
        copy={identityTargetCopy}
        onIdentified={handleStudentIdentified}
      />

      {/* Modals */}
      <NewLoanModal
        isOpen={isNewLoanOpen}
        onClose={() => {
          setIsNewLoanOpen(false);
          setPreselectedBook(null);
          setPreselectedCopy(null);
          setPreselectedMember(null);
        }}
        preselectedBook={preselectedBook}
        preselectedCopy={preselectedCopy}
        preselectedMember={preselectedMember}
      />

      <ReturnModal
        loanId={returnLoanId}
        onClose={() => setReturnLoanId(null)}
      />

      <BookModal
        isOpen={isBookModalOpen}
        onClose={() => {
          setIsBookModalOpen(false);
          setBookToEdit(null);
          setInitialBookLocation(undefined);
        }}
        bookToEdit={bookToEdit}
        initialLocation={initialBookLocation}
      />

      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => {
          setIsMemberModalOpen(false);
          setMemberToEdit(null);
        }}
        memberToEdit={memberToEdit}
      />

      <BookDetailModal
        book={selectedBookForDetail}
        onClose={() => setSelectedBookForDetail(null)}
        onEdit={(b) => {
          setSelectedBookForDetail(null);
          handleEditBook(b);
        }}
        onQuickLoan={(b, copy) => {
          setSelectedBookForDetail(null);
          handleRequestBorrow(b, copy);
        }}
      />

      <MemberDetailModal
        member={selectedMemberForDetail}
        onClose={() => setSelectedMemberForDetail(null)}
        onEdit={(m) => {
          setSelectedMemberForDetail(null);
          handleEditMember(m);
        }}
        onQuickLoan={(m) => {
          setSelectedMemberForDetail(null);
          handleOpenNewLoan(null, null, m);
        }}
        onOpenReturnModal={(id) => {
          setSelectedMemberForDetail(null);
          setReturnLoanId(id);
        }}
      />

      <ReturnBookModal
        isOpen={isReturnBookOpen}
        onClose={() => setIsReturnBookOpen(false)}
      />

      <ReserveCopyModal
        isOpen={isReserveCopyOpen}
        onClose={() => {
          setIsReserveCopyOpen(false);
          setReserveTargetBook(null);
          setReserveTargetCopy(null);
        }}
        book={reserveTargetBook}
        copy={reserveTargetCopy}
      />
    </div>
  );
}

export default function App() {
  return (
    <LibraryProvider>
      <LibraryApp />
    </LibraryProvider>
  );
}
