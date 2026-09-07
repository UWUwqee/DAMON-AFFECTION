import React, { useState, useEffect, useRef } from 'react';
import { LetterData, LetterPage } from '../types';
import { THEMES } from '../data/themes';
import { romanticAudio } from '../audio/romanticAudio';
import { submitRecipientResponse } from '../services/letterService';
import { 
  Heart, 
  Send, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';

interface Props {
  letter: LetterData;
  isRecipientView?: boolean;
  onUpdateLetter?: (updated: LetterData) => void;
}

export const LetterPresentation: React.FC<Props> = ({ 
  letter, 
  isRecipientView = true,
  onUpdateLetter 
}) => {
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');
  const [selectedReaction, setSelectedReaction] = useState('❤️');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLetter, setCurrentLetter] = useState<LetterData>(letter);

  // Multi-page navigation state:
  // Written pages are index 0 to (writtenPages.length - 1).
  // The dedicated Recipient Response page is index writtenPages.length.
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const letterPaperRef = useRef<HTMLDivElement>(null);

  const themeConfig = THEMES[currentLetter.theme] || THEMES['blooming-heart'];

  // Resolve written pages
  const writtenPages: LetterPage[] = 
    currentLetter.pages && currentLetter.pages.length > 0
      ? currentLetter.pages
      : [
          {
            id: 'page-default',
            pageNumber: 1,
            title: currentLetter.title,
            content: currentLetter.content,
            imageUrl: currentLetter.imageUrl,
            imageCaption: currentLetter.imageCaption
          }
        ];

  // Total display pages = written letter pages + 1 dedicated response page!
  const totalDisplayPages = writtenPages.length + 1;
  const isResponsePage = currentPageIndex === writtenPages.length;
  const activePage = !isResponsePage ? (writtenPages[currentPageIndex] || writtenPages[0]) : null;

  // Sync state if prop changes
  useEffect(() => {
    setCurrentLetter(letter);
    if (currentPageIndex >= (letter.pages?.length || 1) + 1) {
      setCurrentPageIndex(0);
    }
  }, [letter]);

  // Audio lifecycle
  useEffect(() => {
    if (currentLetter.musicEnabled) {
      romanticAudio.playTheme(currentLetter.theme);
      setIsPlayingMusic(true);
    }
  }, [currentLetter.theme, currentLetter.musicEnabled]);

  const toggleMusic = () => {
    const nextState = romanticAudio.toggle(currentLetter.theme);
    setIsPlayingMusic(nextState);
  };

  // Display page text immediately so receiver can read the letter without waiting
  useEffect(() => {
    if (isResponsePage) {
      setDisplayedText('');
      setIsTypingComplete(true);
      return;
    }

    const pageText = activePage?.content || '';
    setDisplayedText(pageText);
    setIsTypingComplete(true);
  }, [activePage?.content, currentLetter.theme, currentPageIndex, isResponsePage]);

  const handleNextPage = () => {
    if (currentPageIndex < totalDisplayPages - 1) {
      setCurrentPageIndex((prev) => prev + 1);
      setTimeout(() => {
        letterPaperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex((prev) => prev - 1);
      setTimeout(() => {
        letterPaperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  const handleApprove = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const optimisticLetter: LetterData = {
      ...currentLetter,
      status: 'approved',
      recipientResponse: {
        approved: true,
        reactionEmoji: selectedReaction || '❤️',
        message: approvalNote || 'I accept with all my heart ❤️',
        respondedAt: new Date().toISOString()
      }
    };

    // Update the screen immediately while the cloud write completes.
    setCurrentLetter(optimisticLetter);
    onUpdateLetter?.(optimisticLetter);
    try {
      romanticAudio.playApprovalChime();
      setShowCelebration(true);

      const updated = await submitRecipientResponse(
        currentLetter.id,
        selectedReaction,
        approvalNote || 'I accept with all my heart ❤️'
      );

      if (updated) {
        setCurrentLetter(updated);
        onUpdateLetter?.(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Picture for current page
  const pagePictureUrl = activePage?.imageUrl || (currentPageIndex === 0 ? currentLetter.imageUrl : undefined);
  const pagePictureCaption = activePage?.imageCaption || (currentPageIndex === 0 ? currentLetter.imageCaption : undefined);

  return (
    <div className="relative w-full max-w-3xl mx-auto my-4 sm:my-8 px-3 sm:px-4">
      {/* Floating Hearts Celebration Effect when Recipient Approves */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-rose-500 animate-float-heart"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${60 + Math.random() * 40}%`,
                fontSize: `${16 + Math.random() * 28}px`,
                animationDelay: `${Math.random() * 2.5}s`,
                animationDuration: `${3 + Math.random() * 3}s`
              }}
            >
              {['❤️', '💖', '💕', '🌹', '✨', '💍', '💘'][i % 7]}
            </div>
          ))}
        </div>
      )}

      {/* Discreet Floating Audio Mute/Unmute Toggle (Bottom-Right, no song banner) */}
      <div className="fixed bottom-4 right-4 z-30">
        <button
          onClick={toggleMusic}
          className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white/80 hover:text-white flex items-center justify-center transition-all shadow-lg hover:scale-105 active:scale-95"
          title={isPlayingMusic ? 'Mute background audio' : 'Play background audio'}
        >
          {isPlayingMusic ? <Volume2 className="w-4 h-4 text-rose-400" /> : <VolumeX className="w-4 h-4 text-neutral-400" />}
        </button>
      </div>

      {/* Main Love Letter Paper */}
      <div 
        ref={letterPaperRef}
        className={`relative rounded-3xl p-6 sm:p-10 md:p-12 border shadow-2xl transition-all duration-700 ${themeConfig.letterBg} ${themeConfig.letterBorder}`}
      >
        {/* Subtle glowing pulse container aura */}
        <div 
          className="absolute -inset-1 rounded-3xl blur-lg opacity-25 pointer-events-none -z-10"
          style={{ backgroundColor: themeConfig.accentColor }}
        />

        {/* Letter Top Header */}
        <div className="border-b border-neutral-300/40 dark:border-neutral-700/50 pb-6 mb-6">
          <div className="flex items-center justify-between text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-cinzel mb-2">
            <div className="flex items-center gap-1 font-semibold">
              <span>Damon’s Affection</span>
              <span className="text-rose-500">†</span>
            </div>
            <span>{currentLetter.date}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-vibes text-neutral-900 dark:text-neutral-50 tracking-wide">
            Dearest {currentLetter.recipientName || 'Beloved'},
          </h2>

          {!isResponsePage && (activePage?.title || currentLetter.title) && (
            <h3 className="text-lg sm:text-xl font-cormorant italic text-neutral-700 dark:text-neutral-200 mt-2 font-medium">
              "{activePage?.title || currentLetter.title}"
            </h3>
          )}

          {isResponsePage && (
            <h3 className="text-lg sm:text-xl font-cormorant italic text-rose-600 dark:text-rose-400 mt-2 font-medium">
              "Awaiting Your Heart’s Response"
            </h3>
          )}
        </div>

        {/* -------------------- WRITTEN LETTER PAGES (Page 1 to Page N) -------------------- */}
        {!isResponsePage && (
          <>
            {/* Letter Body for Current Page with Typography & Animations */}
            <div className={`min-h-[160px] text-lg sm:text-xl md:text-2xl leading-relaxed whitespace-pre-line ${themeConfig.fontFamily} ${themeConfig.primaryTextColor} transition-all duration-300`}>
              {currentLetter.theme === 'warmth-of-us' ? (
                displayedText.split('\n\n').map((para, pIdx) => (
                  <p 
                    key={pIdx} 
                    className="mb-6 p-2 -mx-2 rounded-xl transition-all duration-300 hover:bg-rose-500/10 hover:translate-x-1 cursor-default"
                  >
                    {para}
                  </p>
                ))
              ) : currentLetter.theme === 'seasons-of-love' ? (
                displayedText.split('\n\n').map((para, pIdx) => (
                  <p 
                    key={pIdx} 
                    className="mb-6 animate-float-slow"
                    style={{ animationDuration: `${6 + pIdx * 1.5}s` }}
                  >
                    {para}
                  </p>
                ))
              ) : currentLetter.theme === 'ocean-of-my-heart' ? (
                <div className="drop-shadow-[0_2px_12px_rgba(45,212,191,0.25)]">
                  {displayedText}
                </div>
              ) : currentLetter.theme === 'starlit-promise' ? (
                <div className="drop-shadow-[0_0_15px_rgba(165,180,252,0.35)]">
                  {displayedText}
                </div>
              ) : (
                <div className="relative">
                  {displayedText}
                  {!isTypingComplete && (
                    <span className="inline-block w-2 h-5 ml-1 bg-rose-500 animate-pulse align-middle" />
                  )}
                </div>
              )}
            </div>

            {/* Attached Picture in the Letter (if creator added a picture) */}
            {pagePictureUrl && (
              <div className="my-8 flex flex-col items-center animate-fade-in">
                <div className="group relative p-3 sm:p-4 bg-white/95 dark:bg-neutral-900/90 rounded-2xl shadow-xl border border-neutral-200/80 dark:border-neutral-700/80 max-w-md w-full transition-transform duration-300 hover:scale-[1.01]">
                  <img
                    src={pagePictureUrl}
                    alt={pagePictureCaption || "Cherished love memory"}
                    className="w-full h-auto max-h-80 object-cover rounded-xl shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  {pagePictureCaption && (
                    <p className="mt-2.5 text-center text-sm font-cormorant italic text-neutral-700 dark:text-neutral-300">
                      "{pagePictureCaption}"
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Letter Sign-off Footer (Displayed on the last written letter page) */}
            {currentPageIndex === writtenPages.length - 1 && (
              <div className="border-t border-neutral-300/40 dark:border-neutral-700/50 pt-8 mt-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in">
                <div>
                  <span className="block text-xs uppercase tracking-widest text-neutral-400 font-sans-clean mb-1">
                    With all of my devotion,
                  </span>
                  <span className="text-2xl sm:text-3xl font-script text-neutral-900 dark:text-neutral-100 tracking-wider">
                    {currentLetter.senderName || 'Yours Always'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 font-sans-clean self-start sm:self-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Sealed with love • {currentLetter.viewCount || 1} {currentLetter.viewCount === 1 ? 'view' : 'views'}</span>
                </div>
              </div>
            )}

            {/* Navigation Button Bar at Bottom of Written Pages */}
            <div className="flex items-center justify-between gap-4 pt-8 mt-8 border-t border-neutral-200/60 dark:border-neutral-800/60 font-cinzel">
              {currentPageIndex > 0 ? (
                <button
                  type="button"
                  onClick={handlePrevPage}
                  className="px-4 py-2.5 rounded-xl border border-current/25 hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-1.5 text-current transition-colors text-xs font-medium opacity-75 hover:opacity-100"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous Page</span>
                </button>
              ) : (
                <div />
              )}

              {currentPageIndex < writtenPages.length - 1 ? (
                /* Turn to next written page */
                <button
                  type="button"
                  onClick={handleNextPage}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-rose-700 via-rose-600 to-red-600 hover:from-rose-600 hover:to-red-500 text-white font-bold text-xs sm:text-sm tracking-wider flex items-center gap-2.5 transition-all shadow-lg shadow-rose-600/35 hover:scale-[1.03] active:scale-[0.98]"
                >
                  <span>Turn to Page {currentPageIndex + 2}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                /* On last written page: Turn to the dedicated Recipient Response Page! */
                <button
                  type="button"
                  onClick={handleNextPage}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs sm:text-sm tracking-wider flex items-center gap-2.5 transition-all shadow-lg shadow-rose-600/35 hover:scale-[1.03] active:scale-[0.98]"
                >
                  <span>Turn to Final Page (Your Heart Seal)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </>
        )}

        {/* -------------------- DEDICATED LAST PAGE: RECIPIENT RESPONSE -------------------- */}
        {isResponsePage && (
          <div className="py-4 animate-fade-in">
            {currentLetter.status === 'approved' && currentLetter.recipientResponse ? (
              /* Already Approved State */
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 dark:bg-rose-950/60 border-2 border-rose-500 flex items-center justify-center text-4xl mb-4 shadow-lg animate-bounce" style={{ animationDuration: '2.5s' }}>
                  {currentLetter.recipientResponse.reactionEmoji || '💖'}
                </div>
                
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold uppercase tracking-wider mb-2 font-cinzel">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Heart Seal Delivered & Approved</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-vibes text-rose-600 dark:text-rose-400 mt-1">
                  Your Heart Has Answered!
                </h3>

                {currentLetter.recipientResponse.message && (
                  <blockquote className="mt-4 max-w-md mx-auto p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-current/10 text-base font-cormorant italic text-current shadow-inner">
                    "{currentLetter.recipientResponse.message}"
                  </blockquote>
                )}

                <p className="text-xs opacity-75 mt-4 font-sans-clean">
                  Sealed on {new Date(currentLetter.recipientResponse.respondedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            ) : (
              /* Interactive Recipient Heart Seal Card (Matches exact design from user image) */
              <div className="max-w-xl mx-auto text-center">
                {/* Header Badge */}
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-medium mb-3 font-cinzel">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
                  <span className="tracking-widest uppercase">Recipient Heart Seal</span>
                </div>

                {/* Subtitle */}
                <h3 className="text-2xl sm:text-3xl font-vibes text-neutral-900 dark:text-neutral-50 mb-1">
                  How does your heart respond?
                </h3>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 font-sans-clean font-medium mb-6">
                  Let {currentLetter.senderName || 'Yours Always'} know this letter touched your soul.
                </p>

                {/* 5 Reaction Emoji Buttons */}
                <div className="flex justify-center items-center gap-3 mb-6">
                  {[
                    { emoji: '❤️', label: 'Love' },
                    { emoji: '💖', label: 'Sparkle' },
                    { emoji: '🌹', label: 'Rose' },
                    { emoji: '✨', label: 'Magic' },
                    { emoji: '💋', label: 'Kiss' },
                  ].map((item) => (
                    <button
                      key={item.emoji}
                      type="button"
                      onClick={() => setSelectedReaction(item.emoji)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all transform hover:scale-110 shadow-sm ${
                        selectedReaction === item.emoji
                          ? 'bg-rose-500 text-white scale-110 shadow-lg shadow-rose-500/40 ring-2 ring-rose-400'
                          : 'bg-black/5 dark:bg-white/10 hover:bg-rose-100 dark:hover:bg-white/20'
                      }`}
                      title={item.label}
                    >
                      {item.emoji}
                    </button>
                  ))}
                </div>

                {/* Sweet Note Input - High Contrast dark font for Receiver Response */}
                <div className="mb-5 text-left">
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 font-cinzel mb-1.5 tracking-wider uppercase">
                    Your Response:
                  </label>
                  <input
                    type="text"
                    value={approvalNote}
                    onChange={(e) => setApprovalNote(e.target.value)}
                    placeholder="Write a sweet note back (e.g., 'I love you with all my heart')..."
                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-rose-300 dark:border-rose-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-sans-clean font-medium text-sm sm:text-base placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm"
                    maxLength={200}
                  />
                </div>

                {/* Approve & Send Love Back Button */}
                <div className="flex justify-center mb-6">
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 hover:from-rose-500 hover:to-pink-500 text-white text-xs sm:text-sm tracking-wider shadow-xl shadow-rose-600/35 hover:shadow-rose-600/55 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 font-cinzel font-bold disabled:opacity-60 uppercase"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    <span>{isSubmitting ? 'Sealing with love...' : 'Approve & Send Love Back'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Back button to return to letter pages */}
            <div className="flex justify-start pt-6 mt-6 border-t border-rose-200/40 dark:border-rose-900/40 font-cinzel">
              <button
                type="button"
                onClick={handlePrevPage}
                className="px-4 py-2.5 rounded-xl border border-rose-300 dark:border-rose-700 bg-white/60 dark:bg-black/40 hover:bg-white dark:hover:bg-neutral-800 flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200 transition-all text-xs font-semibold shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>← Previous Page (Back to Letter)</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
