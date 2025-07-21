
class SoundManager {
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;

  constructor() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  private createTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) {
    if (!this.audioContext || !this.isEnabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playBirthSound() {
    this.createTone(440, 0.1, 'sine', 0.05);
  }

  playDeathSound() {
    this.createTone(220, 0.15, 'triangle', 0.03);
  }

  playSuperpowerSound(type: number) {
    const frequencies = [523, 587, 659, 698, 784, 880, 988];
    const frequency = frequencies[type - 1] || 440;
    this.createTone(frequency, 0.2, 'square', 0.04);
  }

  playBattleClash() {
    // Create a more complex sound for battles
    this.createTone(100, 0.1, 'sawtooth', 0.02);
    setTimeout(() => this.createTone(150, 0.05, 'triangle', 0.02), 50);
  }

  playVictoryFanfare(player: number) {
    const baseFreq = player === 0 ? 523 : 659; // C5 for player 1, E5 for player 2
    [0, 0.1, 0.2, 0.3].forEach((delay, i) => {
      setTimeout(() => {
        this.createTone(baseFreq * (1 + i * 0.2), 0.3, 'triangle', 0.06);
      }, delay * 1000);
    });
  }
}

export const soundManager = new SoundManager();
