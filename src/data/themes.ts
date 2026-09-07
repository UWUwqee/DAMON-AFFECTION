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
  },
  'moonlit-garden': {
    id: 'moonlit-garden',
    name: 'Moonlit Garden',
    tagline: 'Quiet & Enchanted',
    mood: 'Gentle, secret, hopeful, magical',
    bestFor: 'Private confessions, quiet nights, tender promises',
    bgGradient: 'from-emerald-950 via-teal-950 to-slate-950',
    accentColor: '#facc15',
    primaryTextColor: 'text-emerald-50',
    letterBg: 'bg-emerald-950/75 backdrop-blur-lg',
    letterBorder: 'border-yellow-400/25 shadow-emerald-500/20',
    fontFamily: 'font-cormorant',
    musicName: 'Kalapastangan — fitterkarma',
    musicDescription: '',
    iconName: 'Moon',
    envelopeColor: 'bg-gradient-to-br from-emerald-900 to-teal-950'
  },
  'sunset-postcard': {
    id: 'sunset-postcard',
    name: 'Sunset Postcard',
    tagline: 'Golden & Nostalgic',
    mood: 'Warm, nostalgic, radiant, adventurous',
    bestFor: 'Travel memories, first dates, golden-hour love',
    bgGradient: 'from-rose-950 via-orange-800 to-amber-500',
    accentColor: '#fb923c',
    primaryTextColor: 'text-orange-50',
    letterBg: 'bg-orange-950/70 backdrop-blur-md',
    letterBorder: 'border-orange-300/30 shadow-orange-500/20',
    fontFamily: 'font-playfair',
    musicName: 'Kalapastangan — fitterkarma',
    musicDescription: '',
    iconName: 'Sun',
    envelopeColor: 'bg-gradient-to-br from-rose-800 to-orange-700'
  },
  'paper-cranes': {
    id: 'paper-cranes',
    name: 'Paper Cranes',
    tagline: 'Light & Hopeful',
    mood: 'Airy, sincere, optimistic, devoted',
    bestFor: 'New beginnings, long-distance love, hopeful wishes',
    bgGradient: 'from-sky-100 via-cyan-100 to-teal-200 dark:from-slate-900 dark:via-cyan-950 dark:to-teal-900',
    accentColor: '#0891b2',
    primaryTextColor: 'text-cyan-950 dark:text-cyan-50',
    letterBg: 'bg-white/75 dark:bg-cyan-950/65 backdrop-blur-md',
    letterBorder: 'border-cyan-300/60 dark:border-cyan-400/25 shadow-cyan-500/20',
    fontFamily: 'font-cormorant',
    musicName: 'Kalapastangan — fitterkarma',
    musicDescription: '',
    iconName: 'Wind',
    envelopeColor: 'bg-gradient-to-br from-cyan-600 to-teal-700'
  },
  'rosewater-rain': {
    id: 'rosewater-rain',
    name: 'Rosewater Rain',
    tagline: 'Velvet & Dreamy',
    mood: 'Intimate, cinematic, tender, reflective',
    bestFor: 'Deep apologies, late-night thoughts, emotional vows',
    bgGradient: 'from-slate-950 via-rose-950 to-fuchsia-950',
    accentColor: '#fb7185',
    primaryTextColor: 'text-rose-50',
    letterBg: 'bg-slate-950/75 backdrop-blur-lg',
    letterBorder: 'border-rose-400/30 shadow-rose-500/20',
    fontFamily: 'font-cormorant',
    musicName: 'Kalapastangan — fitterkarma',
    musicDescription: '',
    iconName: 'CloudRain',
    envelopeColor: 'bg-gradient-to-br from-rose-900 to-fuchsia-950'
  },
  'honeyed-morning': {
    id: 'honeyed-morning',
    name: 'Honeyed Morning',
    tagline: 'Bright & Grateful',
    mood: 'Joyful, grateful, sunny, comforting',
    bestFor: 'Everyday appreciation, gratitude, gentle good mornings',
    bgGradient: 'from-yellow-50 via-amber-100 to-orange-200 dark:from-amber-950 dark:via-yellow-950 dark:to-stone-900',
    accentColor: '#f59e0b',
    primaryTextColor: 'text-amber-950 dark:text-amber-50',
    letterBg: 'bg-amber-50/85 dark:bg-amber-950/60 backdrop-blur-md',
    letterBorder: 'border-amber-300/70 dark:border-amber-500/30 shadow-amber-500/20',
    fontFamily: 'font-playfair',
    musicName: 'Kalapastangan — fitterkarma',
    musicDescription: '',
    iconName: 'Sunrise',
    envelopeColor: 'bg-gradient-to-br from-amber-500 to-orange-600'
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
  },
  'moonlit-garden': {
    title: 'Meet me where the fireflies glow',
    recipientName: 'My Secret Garden',
    senderName: 'Always finding my way to you',
    content: `There is a quiet place in my heart that only opens when I think of you.

You are the small golden light I notice even on the darkest nights, the gentle proof that hope can be soft and still be strong.

If I could choose one place to spend every evening, it would be beside you beneath a patient moon.`
  },
  'sunset-postcard': {
    title: 'Wish you were here',
    recipientName: 'My Favorite Adventure',
    senderName: 'Yours, wherever the road leads',
    content: `Every beautiful view becomes a little brighter because I am already imagining how you would smile at it.

I keep collecting sunsets, small stories, and reasons to come home to you. You make every ordinary journey feel like a memory worth keeping.

Here is my favorite postcard: I love you, and I cannot wait for our next horizon.`
  },
  'paper-cranes': {
    title: 'A wish carried to you',
    recipientName: 'My Brightest Hope',
    senderName: 'With a thousand wishes for us',
    content: `If every paper crane carried one wish, I would fold them all for the same thing: more mornings with you.

You make the future feel less like a distance and more like a place we are already walking toward together.

Wherever life sends us, my heart will keep finding its way back to yours.`
  },
  'rosewater-rain': {
    title: 'After the rain',
    recipientName: 'The One I Choose',
    senderName: 'Tenderly and truthfully yours',
    content: `Some feelings arrive quietly, like rain against the window when the whole world has gone still.

Loving you has taught me that tenderness is not fragile. It is the courage to stay, to listen, and to meet each other honestly.

Even after the hardest weather, I would still choose the garden we grow together.`
  },
  'honeyed-morning': {
    title: 'The sweetest part of my day',
    recipientName: 'My Everyday Joy',
    senderName: 'Grateful for you, always',
    content: `You are the warm light that finds me before I am fully awake, the sweetness hidden inside an ordinary day.

Thank you for every laugh, every patient moment, and every little way you make life feel more like home.

I hope you know that being loved by you is one of my greatest reasons to be grateful.`
  }
};
