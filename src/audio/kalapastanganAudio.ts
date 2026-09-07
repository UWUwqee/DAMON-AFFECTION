// Audio manager for "Kalapastangan" by fitterkarma
// Plays the authentic track with graceful user-gesture unlocking and smooth controls.

type AudioStateListener = (isPlaying: boolean) => void;

class KalapastanganAudioEngine {
  private isPlaying: boolean = false;
  private wantsToPlay: boolean = false;
  private player: any = null;
  private isYTReady: boolean = false;
  private listeners: Set<AudioStateListener> = new Set();
  private gestureAttached: boolean = false;
  private containerId = 'kalapastangan-audio-container';
  private videoId = 'lk5Tg6RB5ew'; // fitterkarma - Kalapastangan (Lyrics & Audio)
  private hasInteracted: boolean = false;

  constructor() {
    // Only in browser
    if (typeof window !== 'undefined') {
      this.attachGestureListeners();
    }
  }

  private attachGestureListeners() {
    if (this.gestureAttached) return;
    this.gestureAttached = true;

    const onUserGesture = () => {
      this.hasInteracted = true;
      if (this.wantsToPlay && !this.isPlaying) {
        this.play();
      }
    };

    window.addEventListener('click', onUserGesture, { passive: true });
    window.addEventListener('touchstart', onUserGesture, { passive: true });
    window.addEventListener('pointerdown', onUserGesture, { passive: true });
    window.addEventListener('keydown', onUserGesture, { passive: true });
  }

  public init() {
    if (typeof window === 'undefined') return;
    if (this.player || this.isYTReady) return;

    // Ensure container exists
    let container = document.getElementById(this.containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = this.containerId;
      // Position offscreen so it doesn't block clicks or UI, but remains renderable by browser
      container.style.position = 'fixed';
      container.style.bottom = '-9999px';
      container.style.right = '-9999px';
      container.style.width = '200px';
      container.style.height = '200px';
      container.style.opacity = '0.001';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '-100';
      document.body.appendChild(container);
    }

    // Load YouTube IFrame API if not already present
    const existingScript = document.getElementById('yt-iframe-api-script');
    if (!existingScript) {
      const tag = document.createElement('script');
      tag.id = 'yt-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const checkYT = () => {
      const win = window as any;
      if (win.YT && win.YT.Player) {
        this.createPlayer();
      } else {
        win.onYouTubeIframeAPIReady = () => {
          this.createPlayer();
        };
      }
    };

    if ((window as any).YT && (window as any).YT.Player) {
      this.createPlayer();
    } else {
      checkYT();
    }
  }

  private createPlayer() {
    if (this.player) return;
    const win = window as any;
    if (!win.YT || !win.YT.Player) return;

    try {
      this.player = new win.YT.Player(this.containerId, {
        height: '200',
        width: '200',
        videoId: this.videoId,
        playerVars: {
          autoplay: 0,
          loop: 1,
          playlist: this.videoId,
          controls: 0,
          showinfo: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            this.isYTReady = true;
            try {
              event.target.setVolume(85);
            } catch {
              // Ignore
            }
            if (this.wantsToPlay) {
              this.play();
            }
          },
          onStateChange: (event: any) => {
            // YT.PlayerState: -1 = unstarted, 0 = ended, 1 = playing, 2 = paused, 3 = buffering, 5 = video cued
            if (event.data === 1) {
              this.isPlaying = true;
              this.notify();
            } else if (event.data === 2 || event.data === 0) {
              this.isPlaying = false;
              this.notify();
            }
          },
          onError: () => {
            // If primary video fails or is restricted, try backup video ID
            if (this.videoId === 'lk5Tg6RB5ew') {
              this.videoId = 'FpJxPzveHzA';
              if (this.player && this.player.loadVideoById) {
                this.player.loadVideoById(this.videoId);
              }
            }
          }
        },
      });
    } catch (err) {
      console.warn('Kalapastangan player init error:', err);
    }
  }

  public play() {
    this.wantsToPlay = true;
    this.init();

    if (this.player && typeof this.player.playVideo === 'function') {
      try {
        this.player.unMute();
        this.player.setVolume(85);
        this.player.playVideo();
        this.isPlaying = true;
        this.notify();
      } catch (err) {
        console.warn('Playback deferred until interaction:', err);
      }
    } else {
      // If player not ready yet, mark as wantsToPlay
      this.isPlaying = true;
      this.notify();
    }
  }

  public pause() {
    this.wantsToPlay = false;
    this.isPlaying = false;
    if (this.player && typeof this.player.pauseVideo === 'function') {
      try {
        this.player.pauseVideo();
      } catch {
        // Ignore
      }
    }
    this.notify();
  }

  public toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public subscribe(callback: AudioStateListener): () => void {
    this.listeners.add(callback);
    callback(this.isPlaying);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.isPlaying));
  }
}

export const kalapastanganAudio = new KalapastanganAudioEngine();
