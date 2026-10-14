import React, { useState } from 'react';
import { LibraryProvider, useLibrary } from './context/LibraryContext';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { StudentSection } from './components/StudentSection';
import { BooksSection } from './components/BooksSection';
import { LoansSection } from './components/LoansSection';
import { ToastContainer } from './components/ToastContainer';
import { NewLoanModal } from './components/NewLoanModal';
import { ReturnModal } from './components/ReturnModal';
import { BookModal } from './components/BookModal';
import { MemberModal } from './components/MemberModal';
import { StudentIdentificationModal } from './components/StudentIdentificationModal';
import { QRScannerModal } from './components/QRScannerModal';
import { Book, BookCopy, Member } from './types/library';

function LibraryApp() {
  const { borrowBook, addToast } = useLibrary();

  // Navigation tab state: strictly 'student' | 'books' | 'loans'
  const [activeTab, setActiveTab] = useState<ActiveTab>('student');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals state
  const [isNewLoanOpen, setIsNewLoanOpen] = useState(false);
  const [preselectedBook, setPreselectedBook] = useState<Book | null>(null);
  const [preselectedCopy, setPreselectedCopy] = useState<BookCopy | null>(null);
  const [preselectedMember, setPreselectedMember] = useState<Member | null>(null);

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [returnLoanId, setReturnLoanId] = useState<string | null>(null);

  // Student Identity check for loan action
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [identityTargetBook, setIdentityTargetBook] = useState<Book | null>(null);
  const [identityTargetCopy, setIdentityTargetCopy] = useState<BookCopy | null>(null);

  // Global QR Scanner
  const [isGlobalQRScannerOpen, setIsGlobalQRScannerOpen] = useState(false);

  const handleGlobalScan = (result: { book: Book; copy: BookCopy; loan?: any }) => {
    if (result.copy.status === 'Emprunté' || result.loan) {
      if (result.loan) {
        setReturnLoanId(result.loan.id);
      } else {
        addToast('error', 'Exemplaire emprunté', `L'exemplaire ${result.copy.copyIdentifier} est actuellement emprunté.`);
      }
    } else {
      handleRequestBorrow(result.book, result.copy);
    }
  };

  const handleRequestBorrow = (book?: Book | null, copy?: BookCopy | null) => {
    setIdentityTargetBook(book || null);
    setIdentityTargetCopy(copy || null);
    setIsIdentityModalOpen(true);
  };

  const handleStudentIdentified = (student: Member) => {
    if (identityTargetBook && identityTargetCopy) {
      const res = borrowBook(identityTargetBook.id, student.id, identityTargetCopy.id);
      if (res.success) {
        addToast(
          'success',
          'Emprunt confirmé',
          `Exemplaire ${identityTargetCopy.copyIdentifier} de "${identityTargetBook.title}" prêté à ${student.firstName} ${student.lastName} (Matricule : ${student.memberNumber}).`
        );
      }
    } else if (identityTargetBook) {
      const availableCopy = identityTargetBook.copies?.find((c) => c.status === 'Disponible');
      if (availableCopy) {
        const res = borrowBook(identityTargetBook.id, student.id, availableCopy.id);
        if (res.success) {
          addToast(
            'success',
            'Emprunt confirmé',
            `Exemplaire ${availableCopy.copyIdentifier} de "${identityTargetBook.title}" prêté à ${student.firstName} ${student.lastName} (Matricule : ${student.memberNumber}).`
          );
        }
      } else {
        handleOpenNewLoan(identityTargetBook, null, student);
      }
    } else {
      handleOpenNewLoan(null, null, student);
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

  const handleOpenNewBook = () => {
    setBookToEdit(null);
    setIsBookModalOpen(true);
  };

  const handleOpenNewMember = () => {
    setIsMemberModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Sidebar: 3 tabs only */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewLoan={() => handleRequestBorrow()}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Top Header */}
        <TopBar
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenNewLoan={() => handleRequestBorrow()}
          onOpenQRScanner={() => setIsGlobalQRScannerOpen(true)}
        />

        {/* Content View: 3 parts */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* 1. ÉTUDIANT */}
          {activeTab === 'student' && (
            <StudentSection
              onOpenNewMember={handleOpenNewMember}
              onOpenReturnModal={(loanId) => setReturnLoanId(loanId)}
            />
          )}

          {/* 2. OUVRAGE */}
          {activeTab === 'books' && (
            <BooksSection
              onOpenNewBook={handleOpenNewBook}
              onQuickLoan={(book, copy) => handleRequestBorrow(book, copy)}
              onQuickReturn={(loanId) => setReturnLoanId(loanId)}
            />
          )}

          {/* 3. EMPRUNT */}
          {activeTab === 'loans' && (
            <LoansSection
              onOpenNewLoan={() => handleRequestBorrow()}
              onOpenReturnModal={(loanId) => setReturnLoanId(loanId)}
            />
          )}
        </main>
      </div>

      {/* Student Identity Verification Modal */}
      <StudentIdentificationModal
        isOpen={isIdentityModalOpen}
        onClose={() => setIsIdentityModalOpen(false)}
        book={identityTargetBook}
        copy={identityTargetCopy}
        onIdentified={handleStudentIdentified}
      />

      {/* New Loan Modal */}
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
        onSwitchToReturn={(loanId) => setReturnLoanId(loanId)}
      />

      {/* Return Modal */}
      <ReturnModal
        loanId={returnLoanId}
        onClose={() => setReturnLoanId(null)}
      />

      {/* Book Add/Edit Modal */}
      <BookModal
        isOpen={isBookModalOpen}
        onClose={() => {
          setIsBookModalOpen(false);
          setBookToEdit(null);
        }}
        bookToEdit={bookToEdit}
      />

      {/* Member Add Modal */}
      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
      />

      {/* Global QR Scanner Modal */}
      <QRScannerModal
        isOpen={isGlobalQRScannerOpen}
        onClose={() => setIsGlobalQRScannerOpen(false)}
        mode="any"
        onScanSuccess={handleGlobalScan}
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
