import React, { useState } from 'react';
import { LetterData } from '../types';
import { Copy, Check, ExternalLink, QrCode, Share2, X, Heart, MessageCircle, Mail, Lock, BookOpen } from 'lucide-react';
import { GothicLogo } from './GothicLogo';

interface Props {
  letter: LetterData;
  isOpen: boolean;
  onClose: () => void;
  onViewRecipientMode: (letterId: string) => void;
  onGoToDashboard: () => void;
}

export const ShareModal: React.FC<Props> = ({
  letter,
  isOpen,
  onClose,
  onViewRecipientMode,
  onGoToDashboard
}) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  if (!isOpen) return null;

  // Build the share link using window.location.origin
  const shareUrl = `${window.location.origin}/?letter=${letter.id}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareText = letter.hasPassword && letter.password
    ? `I sealed a secret love letter for you on Damon’s Affection 🔒❤️ Passcode: "${letter.password}". Open it here: ${shareUrl}`
    : `I wrote you a personalized love letter on Damon’s Affection ❤️ Open it here: ${shareUrl}`;

  // WhatsApp share
  const shareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  // Telegram share
  const shareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
  };

  // Email share
  const shareEmail = () => {
    window.open(`mailto:?subject=${encodeURIComponent(`A Secret Love Letter from ${letter.senderName || 'Someone Special'}`)}&body=${encodeURIComponent(shareText)}`, '_blank');
  };

  const pageCount = letter.pages?.length || 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-rose-950/70 shadow-2xl overflow-hidden p-6 sm:p-8 text-neutral-900 dark:text-neutral-100 animate-scale-up">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header with Gothic Branding */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <GothicLogo size="sm" showSubtitle={false} />
          </div>
          <h3 className="text-2xl font-cinzel font-bold text-neutral-900 dark:text-white">
            Your Love Letter is Sealed!
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-sans-clean mt-1">
            Send this unique link to <span className="font-semibold text-rose-500 dark:text-rose-400">{letter.recipientName || 'your special someone'}</span>. 
            {pageCount > 1 && ` Includes ${pageCount} beautiful pages.`}
          </p>
        </div>

        {/* Password Reminder Callout if protected */}
        {letter.hasPassword && letter.password && (
          <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs font-sans-clean">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <Lock className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <span className="font-semibold font-cinzel block">Secret Passcode Set:</span>
                <span className="font-mono text-xs bg-black/10 dark:bg-black/40 px-2 py-0.5 rounded font-bold">
                  {letter.password}
                </span>
              </div>
            </div>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 text-right">
              Share passcode with {letter.recipientName || 'them'}
            </span>
          </div>
        )}

        {/* Unique Link Box */}
        <div className="mb-5">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-cinzel block mb-1.5">
            Shareable Unique Link
          </label>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent text-xs font-mono text-neutral-700 dark:text-neutral-300 px-2 focus:outline-none truncate"
            />
            <button
              onClick={copyToClipboard}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium font-cinzel flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Social Share Shortcuts */}
        <div className="mb-6">
          <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-cinzel block mb-2 text-center">
            One-Click Share Via
          </span>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={shareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium font-sans-clean transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={shareTelegram}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-medium font-sans-clean transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Telegram</span>
            </button>

            <button
              onClick={shareEmail}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-medium font-sans-clean transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </button>

            <button
              onClick={() => setShowQR(!showQR)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-medium font-sans-clean transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>{showQR ? 'Hide QR' : 'QR Code'}</span>
            </button>
          </div>
        </div>

        {/* QR Code view */}
        {showQR && (
          <div className="mb-6 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 text-center animate-fade-in">
            <div className="w-40 h-40 mx-auto bg-white p-2 rounded-xl shadow-md flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(shareUrl)}`}
                alt="Love Letter QR Code"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2 font-sans-clean">
              Scan with camera to open this letter in Damon’s Affection
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => {
              onClose();
              onViewRecipientMode(letter.id);
            }}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-semibold font-cinzel flex items-center justify-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Recipient View</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onGoToDashboard();
            }}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-neutral-900 dark:bg-rose-950/80 hover:dark:bg-rose-900/80 border border-neutral-800 dark:border-rose-800/60 text-white text-xs font-semibold font-cinzel flex items-center justify-center gap-1.5 transition-all shadow-md"
          >
            <span>Track in Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
