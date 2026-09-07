import { ThemeId } from '../types';
import { kalapastanganAudio } from './kalapastanganAudio';

class RomanticAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentTheme: ThemeId | null = null;
  private masterGain: GainNode | null = null;
  private intervalId: number | null = null;
  private noiseNode: AudioNode | null = null;
  private activeOscillators: OscillatorNode[] = [];

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
      
      const resumeOnGesture = () => {
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        window.removeEventListener('click', resumeOnGesture);
        window.removeEventListener('touchstart', resumeOnGesture);
        window.removeEventListener('pointerdown', resumeOnGesture);
        window.removeEventListener('keydown', resumeOnGesture);
      };
      window.addEventListener('click', resumeOnGesture, { once: true, passive: true });
      window.addEventListener('touchstart', resumeOnGesture, { once: true, passive: true });
      window.addEventListener('pointerdown', resumeOnGesture, { once: true, passive: true });
      window.addEventListener('keydown', resumeOnGesture, { once: true, passive: true });
    }
  }

  public playTheme(theme?: ThemeId) {
    // Always trigger Kalapastangan by fitterkarma for authentic audio
    kalapastanganAudio.play();

    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.isPlaying && this.currentTheme === (theme || 'blooming-heart')) {
      return;
    }

    this.stopSynthesizer();
    this.currentTheme = theme || 'blooming-heart';
    this.isPlaying = true;

    // Smooth master gain ramp up
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0.16, this.ctx.currentTime + 1.2);

    // Play subtle acoustic backing arpeggios of Kalapastangan
    this.playKalapastanganChords();
  }

  private playKalapastanganChords() {
    if (!this.ctx || !this.masterGain) return;

    // Progression: G major - D/F# - Cadd9 - Em7
    const chords = [
      [196.00, 246.94, 293.66, 392.00], // G major
      [185.00, 220.00, 293.66, 369.99], // D/F#
      [261.63, 329.63, 392.00, 587.33], // Cadd9
      [164.81, 246.94, 293.66, 392.00], // Em7
    ];

    let chordIdx = 0;
    const playChordStep = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const currentChord = chords[chordIdx % chords.length];
      
      currentChord.forEach((freq, noteIdx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        // Warm acoustic guitar warmth filter
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1600, this.ctx.currentTime);

        osc.type = noteIdx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        // Gentle acoustic fingerstyle pluck envelope
        const noteTime = this.ctx.currentTime + noteIdx * 0.16;
        gain.gain.setValueAtTime(0.0001, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.05, noteTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 2.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(noteTime);
        osc.stop(noteTime + 2.3);
        this.activeOscillators.push(osc);
      });
      chordIdx++;
    };

    playChordStep();
    this.intervalId = window.setInterval(playChordStep, 2600);
  }

  private stopSynthesizer() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // ignore
      }
    });
    this.activeOscillators = [];
  }

  public stop() {
    kalapastanganAudio.pause();
    this.stopSynthesizer();
    this.isPlaying = false;
    this.currentTheme = null;
  }

  public toggle(theme?: ThemeId): boolean {
    if (this.isPlaying || kalapastanganAudio.getIsPlaying()) {
      this.stop();
      return false;
    } else {
      this.playTheme(theme);
      return true;
    }
  }

  public isThemePlaying(): boolean {
    return this.isPlaying || kalapastanganAudio.getIsPlaying();
  }

  // Play a beautiful celebration chime when letter is approved
  public playApprovalChime() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5, E5, G5, C6, E6
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.12);

      gain.gain.setValueAtTime(0, this.ctx.currentTime + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + idx * 0.12 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.12 + 1.8);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(this.ctx.currentTime + idx * 0.12);
      osc.stop(this.ctx.currentTime + idx * 0.12 + 1.9);
    });
  }

  // Theme 1: Blooming Heart - Gentle Harp & Piano notes
  private playBloomingHeart() {
    if (!this.ctx || !this.masterGain) return;

    const scale = [261.63, 329.63, 392.0, 440.0, 523.25, 659.25]; // C, E, G, A, C5, E5
    let noteIdx = 0;

    const playNote = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const freq = scale[noteIdx % scale.length];
      noteIdx = (noteIdx + Math.floor(Math.random() * 2) + 1) % scale.length;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, this.ctx.currentTime);

      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 2.6);
    };

    playNote();
    this.intervalId = window.setInterval(playNote, 1400);
  }

  // Theme 2: Starlit Promise - Cosmic Chimes & Space Pad
  private playStarlitPromise() {
    if (!this.ctx || !this.masterGain) return;

    // Background Drone Pad
    const padFreqs = [146.83, 220.0, 293.66, 440.0]; // D, A, D4, A4
    padFreqs.forEach((freq) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.025, this.ctx.currentTime);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      this.activeOscillators.push(osc);
    });

    // Twinkling High Chimes
    const chimeScale = [880.0, 1046.5, 1174.66, 1318.5, 1567.98, 1760.0];
    const triggerChime = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const freq = chimeScale[Math.floor(Math.random() * chimeScale.length)];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3.0);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 3.1);
    };

    triggerChime();
    this.intervalId = window.setInterval(triggerChime, 1800);
  }

  // Theme 3: Warmth of Us - Intimate slow heartbeat and warm low tone
  private playWarmthOfUs() {
    if (!this.ctx || !this.masterGain) return;

    // Heartbeat simulator
    const triggerHeartbeat = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;

      const beat = (delay: number, amp: number) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(65, this.ctx.currentTime + delay);
        osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + delay + 0.18);

        gain.gain.setValueAtTime(amp, this.ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + delay + 0.35);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(this.ctx.currentTime + delay);
        osc.stop(this.ctx.currentTime + delay + 0.4);
      };

      // Lub - Dub
      beat(0, 0.18);
      beat(0.24, 0.12);
    };

    // Soft warm cello drone
    const chord = [130.81, 164.81, 196.0]; // C3, E3, G3
    chord.forEach((freq) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, this.ctx.currentTime);

      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      this.activeOscillators.push(osc);
    });

    triggerHeartbeat();
    this.intervalId = window.setInterval(triggerHeartbeat, 2200);
  }

  // Theme 4: Seasons of Love - Pastoral warm acoustic plucks
  private playSeasonsOfLove() {
    if (!this.ctx || !this.masterGain) return;

    const melody = [220.0, 261.63, 329.63, 392.0, 329.63, 261.63];
    let step = 0;

    const pluck = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const freq = melody[step % melody.length];
      step++;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);

      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 1.9);
    };

    pluck();
    this.intervalId = window.setInterval(pluck, 1300);
  }

  // Theme 5: Ocean of My Heart - Ocean waves & peaceful liquid resonance
  private playOceanOfMyHeart() {
    if (!this.ctx || !this.masterGain) return;

    // Create filtered noise for ocean wave surf
    const bufferSize = this.ctx.sampleRate * 3;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    // LFO for wave modulation
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // slow wave
    lfoGain.gain.setValueAtTime(250, this.ctx.currentTime);

    lfo.connect(filter.frequency);

    const waveGain = this.ctx.createGain();
    waveGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(this.masterGain);

    whiteNoise.start();
    lfo.start();

    this.activeOscillators.push(lfo);
    this.noiseNode = whiteNoise;

    // Calming underwater sine notes
    const chords = [174.61, 220.0, 261.63, 349.23]; // F, A, C, F
    const playLiquidTone = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const freq = chords[Math.floor(Math.random() * chords.length)];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 4.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 4.6);
    };

    playLiquidTone();
    this.intervalId = window.setInterval(playLiquidTone, 3200);
  }
}

export const romanticAudio = new RomanticAudioEngine();
