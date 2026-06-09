/* --------------------------------------------------
   WINDOWS 93 Web Audio retro Synthesizer
   Synthetic sound card simulation
-------------------------------------------------- */

const SoundCard = {
    enabled: true,
    ctx: null,

    // Initialize Web Audio Context on first interaction
    init() {
        if (!this.ctx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.ctx = new AudioContextClass();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    toggle() {
        this.enabled = !this.enabled;
        this.init();
        return this.enabled;
    },

    // Play retro beep/arpeggio
    playStartup() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        
        notes.forEach((freq, index) => {
            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();
            
            // Triangle/Square wave for retro console feel
            osc.type = index === 3 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(freq, now + index * 0.15);
            
            gainNode.gain.setValueAtTime(0, now + index * 0.15);
            gainNode.gain.linearRampToValueAtTime(0.15, now + index * 0.15 + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + index * 0.15 + 0.6);
            
            osc.connect(gainNode);
            gainNode.connect(this.ctx.destination);
            
            osc.start(now + index * 0.15);
            osc.stop(now + index * 0.15 + 0.7);
        });

        // Add a nice warm chord at the end
        setTimeout(() => {
            this.playChord([261.63, 329.63, 392.00, 523.25], 0.8, 'triangle');
        }, 500);
    },

    playClick() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.04);

        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
    },

    playError() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const duration = 0.25;

        // Dual detuned oscillators for that grating buzz
        [120, 123].forEach(freq => {
            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now);

            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

            osc.connect(gainNode);
            gainNode.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + duration);
        });
    },

    playShutdown() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [523.25, 392.00, 329.63, 261.63]; // C5, G4, E4, C4
        
        notes.forEach((freq, index) => {
            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + index * 0.15);
            
            gainNode.gain.setValueAtTime(0, now + index * 0.15);
            gainNode.gain.linearRampToValueAtTime(0.12, now + index * 0.15 + 0.03);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + index * 0.15 + 0.5);
            
            osc.connect(gainNode);
            gainNode.connect(this.ctx.destination);
            
            osc.start(now + index * 0.15);
            osc.stop(now + index * 0.15 + 0.6);
        });
    },

    playChord(freqs, duration = 0.5, type = 'sine') {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        
        freqs.forEach(freq => {
            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(freq, now);
            
            gainNode.gain.setValueAtTime(0.05, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
            
            osc.connect(gainNode);
            gainNode.connect(this.ctx.destination);
            
            osc.start(now);
            osc.stop(now + duration);
        });
    }
};
