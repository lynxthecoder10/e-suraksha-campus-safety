// Voice detection service for emergency phrases
export type VoicePhrase = 'help' | 'emergency';

export interface VoiceDetectionConfig {
  phrases: VoicePhrase[];
  sensitivity: number; // 0-1
  onDetected: (phrase: VoicePhrase) => void;
  onError?: (error: Error) => void;
}

export class VoiceDetectionService {
  private recognition: any = null;
  private isListening = false;
  private config: VoiceDetectionConfig | null = null;
  private restartTimeout: NodeJS.Timeout | null = null;

  constructor() {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    }
  }

  private setupRecognition(): void {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event: any) => {
      if (!this.config) return;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase().trim();
        
        // Check for emergency phrases
        if (transcript.includes('help')) {
          this.config.onDetected('help');
        } else if (transcript.includes('emergency')) {
          this.config.onDetected('emergency');
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      
      if (event.error === 'no-speech') {
        // Restart recognition after no speech
        this.restartRecognition();
      } else if (event.error === 'not-allowed') {
        this.config?.onError?.(new Error('Microphone access denied. Please enable microphone permissions.'));
        this.isListening = false;
      } else {
        this.config?.onError?.(new Error(`Voice detection error: ${event.error}`));
      }
    };

    this.recognition.onend = () => {
      // Auto-restart if still supposed to be listening
      if (this.isListening) {
        this.restartRecognition();
      }
    };
  }

  private restartRecognition(): void {
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
    }
    
    this.restartTimeout = setTimeout(() => {
      if (this.isListening && this.recognition) {
        try {
          this.recognition.start();
        } catch (error) {
          // Already started, ignore
        }
      }
    }, 1000);
  }

  startListening(config: VoiceDetectionConfig): boolean {
    if (!this.recognition) {
      config.onError?.(new Error('Voice recognition not supported in this browser'));
      return false;
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.config = config;
    this.isListening = true;

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      config.onError?.(error as Error);
      this.isListening = false;
      return false;
    }
  }

  stopListening(): void {
    this.isListening = false;
    
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        // Already stopped, ignore
      }
    }
    
    this.config = null;
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}

export const voiceDetectionService = new VoiceDetectionService();
