import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import {
  X,
  Camera,
  Upload,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { Book, BookCopy, Loan } from '../types/library';
import { resolveScannedQRCode } from '../utils/qrHelper';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'loan' | 'return' | 'any';
  onScanSuccess: (result: {
    book: Book;
    copy: BookCopy;
    loan?: Loan;
  }) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  mode,
  onScanSuccess,
}) => {
  const { books, loans } = useLibrary();

  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'quick'>('camera');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<{
    book: Book;
    copy: BookCopy;
    loan?: Loan;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const handleScanText = useCallback(
    (text: string) => {
      const res = resolveScannedQRCode(text, books, loans);
      if (res.found && res.book && res.copy) {
        setErrorMessage(null);
        setScannedResult({
          book: res.book,
          copy: res.copy,
          loan: res.loan,
        });
      } else {
        setErrorMessage(res.error || 'Code QR invalide ou exemplaire inconnu.');
      }
    },
    [books, loans]
  );

  // Frame tick scanner loop
  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          handleScanText(code.data);
          return; // Pause scanning on match
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanFrame);
  }, [handleScanText]);

  // Start camera when tab is camera & modal is open
  useEffect(() => {
    if (!isOpen || activeTab !== 'camera' || scannedResult) {
      stopCamera();
      return;
    }

    setCameraError(null);
    let isCancelled = false;

    navigator.mediaDevices
      ?.getUserMedia({
        video: { facingMode: 'environment' },
      })
      .then((stream) => {
        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.play().catch(() => {});
          animationFrameRef.current = requestAnimationFrame(scanFrame);
        }
      })
      .catch((err) => {
        console.warn('Camera access error:', err);
        setCameraError(
          'Impossible d’activer la webcam directement (autorisation refusée ou environnement restreint). Utilisez le téléversement d’image ou la sélection rapide ci-dessous.'
        );
        setActiveTab('quick');
      });

    return () => {
      isCancelled = true;
      stopCamera();
    };
  }, [isOpen, activeTab, scannedResult, scanFrame, stopCamera]);

  // Handle uploaded image file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          handleScanText(code.data);
        } else {
          setErrorMessage('Aucun code QR détecté dans cette image. Essayez une image plus nette.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleScanText(manualCode);
  };

  const handleConfirmAction = () => {
    if (scannedResult) {
      onScanSuccess(scannedResult);
      onClose();
    }
  };

  const handleResetScan = () => {
    setScannedResult(null);
    setErrorMessage(null);
    if (activeTab === 'camera') {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
    }
  };

  if (!isOpen) return null;

  // Flatten sample copies for quick selector
  const allCopiesWithBooks: { book: Book; copy: BookCopy; loan?: Loan }[] = [];
  books.forEach((b) => {
    b.copies?.forEach((c) => {
      const loan = loans.find(
        (l) => l.status !== 'Terminé' && (l.copyId === c.id || l.copyIdentifier === c.copyIdentifier)
      );
      allCopiesWithBooks.push({ book: b, copy: c, loan });
    });
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-5 sm:p-6 shadow-2xl relative max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {mode === 'loan'
                  ? 'Scanner le code QR de l’exemplaire à prêter'
                  : mode === 'return'
                  ? 'Scanner le code QR de l’exemplaire à restituer'
                  : 'Scanner le code QR d’un exemplaire'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Identification instantanée de l’exemplaire physique
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-3.5 space-y-4 text-xs">
          {/* Mode Tabs */}
          {!scannedResult && (
            <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('camera');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'camera'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Caméra en direct</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('upload');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Fichier / Photo</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('quick');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'quick'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Sélection rapide</span>
              </button>
            </div>
          )}

          {/* Camera View */}
          {!scannedResult && activeTab === 'camera' && (
            <div className="space-y-3">
              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Target box guide */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-dashed border-indigo-400 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                    <span className="text-[10px] text-white/90 font-mono bg-black/60 px-2 py-0.5 rounded">
                      Centrez le code QR
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 text-center">
                Pointez l'objectif vers l'étiquette QR collée sur le livre.
              </p>
            </div>
          )}

          {/* Upload View */}
          {!scannedResult && activeTab === 'upload' && (
            <div className="space-y-3">
              <label className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50 transition-colors">
                <Upload className="w-8 h-8 text-indigo-600 mb-2" />
                <span className="font-semibold text-slate-800 text-xs">
                  Cliquez pour téléverser une image du QR
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  PNG, JPG ou photo prise depuis votre smartphone
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Or manual copy identifier */}
              <form onSubmit={handleManualSubmit} className="pt-2">
                <span className="text-[11px] font-bold text-slate-700 block mb-1">
                  Ou saisissez le numéro d’identification de l’exemplaire :
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="ex: EX-CAMUS-01 ou EX-BDD-001"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl cursor-pointer"
                  >
                    Valider
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Quick Selection / Simulator View */}
          {!scannedResult && activeTab === 'quick' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Exemplaires enregistrés dans la bibliothèque :
                </span>
                <span className="text-[10px] text-slate-400">
                  {allCopiesWithBooks.length} exemplaires
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Cliquez sur un exemplaire pour simuler la lecture immédiate de son QR code :
              </p>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {allCopiesWithBooks.map(({ book, copy, loan }) => {
                  const isBorrowed = copy.status === 'Emprunté' || !!loan;
                  return (
                    <button
                      key={copy.id}
                      type="button"
                      onClick={() =>
                        setScannedResult({
                          book,
                          copy,
                          loan,
                        })
                      }
                      className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition-all flex items-center justify-between gap-2 cursor-pointer bg-white"
                    >
                      <div className="truncate">
                        <div className="font-bold text-slate-900 truncate">
                          {book.title}
                        </div>
                        <div className="text-[11px] font-mono text-indigo-700">
                          {copy.copyIdentifier}
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          isBorrowed
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isBorrowed ? 'Emprunté' : 'Disponible'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="text-xs">{errorMessage}</div>
            </div>
          )}

          {/* Camera Error banner */}
          {cameraError && activeTab === 'camera' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div className="text-xs">{cameraError}</div>
            </div>
          )}

          {/* SCANNED RESULT CARD */}
          {scannedResult && (
            <div className="space-y-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-xs">Exemplaire scanné avec succès</span>
                </div>
                <button
                  type="button"
                  onClick={handleResetScan}
                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Scanner un autre</span>
                </button>
              </div>

              {/* Details card */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2.5">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Ouvrage
                  </span>
                  <div className="text-sm font-bold text-slate-900">
                    {scannedResult.book.title}
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    {scannedResult.book.author} · {scannedResult.book.publisher}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Numéro d'exemplaire
                    </span>
                    <span className="font-mono font-bold text-indigo-700 text-xs">
                      {scannedResult.copy.copyIdentifier}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Emplacement physique
                    </span>
                    <span className="text-slate-800 text-[11px] font-medium block">
                      {scannedResult.book.shelfName}
                    </span>
                  </div>
                </div>

                {/* Status breakdown */}
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Statut actuel
                  </span>
                  {scannedResult.copy.status === 'Emprunté' || scannedResult.loan ? (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                      <div className="font-bold text-xs">Actuellement emprunté</div>
                      <div className="text-[11px] text-slate-700">
                        Par : <strong>{scannedResult.loan?.memberName || scannedResult.copy.borrowerName || 'Étudiant'}</strong> (Matricule : {scannedResult.loan?.memberNumber || scannedResult.copy.borrowerMemberNumber || 'N/A'})
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Date de retour prévue : {scannedResult.loan?.dueDate || scannedResult.copy.dueDate}
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                      <div className="font-bold text-xs">Disponible en rayon</div>
                      <div className="text-[11px] text-emerald-700">
                        Prêt pour être assigné à un étudiant.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {scannedResult ? (
            <button
              type="button"
              onClick={handleConfirmAction}
              className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Continuer avec cet exemplaire</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
