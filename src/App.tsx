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
  const [currentUser, setCurrentUser] = useState<CreatorUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Subscribe to Firebase Auth state & pop up Auth screen before user enters mainscreen
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user);
      
      // Check if user is opening a shared recipient link
      const params = new URLSearchParams(window.location.search);
      const isRecipientLink = Boolean(params.get('letter') || window.location.pathname.includes('/love/'));
      
      // If user is entering mainscreen and not logged in, pop up Auth screen immediately
      if (!user && !isRecipientLink) {
        setShowAuthModal(true);
      }
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
    try {
      const letter = await fetchLetter(id);
      if (letter) {
        setSharedLetter(letter);
        setActiveTab('shared-letter');
        setIsEnvelopeOpened(false);
        // Start Kalapastangan by fitterkarma for receiver
        kalapastanganAudio.play();
        romanticAudio.playTheme(letter.theme);
        // Mark as opened
        await markLetterOpened(id);
      }
    } catch (err) {
      console.error('Failed to load shared letter:', err);
    } finally {
      setIsLoadingShared(false);
    }
  };

  const handleOpenRecipientMode = (letterId: string) => {
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
              onClick={() => setActiveTab('create')}
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

        {/* Floating Creator Home Link on Shared View (hidden when password gate is active) */}
        {activeTab === 'shared-letter' && (!letterToRender.hasPassword || isEnvelopeOpened) && (
          <div className="fixed bottom-4 left-4 z-40">
            <button
              onClick={() => {
                // Clear URL param if going home
                window.history.pushState({}, '', window.location.pathname);
                setActiveTab('create');
                if (!currentUser) {
                  setShowAuthModal(true);
                }
              }}
              className="px-3.5 py-2 rounded-full bg-black/80 backdrop-blur-md border border-rose-900/60 text-xs text-rose-300 hover:text-white transition-colors shadow-lg flex items-center gap-2 font-cinzel"
            >
              <GothicLogo size="sm" showSubtitle={false} />
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

  // Creator & Home Navigation Layout
  return (
    <div className="min-h-screen bg-[#fcf9f6] dark:bg-[#0c0d12] text-neutral-900 dark:text-neutral-100 flex flex-col transition-colors duration-500">
      
      {/* Top Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Gothic Brand Logo */}
          <div 
            onClick={() => setActiveTab('create')}
            className="cursor-pointer group select-none"
          >
            <GothicLogo size="md" showSubtitle={true} />
          </div>

          {/* Center Navigation Links */}
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

          {/* Right Action Button */}
          <div className="flex items-center gap-2">
            {/* User Account / Auth Button */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 p-1 sm:px-3 sm:py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-sans-clean">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || ''}
                    className="w-5 h-5 rounded-full object-cover border border-rose-500/50"
                  />
                ) : (
                  <UserIcon className="w-4 h-4 text-rose-500" />
                )}
                <span className="font-medium max-w-[100px] sm:max-w-[130px] truncate hidden sm:inline text-neutral-800 dark:text-neutral-200">
                  {currentUser.displayName || currentUser.email}
                </span>
                <button
                  onClick={() => logoutCreator()}
                  title="Sign Out"
                  className="p-1 rounded-lg text-neutral-400 hover:text-rose-500 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:border-rose-500 text-neutral-700 dark:text-neutral-200 hover:text-rose-500 text-xs font-semibold font-cinzel transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-rose-500" />
                <span className="hidden sm:inline">Sign In / Connect</span>
                <span className="sm:hidden">Sign In</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('dashboard')}
              className="md:hidden p-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              title="Dashboard"
            >
              <LayoutDashboard className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab('create')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-700 via-rose-600 to-red-600 hover:from-rose-600 hover:to-red-500 text-white text-xs font-semibold font-cinzel tracking-wider shadow-md shadow-rose-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Letter</span>
              <span className="sm:hidden">Write</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1">
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
