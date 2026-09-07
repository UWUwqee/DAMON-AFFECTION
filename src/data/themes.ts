import { ThemeConfig, ThemeId } from '../types';

export const THEMES: Record<ThemeId, ThemeConfig> = {
  'blooming-heart': {
    id: 'blooming-heart',
    name: 'Blooming Heart',
    tagline: 'Soft & Romantic',
    mood: 'Sweet, tender, innocent, warm',
    bestFor: 'Confessions, sweet nothings, new love',
    bgGradient: 'from-pink-100 via-rose-100 to-amber-50 dark:from-rose-950 dark:via-pink-900/60 dark:to-neutral-950',
    accentColor: '#f43f5e',
    primaryTextColor: 'text-rose-950 dark:text-rose-100',
    letterBg: 'bg-white/85 dark:bg-rose-950/40 backdrop-blur-md',
    letterBorder: 'border-rose-200/60 dark:border-rose-800/40 shadow-rose-200/50 dark:shadow-rose-950/50',
    fontFamily: 'font-script',
    musicName: 'Kalapastangan — fitterkarma',
    musicDescription: '',
    iconName: 'Flower2',
    envelopeColor: 'bg-gradient-to-br from-rose-200 to-pink-300 dark:from-rose-900 dark:to-pink-950'
  },
  'starlit-promise': {
    id: 'starlit-promise',
    name: 'Starlit Promise',
    tagline: 'Dreamy & Eternal',
    mood: 'Timeless, boundless, dreamlike, forever',
    bestFor: 'Long-distance, anniversaries, promises, "forever" love',
    bgGradient: 'from-slate-950 via-indigo-950 to-blue-950',
    accentColor: '#818cf8',
    primaryTextColor: 'text-indigo-100',
    letterBg: 'bg-slate-900/75 backdrop-blur-lg',
    letterBorder: 'border-indigo-500/30 shadow-indigo-500/20',
    fontFamily: 'font-cormorant',
    musicName: 'Kalapastangan — fitterkarma',
    musicDescription: '',
    iconName: 'Sparkles',
    envelopeColor: 'bg-gradient-to-br from-indigo-900 to-slate-950'
  },
  'warmth-of-us': {
    id: 'warmth-of-us',
    name: 'Warmth of Us',
    tagline: 'Passionate & Intimate',
    mood: 'Passionate, cozy, intense, heartfelt',
    bestFor: 'Deep love, anniversaries, emotional confessions',
    bgGradient: 'from-amber-950 via-rose-950 to-stone-950',
    accentColor: '#fb923c',
    primaryTextColor: 'text-amber-100',
    letterBg: 'bg-stone-900/80 backdrop-blur-md',
    letterBorder: 'border-amber-600/30 shadow-amber-500/20',
    fontFamily: 'font-playfair',
    musicName: 'Kalapastangan — fitterkarma',
    musicDescription: '',
    iconName: 'Flame',
    envelopeColor: 'bg-gradient-to-br from-amber-800 to-stone-900'
  },
  'seasons-of-love': {
    id: 'seasons-of-love',
    name: 'Seasons of Love',
    tagline: 'Timeless & Growing',
    mood: 'Growing, enduring, natural, grounded',
    bestFor: 'Long-term relationships, growing together, gratitude',
    bgGradient: 'from-amber-50 via-orange-50/50 to-stone-100 dark:from-stone-950 dark:via-amber-950/40 dark:to-neutral-900',
    accentColor: '#d97706',
    primaryTextColor: 'text-stone-900 dark:text-stone-100',
    letterBg: 'bg-stone-50/90 dark:bg-stone-900/60 backdrop-blur-md',
    letterBorder: 'border-amber-200 dark:border-stone-700/60 shadow-amber-900/10',
    fontFamily: 'font-cormorant',
    musicName: 'Kalapastangan — fitterkarma',
    musicDescription: '',
    iconName: 'Leaf',
    envelopeColor: 'bg-gradient-to-br from-amber-200 to-stone-300 dark:from-stone-800 dark:to-amber-950'
  },
  'ocean-of-my-heart': {
    id: 'ocean-of-my-heart',
    name: 'Ocean of My Heart',
    tagline: 'Deep & Boundless',
    mood: 'Deep, calm, endless, peaceful',
    bestFor: 'Deep feelings, calm love, long-distance, heartfelt truth',
    bgGradient: 'from-sky-950 via-teal-950 to-cyan-950',
    accentColor: '#2dd4bf',
    primaryTextColor: 'text-teal-100',
    letterBg: 'bg-teal-950/70 backdrop-blur-md',
    letterBorder: 'border-teal-400/30 shadow-teal-500/20',
    fontFamily: 'font-playfair',
    musicName: 'Kalapastangan — fitterkarma',
    musicDescription: '',
    iconName: 'Waves',
    envelopeColor: 'bg-gradient-to-br from-teal-900 to-cyan-950'
  }
};

export const SAMPLE_LETTERS: Record<ThemeId, { title: string; content: string; recipientName: string; senderName: string }> = {
  'blooming-heart': {
    title: 'Every petal reminds me of you',
    recipientName: 'My Sweet Angel',
    senderName: 'Forever Adoring You',
    content: `From the very first moment you smiled at me, a garden began to bloom inside my chest.

You turn ordinary mornings into poetry. Your laughter is the sweetest melody I've ever known, and in your eyes, I found the home I never knew I was searching for.

Thank you for being my gentlest comfort, my sweetest thought, and the reason my heart races every single day. I love you more than words could ever hold.`
  },
  'starlit-promise': {
    title: 'Written in our constellations',
    recipientName: 'My North Star',
    senderName: 'Your Celestial Companion',
    content: `No matter how many miles lie between us, we gaze up at the exact same night sky.

Every twinkling star tonight is a promise that my love for you does not dim with distance, nor does it waver with time. You are the light that guides me through the darkest nights.

Across galaxies and lifetimes, my soul would still find yours. I promise to cherish you, stand by you, and love you beneath every sky we ever share.`
  },
  'warmth-of-us': {
    title: 'The flame that keeps me alive',
    recipientName: 'My Heartbeat',
    senderName: 'Yours Unconditionally',
    content: `When the world feels cold and chaotic, being in your arms is my only sanctuary.

You ignite a fire in my soul that burns with calm, fierce devotion. It is not just the way you look at me, but how you understand the quietest parts of who I am.

With you, every beat of my heart has meaning. I choose you today, tomorrow, and through all the fires of life. You are my greatest adventure.`
  },
  'seasons-of-love': {
    title: 'Growing roots with you',
    recipientName: 'My Dearest Partner',
    senderName: 'Always by your side',
    content: `Through every spring of excitement and every winter of hardship, our love has only grown deeper roots.

Like golden leaves falling gracefully to nourish the earth, every shared laughter and quiet conversation has built the foundation of our life together.

Thank you for growing with me, for listening with patience, and for loving me through every changing season. You are my true, enduring anchor.`
  },
  'ocean-of-my-heart': {
    title: 'Deep, boundless, and yours',
    recipientName: 'My Ocean of Peace',
    senderName: 'Submerged in your love',
    content: `If my love for you were measured in drops of water, all the oceans on earth would overflow.

You bring a peace to my spirit that runs deeper than any trench, and a clarity as pure as sunlit turquoise shallows. 

In a world full of noise, you are my serene tide. Let the currents take us wherever they may, as long as our hands are held tight. My heart belongs to your ocean.`
  }
};
