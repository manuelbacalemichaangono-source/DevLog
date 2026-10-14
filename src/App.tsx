import React, { useState } from 'react';
import { LibraryProvider } from './context/LibraryContext';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { DashboardView } from './components/DashboardView';
import { PhysicalLibraryBrowser } from './components/PhysicalLibraryBrowser';
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
import { Book, BookCopy, Member } from './types/library';

function LibraryApp() {
  // Par défaut sur 'books' (Plan & Consultation des Rayons)
  const [activeTab, setActiveTab] = useState<ActiveTab>('books');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Handlers
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
        onOpenNewLoan={() => handleOpenNewLoan()}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Workspace Canvas */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Top Header - En-tête avec titre complet non tronqué */}
        <TopBar
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenNewLoan={() => handleOpenNewLoan()}
          onOpenNewMember={handleOpenNewMember}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Books Consultation: 5-Level Physical Navigation (Sections -> Themes -> Shelves -> Titles -> Copies) */}
          {activeTab === 'books' && (
            <PhysicalLibraryBrowser
              onOpenNewBook={() => handleOpenNewBook()}
              onOpenReturnBook={() => setIsReturnBookOpen(true)}
              onQuickLoanBookCopy={(book, copy) => handleOpenNewLoan(book, copy, null)}
              onSelectBookForDetail={(b) => setSelectedBookForDetail(b)}
              onOpenReserveCopyModal={(b, copy) => {
                setReserveTargetBook(b);
                setReserveTargetCopy(copy);
                setIsReserveCopyOpen(true);
              }}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenNewLoan={() => handleOpenNewLoan()}
              onOpenNewBook={() => handleOpenNewBook()}
              onOpenNewMember={handleOpenNewMember}
              onOpenReturnModal={(id) => setReturnLoanId(id)}
            />
          )}

          {activeTab === 'loans' && (
            <LoansView
              onOpenNewLoan={() => handleOpenNewLoan()}
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
              onOpenNewLoan={() => handleOpenNewLoan()}
            />
          )}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

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
          handleOpenNewLoan(b, copy, null);
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
