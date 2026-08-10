// High-Quality Web Audio API sound synthesizer for Adhan Call, Dhikr Tap, and Qibla Alignment
// Features 5 distinct sound presets: Grand Medina Chime, Makkah Takbeer Call, Soft Dawn Breeze, Mosque Sanctuary Resonance, and Real Short Vocal Adhan.

let audioCtx: AudioContext | null = null;
let activeActiveOscillators: { stop: (time?: number) => void }[] = [];
let activeAudioElement: HTMLAudioElement | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function stopAdhanTone() {
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
    } catch {
      // ignore
    }
    activeAudioElement = null;
  }

  activeActiveOscillators.forEach(osc => {
    try {
      osc.stop();
    } catch {
      // ignore
    }
  });
  activeActiveOscillators = [];
}

export type SoundPreset = 'notify_1' | 'notify_2' | 'short_adhan' | 'full_adhan_1' | 'full_adhan_2' | 'full_adhan_3';

export async function playAdhanTone(preset: SoundPreset = 'notify_1') {
  try {
    stopAdhanTone();

    const presetFileMap: Record<SoundPreset, string[]> = {
      notify_1: ['/audio/notify-1.mp3', '/notify-1.mp3', '/audio/iphone-notification.mp3', '/iphone-notification.mp3'],
      notify_2: ['/audio/notify-2.mp3', '/notify-2.mp3', '/audio/iphone-pay.mp3', '/iphone-pay.mp3'],
      short_adhan: ['/audio/short-adhan.mp3', '/short-adhan.mp3', '/audio/short-adhan.m4a', '/short-adhan.m4a'],
      full_adhan_1: ['/audio/full-adhan-1.mp3', '/full-adhan-1.mp3', '/audio/full-adhan-1.m4a', '/full-adhan-1.m4a'],
      full_adhan_2: ['/audio/full-adhan-2.mp3', '/full-adhan-2.mp3', '/audio/full-adhan-2.m4a', '/full-adhan-2.m4a'],
      full_adhan_3: ['/audio/full-adhan-3.mp3', '/full-adhan-3.mp3', '/audio/full-adhan-3.m4a', '/full-adhan-3.m4a']
    };

    const audioSources = presetFileMap[preset] || [];
    let played = false;

    for (const src of audioSources) {
      try {
        const audio = new Audio(src);
        activeAudioElement = audio;
        audio.volume = 0.95;
        await audio.play();
        played = true;
        console.log('Successfully playing Adhan audio from:', src);
        break;
      } catch {
        // try next audio source
      }
    }

    if (!played) {
      playSynthesizedSequence(preset);
    }
  } catch (e) {
    console.warn('Adhan sound play error:', e);
  }
}

