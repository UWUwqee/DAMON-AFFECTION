import React, { useState } from 'react';
import { LetterData, ThemeId, EnvelopeSeal, LetterPage } from '../types';
import { THEMES, SAMPLE_LETTERS } from '../data/themes';
import { ThemeSelector } from './ThemeSelector';
import { ThemeBackground } from './themes/ThemeBackground';
import { LetterPresentation } from './LetterPresentation';
import { createLetter, requestRomanticSpark } from '../services/letterService';
import { 
  Sparkles, Heart, Feather, Eye, Wand2, Link2, Check, Music, Calendar, 
  Plus, Trash2, Lock, KeyRound, EyeOff, FileText, BookOpen, AlertCircle,
  Camera, Upload, Image as ImageIcon
} from 'lucide-react';

interface Props {
  initialLetter?: LetterData | null;
  onLetterGenerated: (letter: LetterData) => void;
  onPreviewFull: (letter: LetterData) => void;
}

export const LetterEditor: React.FC<Props> = ({
  initialLetter,
  onLetterGenerated,
  onPreviewFull
}) => {
  const [theme, setTheme] = useState<ThemeId>(initialLetter?.theme || 'blooming-heart');
  const [recipientName, setRecipientName] = useState(initialLetter?.recipientName || 'My Beloved');
  const [senderName, setSenderName] = useState(initialLetter?.senderName || 'Yours Always');
  const [date, setDate] = useState(
    initialLetter?.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  );
  const [title, setTitle] = useState(initialLetter?.title || 'Every Beat Belongs To You');
  
  // Multi-Page state
  const [pages, setPages] = useState<LetterPage[]>(() => {
    if (initialLetter?.pages && initialLetter.pages.length > 0) {
      return initialLetter.pages;
    }
    return [
      {
        id: 'page-1',
        pageNumber: 1,
        title: initialLetter?.title || 'Every Beat Belongs To You',
        content: initialLetter?.content || SAMPLE_LETTERS['blooming-heart'].content
      }
    ];
  });
  const [activePageIndex, setActivePageIndex] = useState<number>(0);

  // Password Protection state
  const [hasPassword, setHasPassword] = useState<boolean>(
    Boolean(initialLetter?.hasPassword || initialLetter?.password)
  );
  const [password, setPassword] = useState<string>(initialLetter?.password || '');
  const [passwordHint, setPasswordHint] = useState<string>(initialLetter?.passwordHint || '');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [musicEnabled, setMusicEnabled] = useState(initialLetter?.musicEnabled ?? true);
  const [envelopeSeal, setEnvelopeSeal] = useState<EnvelopeSeal>(initialLetter?.envelopeSeal || 'wax-heart');

  // AI assistant states
  const [isSparking, setIsSparking] = useState(false);
  const [sparkPrompt, setSparkPrompt] = useState('');
  const [showSparkModal, setShowSparkModal] = useState(false);

  // Active editor tab for mobile view (Form vs Live Preview)
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [isCreating, setIsCreating] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const activePage = pages[activePageIndex] || pages[0];

  const handleSelectTheme = (newTheme: ThemeId) => {
    setTheme(newTheme);
  };

  const loadSamplePreset = (presetTheme: ThemeId) => {
    const sample = SAMPLE_LETTERS[presetTheme];
    if (sample) {
      setTitle(sample.title);
      setRecipientName(sample.recipientName);
      setSenderName(sample.senderName);
      setPages([
        {
          id: `page-${Date.now()}-1`,
          pageNumber: 1,
          title: sample.title,
          content: sample.content
        }
      ]);
      setActivePageIndex(0);
    }
  };

  // Add Page handler
  const handleAddPage = () => {
    const nextNum = pages.length + 1;
    const newPage: LetterPage = {
      id: `page-${Date.now()}-${nextNum}`,
      pageNumber: nextNum,
      title: `Page ${nextNum}`,
      content: ''
    };
    const updated = [...pages, newPage];
    setPages(updated);
    setActivePageIndex(updated.length - 1);
  };

  // Remove Page handler
  const handleRemovePage = (indexToRemove: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (pages.length <= 1) return;
    const updated = pages
      .filter((_, idx) => idx !== indexToRemove)
      .map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    setPages(updated);
    if (activePageIndex >= updated.length) {
      setActivePageIndex(updated.length - 1);
    }
  };

  // Update current page content
  const updateCurrentPageContent = (newContent: string) => {
    setPages((prev) =>
      prev.map((p, idx) => (idx === activePageIndex ? { ...p, content: newContent } : p))
    );
  };

  // Update current page title
  const updateCurrentPageTitle = (newTitle: string) => {
    setPages((prev) =>
      prev.map((p, idx) => (idx === activePageIndex ? { ...p, title: newTitle } : p))
    );
  };

  // Update picture for current page
  const updateCurrentPageImage = (imageUrl: string, imageCaption?: string) => {
    setPages((prev) =>
      prev.map((p, idx) =>
        idx === activePageIndex ? { ...p, imageUrl, imageCaption: imageCaption !== undefined ? imageCaption : p.imageCaption } : p
      )
    );
  };

  // Remove picture for current page
  const removeCurrentPageImage = () => {
    setPages((prev) =>
      prev.map((p, idx) =>
        idx === activePageIndex ? { ...p, imageUrl: undefined, imageCaption: undefined } : p
      )
    );
  };

  // Handle local file upload
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        updateCurrentPageImage(result, activePage?.imageCaption || '');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateAISpark = async () => {
    setIsSparking(true);
    try {
      const generated = await requestRomanticSpark(
        sparkPrompt || 'deep love and gratefulness',
        THEMES[theme].mood,
        recipientName
      );
      if (generated) {
        const currentContent = activePage?.content || '';
        const updated = currentContent ? `${currentContent}\n\n${generated}` : generated;
        updateCurrentPageContent(updated);
        setShowSparkModal(false);
        setSparkPrompt('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSparking(false);
    }
  };

  const currentDraftLetter: LetterData = {
    id: initialLetter?.id || 'draft-preview',
    creatorToken: initialLetter?.creatorToken || 'draft',
    theme,
    recipientName,
    senderName,
    date,
    title: pages[0]?.title || title,
    content: pages[0]?.content || '',
    imageUrl: pages[0]?.imageUrl,
    imageCaption: pages[0]?.imageCaption,
    pages,
    musicEnabled,
    envelopeSeal,
    hasPassword,
    password: hasPassword ? password : undefined,
    passwordHint: hasPassword ? passwordHint : undefined,
    createdAt: initialLetter?.createdAt || new Date().toISOString(),
    viewCount: initialLetter?.viewCount || 0,
    status: initialLetter?.status || 'unread'
  };

  const handlePublish = async () => {
    setValidationError(null);

    // Validate that at least one page has text
    const hasAnyContent = pages.some((p) => p.content.trim().length > 0);
    if (!hasAnyContent) {
      setValidationError('Please write some heartfelt words on at least one page of your letter!');
      return;
    }

    // Validate password if enabled
    if (hasPassword && !password.trim()) {
      setValidationError('You enabled Password Protection. Please enter a secret passcode or disable the lock.');
      return;
    }

    setIsCreating(true);
    try {
      const result = await createLetter({
        id: initialLetter?.id,
        theme,
        recipientName,
        senderName,
        date,
        title: pages[0]?.title || title,
        content: pages[0]?.content || '',
        imageUrl: pages[0]?.imageUrl,
        imageCaption: pages[0]?.imageCaption,
        pages,
        musicEnabled,
        envelopeSeal,
        hasPassword,
        password: hasPassword && password.trim() ? password.trim() : undefined,
        passwordHint: hasPassword && passwordHint.trim() ? passwordHint.trim() : undefined
      });
      onLetterGenerated(result);
    } catch (err) {
      console.error('Publish error:', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:py-8">
      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex items-center justify-center p-1 rounded-2xl bg-neutral-200 dark:bg-neutral-800 max-w-xs mx-auto mb-6">
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold font-sans-clean transition-all ${
            mobileTab === 'editor'
              ? 'bg-white dark:bg-neutral-900 text-rose-600 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400'
          }`}
        >
          Letter Creator
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold font-sans-clean transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'preview'
              ? 'bg-white dark:bg-neutral-900 text-rose-600 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Live Animation</span>
        </button>
      </div>

      {/* Main Grid: Left Editor & Right Live Animated Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: The Letter Editor Form */}
        <div className={`lg:col-span-7 space-y-6 ${mobileTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
          
          {/* Header Banner with Gothic Charm */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-rose-600/10 to-transparent pointer-events-none rounded-bl-full" />
            
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold uppercase tracking-wider font-cinzel">
                <Heart className="w-3.5 h-3.5 fill-rose-500" />
                <span>Damon’s Affection</span>
              </span>
              <span className="text-[11px] text-neutral-400 font-cinzel uppercase tracking-wider">Multi-Page & Passcode Protected</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-cinzel font-bold text-neutral-900 dark:text-white tracking-wide">
              Craft an Eternal Love Letter
            </h1>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 font-sans-clean mt-1">
              Select your animated romantic theme, write multiple pages of memories, lock it with a private passcode seal, and send a timeless link.
            </p>
          </div>

          {/* Step 1: Theme Selector with Instant 'Add Page' Quick Action */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <ThemeSelector selectedTheme={theme} onSelectTheme={handleSelectTheme} />

            {/* Quick Action Bar under Theme: Add a Page & Total Count */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-200/70 dark:border-neutral-800/70">
              <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 font-sans-clean">
                <BookOpen className="w-4 h-4 text-rose-500" />
                <span>Total Letter Pages: <strong className="text-rose-600 dark:text-rose-400 font-bold">{pages.length}</strong></span>
              </div>

              <button
                type="button"
                onClick={handleAddPage}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-semibold font-cinzel tracking-wider shadow-md shadow-rose-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add a Page</span>
              </button>
            </div>
          </div>

          {/* Step 2: Multi-Page Manager & Editor Tabs */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white font-cinzel tracking-wide">
                  Letter Pages & Content
                </h3>
              </div>

              {/* Add Page Button */}
              <button
                type="button"
                onClick={handleAddPage}
                className="text-xs px-3 py-1.5 rounded-xl border border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold font-sans-clean flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Page</span>
              </button>
            </div>

            {/* Page Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {pages.map((page, index) => {
                const isActive = activePageIndex === index;
                return (
                  <div
                    key={page.id}
                    onClick={() => setActivePageIndex(index)}
                    className={`group shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-sans-clean font-medium cursor-pointer transition-all border ${
                      isActive
                        ? 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/20'
                        : 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-rose-300'
                    }`}
                  >
                    <span>Page {index + 1}</span>
                    {pages.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleRemovePage(index, e)}
                        title="Delete page"
                        className={`p-0.5 rounded transition-colors ${
                          isActive
                            ? 'text-rose-100 hover:text-white hover:bg-rose-600'
                            : 'text-neutral-400 hover:text-rose-500 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                        }`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Multi-Page Receiver Guidance Note */}
            {pages.length > 1 && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-sans-clean text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <span className="text-base">✨</span>
                <span>
                  <strong>Multi-page active ({pages.length} pages):</strong> Your receiver will see clear <strong>Next Page</strong> buttons and arrows to turn from Page 1 to Page 2, Page 3, etc. Try clicking it in the live preview on the right!
                </span>
              </div>
            )}

            {/* Current Page Subtitle / Heading */}
            <div>
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 font-sans-clean block mb-1">
                Page {activePageIndex + 1} Heading / Subtitle
              </label>
              <input
                type="text"
                value={activePage?.title || ''}
                onChange={(e) => updateCurrentPageTitle(e.target.value)}
                placeholder="e.g. In The Quiet Moments..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white/50 dark:bg-neutral-950/50 text-sm font-sans-clean focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            {/* Letter Body Area for Current Page with AI Romantic Spark */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 font-sans-clean">
                  Page {activePageIndex + 1} Words of Devotion *
                </label>
                <button
                  type="button"
                  onClick={() => setShowSparkModal(true)}
                  className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-500 font-medium font-sans-clean transition-colors"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>AI Romantic Spark ✨</span>
                </button>
              </div>

              <textarea
                value={activePage?.content || ''}
                onChange={(e) => updateCurrentPageContent(e.target.value)}
                rows={8}
                placeholder={`Write the words for Page ${activePageIndex + 1}... Your recipient can turn pages smoothly to read all your thoughts.`}
                className="w-full p-4 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white/50 dark:bg-neutral-950/50 text-sm font-sans-clean leading-relaxed focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all placeholder:text-neutral-400"
              />

              <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-1 font-sans-clean">
                <span>Separate paragraphs with empty lines for gentle floating rhythm</span>
                <span>{(activePage?.content || '').length} characters on this page</span>
              </div>
            </div>

            {/* Picture in Letter for Creator */}
            <div className="pt-3 border-t border-neutral-200/70 dark:border-neutral-800/70">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-rose-500" />
                  <span className="text-xs font-cinzel font-semibold text-neutral-800 dark:text-neutral-200">
                    Picture for Page {activePageIndex + 1} (Optional)
                  </span>
                </div>
                {activePage?.imageUrl && (
                  <button
                    type="button"
                    onClick={removeCurrentPageImage}
                    className="text-[11px] text-rose-500 hover:text-rose-600 font-sans-clean flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove Picture</span>
                  </button>
                )}
              </div>

              {activePage?.imageUrl ? (
                <div className="p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative group shrink-0">
                    <img
                      src={activePage.imageUrl}
                      alt="Page thumbnail"
                      className="w-24 h-24 object-cover rounded-xl shadow-md border border-neutral-300 dark:border-neutral-700"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <ImageIcon className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div className="flex-1 w-full space-y-2 font-sans-clean">
                    <div>
                      <label className="text-[11px] text-neutral-500 dark:text-neutral-400 block mb-1">
                        Romantic Caption (Shown below picture)
                      </label>
                      <input
                        type="text"
                        value={activePage.imageCaption || ''}
                        onChange={(e) => updateCurrentPageImage(activePage.imageUrl!, e.target.value)}
                        placeholder="e.g. Under the stars where we first held hands..."
                        className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer text-[11px] text-rose-500 hover:underline">
                        Change image
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleImageFileUpload}
                        />
                      </label>
                      <span className="text-[10px] text-neutral-400">• Recipient will see this inside the love letter</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-950/40 space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Device Upload Button */}
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500/10 to-pink-500/10 hover:from-rose-500/20 hover:to-pink-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold font-cinzel border border-rose-500/20 transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Picture</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageFileUpload}
                      />
                    </label>

                    <span className="text-xs text-neutral-400 font-sans-clean">or paste image link:</span>

                    {/* Image URL Input */}
                    <div className="flex-1 min-w-[200px] flex items-center gap-1.5">
                      <input
                        type="url"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-sans-clean focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (imageUrlInput.trim()) {
                            updateCurrentPageImage(imageUrlInput.trim());
                            setImageUrlInput('');
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-sans-clean font-medium transition-colors"
                      >
                        Attach
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-400 font-sans-clean">
                    Photos will be elegantly framed like romantic vintage keepsakes for your recipient.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Password Protection Seal (User Requested) */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 shadow-inner">
                  <Lock className="w-4 h-4 text-rose-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white font-cinzel tracking-wide flex items-center gap-1.5">
                    <span>Secret Passcode Seal</span>
                    {hasPassword && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        Protected
                      </span>
                    )}
                  </h3>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 font-sans-clean block">
                    Recipient must enter the secret key before opening the letter
                  </span>
                </div>
              </div>

              {/* Password toggle switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasPassword}
                  onChange={(e) => setHasPassword(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            {hasPassword && (
              <div className="space-y-3 pt-2 border-t border-neutral-200/80 dark:border-neutral-800/80 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Secret Password Field */}
                  <div>
                    <label className="text-xs font-cinzel font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Secret Passcode *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="e.g. ourfirstkiss, 0924, sweetheart"
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white/50 dark:bg-neutral-950/50 text-sm font-sans-clean focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Hint Field */}
                  <div>
                    <label className="text-xs font-cinzel font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Recipient Hint (Optional)
                    </label>
                    <input
                      type="text"
                      value={passwordHint}
                      onChange={(e) => setPasswordHint(e.target.value)}
                      placeholder="e.g. The day we first met under the rain"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white/50 dark:bg-neutral-950/50 text-sm font-sans-clean focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-sans-clean">
                  When your recipient clicks the letter link, an ornate gothic security seal will prompt them for this secret key before opening the envelope.
                </p>
              </div>
            )}
          </div>

          {/* Step 4: Names & Customization */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white font-cinzel tracking-wide flex items-center gap-2">
                <Feather className="w-4 h-4 text-rose-500" />
                <span>Names & Envelope Details</span>
              </h3>

              {/* Sample Preset Dropdown */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-neutral-400 font-sans-clean hidden sm:inline">Templates:</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      loadSamplePreset(e.target.value as ThemeId);
                      setTheme(e.target.value as ThemeId);
                    }
                  }}
                  defaultValue=""
                  className="text-xs px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 font-sans-clean focus:outline-none"
                >
                  <option value="" disabled>Inspiration presets...</option>
                  <option value="blooming-heart">🌸 Sweet Confession</option>
                  <option value="starlit-promise">🌌 Starlit Distance</option>
                  <option value="warmth-of-us">🔥 Warm & Passionate</option>
                  <option value="seasons-of-love">🍂 Enduring Seasons</option>
                  <option value="ocean-of-my-heart">🌊 Ocean of Peace</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Recipient Name */}
              <div>
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 font-sans-clean block mb-1">
                  Recipient Name (Their Name) *
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. My Darling Sophia, Sweetheart"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white/50 dark:bg-neutral-950/50 text-sm font-sans-clean focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              {/* Sender Name */}
              <div>
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 font-sans-clean block mb-1">
                  Sender Sign-off (Your Name) *
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Forever Yours, Damon"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white/50 dark:bg-neutral-950/50 text-sm font-sans-clean focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              {/* Main Letter Title */}
              <div>
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 font-sans-clean block mb-1">
                  Overall Letter Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Every Beat Belongs To You"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white/50 dark:bg-neutral-950/50 text-sm font-sans-clean focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              {/* Date */}
              <div>
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 font-sans-clean block mb-1">
                  Date
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="e.g. September 7, 2026 or Our Anniversary"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white/50 dark:bg-neutral-950/50 text-sm font-sans-clean focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                  <Calendar className="w-4 h-4 text-neutral-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Wax Seal Selector */}
            <div>
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 font-sans-clean block mb-2">
                Envelope Wax Seal Emblem
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'wax-heart' as EnvelopeSeal, icon: '❤️', label: 'Heart' },
                  { id: 'golden-rose' as EnvelopeSeal, icon: '🌹', label: 'Rose' },
                  { id: 'celestial-star' as EnvelopeSeal, icon: '✨', label: 'Star' },
                  { id: 'ocean-pearl' as EnvelopeSeal, icon: '🌊', label: 'Pearl' },
                  { id: 'botanical-leaf' as EnvelopeSeal, icon: '🌿', label: 'Botanical' },
                ].map((seal) => (
                  <button
                    key={seal.id}
                    type="button"
                    onClick={() => setEnvelopeSeal(seal.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-sans-clean transition-all ${
                      envelopeSeal === seal.id
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-semibold ring-1 ring-rose-500'
                        : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <span>{seal.icon}</span>
                    <span>{seal.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Music Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <Music className="w-4 h-4 text-rose-500" />
                <div>
                  <span className="text-xs font-medium text-neutral-900 dark:text-white font-sans-clean block">
                    Play Background Song
                  </span>
                  <span className="text-[11px] text-rose-500 font-cinzel font-medium">
                    Kalapastangan — fitterkarma
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={musicEnabled}
                  onChange={(e) => setMusicEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            {/* Validation Error Banner */}
            {validationError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-400 font-sans-clean animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Action Publish Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handlePublish}
                disabled={isCreating}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-700 via-red-600 to-rose-600 hover:from-rose-600 hover:to-red-500 text-white font-cinzel font-semibold text-sm sm:text-base tracking-wider shadow-xl shadow-rose-900/40 hover:shadow-rose-900/60 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Link2 className="w-5 h-5" />
                <span>{isCreating ? 'Sealing Your Letter in Damon’s Affection...' : 'Generate Shareable Letter Link'}</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Live Preview Pane */}
        <div className={`lg:col-span-5 sticky top-24 ${mobileTab === 'editor' ? 'hidden lg:block' : 'block'}`}>
          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden relative">
            
            {/* Live Preview Bar */}
            <div className="px-4 py-2.5 bg-neutral-950/80 border-b border-neutral-800 flex items-center justify-between text-xs font-sans-clean text-neutral-300 z-20 relative">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="font-semibold text-rose-400 font-cinzel">Live Preview</span>
                <span className="opacity-60 text-[10px]">({pages.length} {pages.length === 1 ? 'Page' : 'Pages'})</span>
              </div>

              <button
                onClick={() => onPreviewFull(currentDraftLetter)}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] flex items-center gap-1 transition-colors"
              >
                <Eye className="w-3 h-3" />
                <span>Full Window</span>
              </button>
            </div>

            {/* Preview Window Box with active theme animation */}
            <div className="relative min-h-[550px] max-h-[720px] overflow-y-auto p-4 flex items-center justify-center">
              <ThemeBackground theme={theme} />
              <div className="relative z-10 w-full scale-95 origin-top">
                <LetterPresentation
                  letter={currentDraftLetter}
                  isRecipientView={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Romantic Spark Modal */}
      {showSparkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl text-neutral-900 dark:text-neutral-100">
            <div className="flex items-center gap-2 text-rose-500 mb-2">
              <Wand2 className="w-5 h-5" />
              <h3 className="text-xl font-cinzel font-bold">AI Romantic Spark</h3>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans-clean mb-4">
              Give a small memory or feeling, and our romantic muse will compose a heartfelt paragraph for {recipientName || 'your love'} on Page {activePageIndex + 1}.
            </p>

            <textarea
              value={sparkPrompt}
              onChange={(e) => setSparkPrompt(e.target.value)}
              placeholder="e.g. How we laughed at 2 AM, or the promise we made under the moonlight..."
              rows={3}
              className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-xs font-sans-clean mb-4 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSparkModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium font-sans-clean text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateAISpark}
                disabled={isSparking}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium font-sans-clean shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isSparking ? 'Composing romance...' : 'Spark Words'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
