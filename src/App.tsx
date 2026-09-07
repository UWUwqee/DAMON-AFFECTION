import React, { useState, useEffect } from 'react';
import { LetterData, ThemeId } from './types';
import { THEMES } from './data/themes';
import { fetchLetter, markLetterOpened } from './services/letterService';
import { kalapastanganAudio } from './audio/kalapastanganAudio';
import { romanticAudio } from './audio/romanticAudio';
import { LetterEditor } from './components/LetterEditor';
import { CreatorDashboard } from './components/CreatorDashboard';
import { ThemeGalleryView } from './components/ThemeGalleryView';
import { EnvelopeView } from './components/EnvelopeView';
import { LetterPresentation } from './components/LetterPresentation';
import { ThemeBackground } from './components/themes/ThemeBackground';
import { ShareModal } from './components/ShareModal';
import { GothicLogo } from './components/GothicLogo';
import { AuthModal } from './components/AuthModal';
import { AuthScreen } from './components/AuthScreen';
import { subscribeToAuth, logoutCreator } from './services/firebase';
import { CreatorUser } from './types';
import { Heart, Plus, Sparkles, LayoutDashboard, Palette, ArrowLeft, LogIn, LogOut, User as UserIcon } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'create' | 'dashboard' | 'gallery' | 'shared-letter' | 'preview-full'>('create');
  const [currentLetter, setCurrentLetter] = useState<LetterData | null>(null);
  const [sharedLetter, setSharedLetter] = useState<LetterData | null>(null);
  const [isEnvelopeOpened, setIsEnvelopeOpened] = useState(false);
  const [shareModalLetter, setShareModalLetter] = useState<LetterData | null>(null);
  const [selectedThemeForEditor, setSelectedThemeForEditor] = useState<ThemeId>('blooming-heart');
  const [isLoadingShared, setIsLoadingShared] = useState(false);
  const [hasLoadedShared, setHasLoadedShared] = useState(false);
  const [currentUser, setCurrentUser] = useState<CreatorUser | null>(null);
  const [isAuthInitializing, setIsAuthInitializing] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Subscribe to Firebase Auth state
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user);
      setIsAuthInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  // Ensure background song plays smoothly as soon as receiver opens the link and touches the screen
  useEffect(() => {
    if (activeTab === 'shared-letter' && sharedLetter) {
      // Immediate attempt to play background track
      kalapastanganAudio.play();
      romanticAudio.playTheme(sharedLetter.theme);

      // On any first gesture / click, ensure audio context unlocks and plays smoothly
      const startAudioSmoothly = () => {
        kalapastanganAudio.play();
        romanticAudio.playTheme(sharedLetter.theme);
      };

      window.addEventListener('click', startAudioSmoothly, { passive: true });
      window.addEventListener('touchstart', startAudioSmoothly, { passive: true });
      window.addEventListener('pointerdown', startAudioSmoothly, { passive: true });
      window.addEventListener('keydown', startAudioSmoothly, { passive: true });

      return () => {
        window.removeEventListener('click', startAudioSmoothly);
        window.removeEventListener('touchstart', startAudioSmoothly);
        window.removeEventListener('pointerdown', startAudioSmoothly);
        window.removeEventListener('keydown', startAudioSmoothly);
      };
    }
  }, [activeTab, sharedLetter]);

  // Check URL on load for ?letter=code or /love/code
  useEffect(() => {
    const parseLetterIdFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const paramLetter = params.get('letter');
      if (paramLetter) return paramLetter;

      // Check path e.g. /love/[code]
      const pathParts = window.location.pathname.split('/');
      const loveIdx = pathParts.indexOf('love');
      if (loveIdx >= 0 && pathParts[loveIdx + 1]) {
        return pathParts[loveIdx + 1];
      }

      return null;
    };

    const letterId = parseLetterIdFromUrl();
    if (letterId) {
      loadSharedLetter(letterId);
    }
  }, []);

  const loadSharedLetter = async (id: string) => {
    setIsLoadingShared(true);
    setHasLoadedShared(false);
    setActiveTab('shared-letter');
    try {
      const letter = await fetchLetter(id);
      if (letter) {
        setSharedLetter(letter);
        // Shared links open directly to the letter. Password-protected links
        // stay on the password gate until the recipient unlocks them.
        setIsEnvelopeOpened(!letter.hasPassword || !letter.password);
        // Start Kalapastangan by fitterkarma for receiver
        kalapastanganAudio.play();
        romanticAudio.playTheme(letter.theme);
        // Mark as opened
        // Do not hold the recipient on a loader while recording analytics.
        void markLetterOpened(id).catch((err) => {
          console.warn('Could not record letter open:', err);
        });
      }
    } catch (err) {
      console.error('Failed to load shared letter:', err);
    } finally {
      setIsLoadingShared(false);
      setHasLoadedShared(true);
    }
  };

  const handleOpenRecipientMode = (letterId: string) => {
    try {
      window.history.pushState({}, '', `/?letter=${letterId}`);
    } catch {}
    loadSharedLetter(letterId);
  };

  const handleLetterGenerated = (letter: LetterData) => {
    setCurrentLetter(letter);
    setShareModalLetter(letter);
  };

  const handlePreviewFull = (draftLetter: LetterData) => {
    setSharedLetter(draftLetter);
    setActiveTab('preview-full');
    setIsEnvelopeOpened(false);
  };

  const handleSelectThemeFromGallery = (themeId: ThemeId) => {
    setSelectedThemeForEditor(themeId);
    setActiveTab('create');
  };

  const handleSignOut = async () => {
    try {
      await logoutCreator();
    } catch (e) {
      console.warn(e);
    }
    setCurrentUser(null);
  };

  // Check if current URL is a recipient shared link
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const isRecipientUrl = Boolean(params?.get('letter') || (typeof window !== 'undefined' && window.location.pathname.includes('/love/')));

  // A recipient link is public and must never wait for creator auth to resolve.
  // Keep the first render in a small loading state while the letter request is in flight.
  if (isRecipientUrl && (isLoadingShared || !hasLoadedShared)) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center font-sans-clean">
        <div className="text-center animate-fade-in">
          <GothicLogo size="sm" showSubtitle={false} />
          <p className="mt-4 text-xs text-rose-300 font-cinzel tracking-widest">Opening your love letter...</p>
        </div>
      </div>
    );
  }

  // While checking initial Firebase auth state, show romantic sanctuary loader (if not opening a shared recipient letter)
  if (isAuthInitializing && !isRecipientUrl) {
    return (
      <div className="min-h-screen bg-[#0c0d12] text-white flex flex-col items-center justify-center font-sans-clean">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <GothicLogo size="lg" showSubtitle={true} />
          <div className="flex items-center gap-2 text-xs text-rose-400 font-cinzel tracking-widest mt-4">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>Entering Damon’s Sanctuary...</span>
          </div>
        </div>
      </div>
    );
  }

  // If in recipient / shared-letter mode or full preview mode:
  if (activeTab === 'shared-letter' || activeTab === 'preview-full') {
    const letterToRender = sharedLetter;

    if (!letterToRender) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white font-sans-clean">
          <div className="text-center p-6">
            <div className="flex justify-center mb-3">
              <GothicLogo size="sm" showSubtitle={false} />
            </div>
            <h2 className="text-2xl font-cinzel text-rose-400 mb-2">Love Letter Not Found</h2>
            <p className="text-xs text-neutral-400 mb-4 font-sans-clean">This link might have expired or is incorrect.</p>
            <button
              onClick={() => {
                window.history.pushState({}, '', window.location.pathname.replace(/\/love\/.*$/, '/').replace(/\?.*$/, ''));
                setActiveTab('create');
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-cinzel font-semibold text-white tracking-wider"
            >
              Go to Damon’s Affection Home
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="relative min-h-screen overflow-x-hidden font-sans-clean">
        {/* Animated Theme Background */}
        <ThemeBackground theme={letterToRender.theme} />

        {/* Floating Top Bar for Preview Navigation */}
        {activeTab === 'preview-full' && (
          <div className="fixed top-4 left-4 right-4 z-40 max-w-lg mx-auto p-2.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white text-xs flex items-center justify-between shadow-xl">
            <button
              onClick={() => setActiveTab('create')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors font-cinzel"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Editor</span>
            </button>
            <span className="font-semibold text-rose-400 hidden sm:inline font-cinzel text-[11px] tracking-wider uppercase">Recipient Preview</span>
            <button
              onClick={() => setIsEnvelopeOpened(!isEnvelopeOpened)}
              className="px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 transition-colors font-cinzel font-medium text-xs tracking-wider"
            >
              {isEnvelopeOpened ? 'Re-seal Envelope' : 'Open Letter'}
            </button>
          </div>
        )}

        {/* Main Content: Either Envelope or Letter Presentation */}
        <div className="relative z-10 min-h-screen flex flex-col justify-center">
          {!isEnvelopeOpened ? (
            <EnvelopeView
              letter={letterToRender}
              onOpen={() => setIsEnvelopeOpened(true)}
            />
          ) : (
            <LetterPresentation
              letter={letterToRender}
              isRecipientView={activeTab === 'shared-letter'}
              onUpdateLetter={(updated) => setSharedLetter(updated)}
            />
          )}
        </div>
      </div>
    );
  }

  // MANDATORY AUTH GATE: Users must sign in on auth screen before entering mainscreen or creating a letter
  if (!currentUser) {
    return (
      <AuthScreen
        onSuccess={(user) => {
          setCurrentUser(user);
        }}
      />
    );
  }

  // Creator & Home Navigation Layout
  return (
    <div className="min-h-screen bg-[#fcf9f6] dark:bg-[#0c0d12] text-neutral-900 dark:text-neutral-100 flex flex-col transition-colors duration-500">
      
      {/* Top Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-neutral-950/85 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Gothic Brand Logo */}
          <div 
            onClick={() => setActiveTab('create')}
            className="cursor-pointer group select-none shrink-0"
          >
            <GothicLogo size="sm" showSubtitle={false} className="sm:hidden" />
            <GothicLogo size="md" showSubtitle={false} className="hidden sm:flex" />
          </div>

          {/* Desktop & Tablet Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 font-cinzel text-xs font-semibold tracking-wider">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'create'
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Write Letter
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'gallery'
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Animated Moods</span>
            </button>
          </nav>

          {/* Right Action Button & User Info */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {currentUser && (
              <div className="flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-sans-clean">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || ''}
                    className="w-5 h-5 rounded-full object-cover border border-rose-500/50"
                  />
                ) : (
                  <UserIcon className="w-4 h-4 text-rose-500" />
                )}
                <span className="font-medium max-w-[80px] sm:max-w-[130px] truncate text-[11px] sm:text-xs text-neutral-800 dark:text-neutral-200">
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </span>
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-1 rounded-lg text-neutral-400 hover:text-rose-500 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={() => setActiveTab('create')}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-700 via-rose-600 to-red-600 hover:from-rose-600 hover:to-red-500 text-white text-xs font-semibold font-cinzel tracking-wider shadow-md shadow-rose-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Letter</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body (with bottom padding for mobile navigation bar) */}
      <main className="flex-1 pb-24 md:pb-8">
        {activeTab === 'create' && (
          <LetterEditor
            initialLetter={null}
            onLetterGenerated={handleLetterGenerated}
            onPreviewFull={handlePreviewFull}
          />
        )}

        {activeTab === 'dashboard' && (
          <CreatorDashboard
            onNewLetter={() => setActiveTab('create')}
            onOpenLetter={handleOpenRecipientMode}
            onEditLetter={(letter) => {
              setCurrentLetter(letter);
              setActiveTab('create');
            }}
            currentUser={currentUser}
            onOpenAuth={() => setShowAuthModal(true)}
          />
        )}

        {activeTab === 'gallery' && (
          <ThemeGalleryView onSelectThemeToCreate={handleSelectThemeFromGallery} />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Optimized for iPhone / Android / Handhelds) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-800/80 px-2 py-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-2xl flex items-center justify-around">
        <button
          onClick={() => setActiveTab('create')}
          className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl text-[11px] font-sans-clean font-semibold transition-all ${
            activeTab === 'create'
              ? 'text-rose-400 font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <div className={`p-1.5 rounded-lg mb-0.5 ${activeTab === 'create' ? 'bg-rose-500/20 text-rose-400' : ''}`}>
            <Plus className="w-4 h-4" />
          </div>
          <span>Write</span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl text-[11px] font-sans-clean font-semibold transition-all ${
            activeTab === 'dashboard'
              ? 'text-rose-400 font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <div className={`p-1.5 rounded-lg mb-0.5 ${activeTab === 'dashboard' ? 'bg-rose-500/20 text-rose-400' : ''}`}>
            <LayoutDashboard className="w-4 h-4" />
          </div>
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl text-[11px] font-sans-clean font-semibold transition-all ${
            activeTab === 'gallery'
              ? 'text-rose-400 font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <div className={`p-1.5 rounded-lg mb-0.5 ${activeTab === 'gallery' ? 'bg-rose-500/20 text-rose-400' : ''}`}>
            <Palette className="w-4 h-4" />
          </div>
          <span>Moods</span>
        </button>
      </nav>

      {/* Auth Modal for Creators (Register / Login / Google) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setShowAuthModal(false);
        }}
      />

      {/* Share Modal when letter is generated */}
      {shareModalLetter && (
        <ShareModal
          letter={shareModalLetter}
          isOpen={!!shareModalLetter}
          onClose={() => setShareModalLetter(null)}
          onViewRecipientMode={handleOpenRecipientMode}
          onGoToDashboard={() => setActiveTab('dashboard')}
        />
      )}
    </div>
  );
}
