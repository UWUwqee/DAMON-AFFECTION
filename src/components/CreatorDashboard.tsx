import React, { useState, useEffect } from 'react';
import { LetterData, CreatorUser } from '../types';
import { THEMES } from '../data/themes';
import { getCreatorLetters, deleteLetter, subscribeToLiveLetters } from '../services/letterService';
import { 
  Heart, CheckCircle2, Eye, Clock, Copy, Check, ExternalLink, Trash2, Plus, 
  RefreshCw, Sparkles, MessageSquareHeart, QrCode, Cloud, User, Camera, Radio
} from 'lucide-react';

interface Props {
  onNewLetter: () => void;
  onOpenLetter: (letterId: string) => void;
  onEditLetter: (letter: LetterData) => void;
  currentUser?: CreatorUser | null;
  onOpenAuth?: () => void;
}

export const CreatorDashboard: React.FC<Props> = ({
  onNewLetter,
  onOpenLetter,
  onEditLetter,
  currentUser,
  onOpenAuth
}) => {
  const [letters, setLetters] = useState<LetterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrModalLetter, setQrModalLetter] = useState<LetterData | null>(null);

  const loadLetters = async () => {
    setLoading(true);
    const data = await getCreatorLetters();
    setLetters(data);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    // Real-time live subscription to Firestore & local storage
    const unsubscribe = subscribeToLiveLetters(currentUser?.uid, (liveLetters) => {
      setLetters(liveLetters);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser?.uid]);

  const handleCopy = (id: string) => {
    const url = `${window.location.origin}/?letter=${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this love letter?')) {
      await deleteLetter(id);
      setLetters((prev) => prev.filter((l) => l.id !== id));
    }
  };

  const totalLetters = letters.length;
  const approvedLetters = letters.filter((l) => l.status === 'approved').length;
  const openedLetters = letters.filter((l) => l.status === 'opened').length;
  const totalViews = letters.reduce((acc, l) => acc + (l.viewCount || 0), 0);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-semibold uppercase tracking-wider mb-2 font-sans-clean">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Creator Relationship Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-vibes text-neutral-900 dark:text-white">
            My Love Letters & Approval Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-sans-clean mt-1">
            Track every letter you've sent, view real-time recipient opens, and celebrate heartfelt approvals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadLetters}
            title="Refresh status"
            className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-rose-500 hover:border-rose-300 dark:hover:border-neutral-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onNewLetter}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs sm:text-sm font-medium font-sans-clean shadow-md shadow-rose-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Letter</span>
          </button>
        </div>
      </div>

      {/* Firebase Cloud Sync Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-cinzel font-semibold text-neutral-900 dark:text-white">
                Live Cloud Sync Active (damons-affection)
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-sans-clean font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Updates</span>
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans-clean">
              {currentUser ? (
                <>Signed in as <strong className="text-neutral-800 dark:text-neutral-200">{currentUser.displayName || currentUser.email}</strong> • Letters backed up safely to Cloud</>
              ) : (
                <>Letters stored locally & synced with Firebase. Connect Google or sign in to save across all devices.</>
              )}
            </p>
          </div>
        </div>

        {!currentUser && onOpenAuth && (
          <button
            type="button"
            onClick={onOpenAuth}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 text-xs font-semibold font-cinzel tracking-wider transition-colors shadow-sm shrink-0"
          >
            Sign In / Connect Google
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 font-sans-clean block">
            Letters Created
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-bold font-sans-clean text-neutral-900 dark:text-white">
              {totalLetters}
            </span>
            <span className="text-xs text-neutral-400">Total</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md border border-rose-200/70 dark:border-rose-900/40 shadow-sm bg-gradient-to-br from-rose-50/50 dark:from-rose-950/20 to-transparent">
          <span className="text-xs font-medium text-rose-600 dark:text-rose-400 font-sans-clean block flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>Approved by Recipient</span>
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-bold font-sans-clean text-rose-600 dark:text-rose-400">
              {approvedLetters}
            </span>
            <span className="text-xs text-rose-400 font-sans-clean">
              {totalLetters > 0 ? `${Math.round((approvedLetters / totalLetters) * 100)}%` : '0%'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 font-sans-clean block flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-blue-500" />
            <span>Opened / Read</span>
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-bold font-sans-clean text-neutral-900 dark:text-white">
              {openedLetters}
            </span>
            <span className="text-xs text-neutral-400">Letters</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 font-sans-clean block flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Total Reads</span>
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-bold font-sans-clean text-neutral-900 dark:text-white">
              {totalViews}
            </span>
            <span className="text-xs text-neutral-400">Views</span>
          </div>
        </div>
      </div>

      {/* Letters List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 font-sans-clean flex items-center gap-2">
          <span>Sent Letters ({letters.length})</span>
        </h2>

        {letters.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl bg-white/50 dark:bg-neutral-900/40 border border-dashed border-neutral-300 dark:border-neutral-800">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center text-3xl mb-4 text-rose-500">
              💌
            </div>
            <h3 className="text-xl font-vibes text-neutral-800 dark:text-neutral-200">
              You haven't written any letters yet
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans-clean max-w-sm mx-auto mt-1 mb-6">
              Create your very first personalized animated love letter in seconds without needing an account.
            </p>
            <button
              onClick={onNewLetter}
              className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium font-sans-clean inline-flex items-center gap-2 shadow-md shadow-rose-600/20"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>Write My First Letter</span>
            </button>
          </div>
        ) : (
          letters.map((letter) => {
            const themeConfig = THEMES[letter.theme] || THEMES['blooming-heart'];
            const isApproved = letter.status === 'approved';
            const isOpened = letter.status === 'opened';

            return (
              <div
                key={letter.id}
                className={`p-5 sm:p-6 rounded-3xl border transition-all duration-300 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md ${
                  isApproved 
                    ? 'border-rose-300 dark:border-rose-900/60 shadow-lg shadow-rose-500/5 ring-1 ring-rose-400/20' 
                    : 'border-neutral-200 dark:border-neutral-800/90 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left details */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {/* Theme Badge */}
                      <span 
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium font-sans-clean text-white"
                        style={{ backgroundColor: themeConfig.accentColor }}
                      >
                        {themeConfig.name}
                      </span>

                      {/* Approval / Status Badge */}
                      {isApproved ? (
                        <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-semibold font-sans-clean animate-pulse-subtle">
                          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                          <span>Approved by {letter.recipientName}!</span>
                        </span>
                      ) : isOpened ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-medium font-sans-clean">
                          <Eye className="w-3 h-3" />
                          <span>Opened ({letter.viewCount} views)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-[11px] font-medium font-sans-clean">
                          <Clock className="w-3 h-3" />
                          <span>Awaiting recipient</span>
                        </span>
                      )}

                      <span className="text-xs text-neutral-400 font-sans-clean">
                        Created {new Date(letter.createdAt).toLocaleDateString()}
                      </span>

                      {/* Multi-page badge */}
                      {letter.pages && letter.pages.length > 1 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px] font-medium font-sans-clean border border-neutral-200 dark:border-neutral-700">
                          <span>📄 {letter.pages.length} Pages</span>
                        </span>
                      )}

                      {/* Photo Attached badge */}
                      {(letter.imageUrl || letter.pages?.some((p) => p.imageUrl)) && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[11px] font-medium font-sans-clean border border-rose-200 dark:border-rose-900/50">
                          <Camera className="w-3 h-3" />
                          <span>Photo Attached</span>
                        </span>
                      )}

                      {/* Password Protected badge */}
                      {letter.hasPassword && letter.password && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-medium font-sans-clean border border-amber-500/20" title={`Passcode: ${letter.password}`}>
                          <span>🔒 Key: {letter.password}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl sm:text-2xl font-vibes text-neutral-900 dark:text-white">
                      To: {letter.recipientName}
                    </h3>

                    {letter.title && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 font-cormorant italic text-sm mt-0.5">
                        "{letter.title}"
                      </p>
                    )}

                    {/* Sweet response box if approved */}
                    {isApproved && letter.recipientResponse && (
                      <div className="mt-3 p-3 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5">
                        <span className="text-2xl">{letter.recipientResponse.reactionEmoji || '❤️'}</span>
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 font-sans-clean block">
                            Recipient's Reply
                          </span>
                          <p className="text-xs font-cormorant italic text-sm text-neutral-800 dark:text-neutral-200">
                            "{letter.recipientResponse.message}"
                          </p>
                          <span className="text-[10px] text-neutral-400 font-sans-clean block mt-0.5">
                            Approved at {new Date(letter.recipientResponse.respondedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-100 dark:border-neutral-800">
                    {/* Copy Link */}
                    <button
                      onClick={() => handleCopy(letter.id)}
                      className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-medium font-sans-clean flex items-center gap-1.5 transition-colors"
                      title="Copy Unique Link"
                    >
                      {copiedId === letter.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500 font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>

                    {/* QR Code */}
                    <button
                      onClick={() => setQrModalLetter(letter)}
                      className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
                      title="Show QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>

                    {/* View/Preview */}
                    <button
                      onClick={() => onOpenLetter(letter.id)}
                      className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium font-sans-clean flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open View</span>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(letter.id)}
                      className="p-2 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Delete letter"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* QR Code Modal */}
      {qrModalLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 text-center shadow-2xl">
            <h4 className="text-lg font-vibes text-neutral-900 dark:text-white mb-1">
              Letter for {qrModalLetter.recipientName}
            </h4>
            <p className="text-xs text-neutral-500 font-sans-clean mb-4">
              Scan this QR code with any smartphone to open the letter
            </p>

            <div className="w-48 h-48 mx-auto bg-white p-2 rounded-2xl shadow-inner border border-neutral-100 flex items-center justify-center mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  `${window.location.origin}/?letter=${qrModalLetter.id}`
                )}`}
                alt="QR Code"
                className="w-full h-full object-contain"
              />
            </div>

            <button
              onClick={() => setQrModalLetter(null)}
              className="w-full py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-medium font-sans-clean text-neutral-800 dark:text-neutral-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