function playSynthesizedSequence(preset: SoundPreset) {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Master bus with acoustic warm filter and reverb simulation
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.45, now);

  // Mosque Dome Formant Filter Network (Simulating acoustic warmth of a Grand Mosque)
  const lowpassFilter = ctx.createBiquadFilter();
  lowpassFilter.type = 'lowpass';
  lowpassFilter.frequency.setValueAtTime(2600, now);
  lowpassFilter.Q.setValueAtTime(1.1, now);

  // Dual Delay lines for expansive spatial stereo echo
  const delay1 = ctx.createDelay();
  delay1.delayTime.setValueAtTime(0.28, now);
  const delayGain1 = ctx.createGain();
  delayGain1.gain.setValueAtTime(0.25, now);

  const delay2 = ctx.createDelay();
  delay2.delayTime.setValueAtTime(0.48, now);
  const delayGain2 = ctx.createGain();
  delayGain2.gain.setValueAtTime(0.15, now);

  masterGain.connect(lowpassFilter);
  lowpassFilter.connect(ctx.destination);
  lowpassFilter.connect(delay1);
  delay1.connect(delayGain1);
  delayGain1.connect(lowpassFilter);

  lowpassFilter.connect(delay2);
  delay2.connect(delayGain2);
  delayGain2.connect(lowpassFilter);

  // Tone sequences per preset
  let sequence: { freq: number; duration: number; delay: number; glideTo?: number; vibrato?: boolean }[] = [];

  if (preset === 'notify_1') {
    // 1. Notification Sound v1 - iPhone Notification Sound
    sequence = [
      { freq: 523.25, duration: 1.2, delay: 0.0, vibrato: false },   // C5
      { freq: 659.25, duration: 1.4, delay: 0.22, vibrato: false },  // E5
      { freq: 783.99, duration: 1.6, delay: 0.48, vibrato: false },  // G5
      { freq: 1046.50, duration: 3.0, delay: 0.80, vibrato: true },  // C6 (High Octave Ring)
    ];
  } else if (preset === 'notify_2') {
    // 2. Notification Sound v2 - iPhone Pay Sound
    sequence = [
      { freq: 349.23, duration: 1.2, delay: 0.0, vibrato: false },   // F4
      { freq: 440.00, duration: 1.4, delay: 0.25, vibrato: true },   // A4
      { freq: 523.25, duration: 1.8, delay: 0.55, vibrato: true },   // C5
      { freq: 698.46, duration: 2.8, delay: 1.00, vibrato: true },   // F5
    ];
  } else if (preset === 'full_adhan_1') {
    // 4. Full Adhan v1 - By Omar Hisham Al Arabi
    sequence = [
      { freq: 293.66, duration: 2.4, delay: 0.0, glideTo: 329.63, vibrato: true },
      { freq: 392.00, duration: 2.6, delay: 2.2, glideTo: 440.00, vibrato: true },
      { freq: 440.00, duration: 2.8, delay: 4.6, glideTo: 392.00, vibrato: true },
      { freq: 349.23, duration: 2.5, delay: 7.2, glideTo: 329.63, vibrato: true },
      { freq: 293.66, duration: 3.5, delay: 9.5, glideTo: 261.63, vibrato: true },
    ];
  } else if (preset === 'full_adhan_2') {
    // 5. Full Adhan v2 - By Mevlan Kurtishi
    sequence = [
      { freq: 261.63, duration: 2.5, delay: 0.0, glideTo: 329.63, vibrato: true },
      { freq: 349.23, duration: 2.6, delay: 2.3, glideTo: 392.00, vibrato: true },
      { freq: 523.25, duration: 3.0, delay: 4.7, glideTo: 440.00, vibrato: true },
      { freq: 392.00, duration: 2.8, delay: 7.5, glideTo: 349.23, vibrato: true },
      { freq: 293.66, duration: 3.8, delay: 10.1, glideTo: 261.63, vibrato: true },
    ];
  } else if (preset === 'full_adhan_3') {
    // 6. Full Adhan v3 - By Medi Yarrahi
    sequence = [
      { freq: 293.66, duration: 2.8, delay: 0.0, glideTo: 349.23, vibrato: true },
      { freq: 392.00, duration: 3.0, delay: 2.6, glideTo: 440.00, vibrato: true },
      { freq: 523.25, duration: 3.2, delay: 5.4, glideTo: 440.00, vibrato: true },
      { freq: 349.23, duration: 3.0, delay: 8.4, glideTo: 293.66, vibrato: true },
    ];
  } else {
    // 3. Short Adhan - By Medi Yarrahi
    sequence = [
      { freq: 293.66, duration: 2.2, delay: 0.0, glideTo: 329.63, vibrato: true },  // D4 -> E4 (Allahu Akbar)
      { freq: 392.00, duration: 2.5, delay: 2.0, glideTo: 440.00, vibrato: true },  // G4 -> A4 (Allahu Akbar)
      { freq: 349.23, duration: 2.2, delay: 4.5, glideTo: 329.63, vibrato: true },  // F4 -> E4
      { freq: 293.66, duration: 3.2, delay: 6.8, glideTo: 261.63, vibrato: true },  // D4 -> C4
    ];
  }

  sequence.forEach(note => {
    const startTime = now + note.delay;
    const stopTime = startTime + note.duration;

    // 1. Fundamental Vocal Oscillator (Rich Sine)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(note.freq, startTime);
    if (note.glideTo) {
      osc1.frequency.exponentialRampToValueAtTime(note.glideTo, startTime + note.duration * 0.65);
    }

    // Add vocal vibrato LFO if specified
    if (note.vibrato) {
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(5.2, startTime); // 5.2 Hz human vocal vibrato
      lfoGain.gain.setValueAtTime(note.freq * 0.015, startTime); // subtle modulation
      lfo.connect(osc1.frequency);
      lfo.start(startTime + 0.15);
      lfo.stop(stopTime);
      activeActiveOscillators.push(lfo);
    }

    // 2. Warm Fundamental Body Oscillator (Triangle - octave lower)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(note.freq * 0.5, startTime);

    // 3. Resonance Overtone Oscillator (Harmonic 3rd)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(note.freq * 1.5, startTime);

    // Envelopes with smooth Attack / Decay
    gain1.gain.setValueAtTime(0.0001, startTime);
    gain1.gain.exponentialRampToValueAtTime(0.35, startTime + 0.09);
    gain1.gain.exponentialRampToValueAtTime(0.0001, stopTime);

    gain2.gain.setValueAtTime(0.0001, startTime);
    gain2.gain.exponentialRampToValueAtTime(0.14, startTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.0001, stopTime - 0.05);

    gain3.gain.setValueAtTime(0.0001, startTime);
    gain3.gain.exponentialRampToValueAtTime(0.06, startTime + 0.08);
    gain3.gain.exponentialRampToValueAtTime(0.0001, stopTime - 0.15);

    osc1.connect(gain1);
    osc2.connect(gain2);
    osc3.connect(gain3);

    gain1.connect(masterGain);
    gain2.connect(masterGain);
    gain3.connect(masterGain);

    osc1.start(startTime);
    osc1.stop(stopTime);
    osc2.start(startTime);
    osc2.stop(stopTime);
    osc3.start(startTime);
    osc3.stop(stopTime);

    activeActiveOscillators.push(osc1, osc2, osc3);
  });
}

export function playTasbihClickSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch (e) {
    console.warn('Audio play failed', e);
  }
}

export function playQiblaAlignedBeep() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now); // A5 note

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  } catch (e) {
    console.warn('Audio play failed', e);
  }
}


