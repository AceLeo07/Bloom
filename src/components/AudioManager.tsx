import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';

interface AudioManagerProps {
  onPositiveAnswer?: () => void;
  onNegativeAnswer?: () => void;
}

export function AudioManager({ onPositiveAnswer, onNegativeAnswer }: AudioManagerProps) {
  const [volume, setVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<number | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodesRef = useRef<GainNode[]>([]);

  // Initialize improved nature sounds using Web Audio API
  useEffect(() => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = audioContext;
    
    const oscillators: OscillatorNode[] = [];
    const gainNodes: GainNode[] = [];
    
    // Create forest ambience with multiple layers
    createForestAmbience(audioContext, oscillators, gainNodes);
    
    oscillatorsRef.current = oscillators;
    gainNodesRef.current = gainNodes;

    return () => {
      oscillators.forEach(osc => {
        try {
          osc.stop();
        } catch (e) {
          // Oscillator might already be stopped
        }
      });
      audioContext.close();
    };
  }, []);

  // Update volume for all sounds
  useEffect(() => {
    gainNodesRef.current.forEach(gainNode => {
      if (gainNode) {
        gainNode.gain.setValueAtTime(isMuted ? 0 : volume * 0.1, audioContextRef.current?.currentTime || 0);
      }
    });
  }, [volume, isMuted]);

  const createForestAmbience = (audioContext: AudioContext, oscillators: OscillatorNode[], gainNodes: GainNode[]) => {
    // Gentle wind through trees (low frequencies)
    for (let i = 0; i < 3; i++) {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(30 + i * 10, audioContext.currentTime);
      
      // Wind modulation
      const lfo = audioContext.createOscillator();
      const lfoGain = audioContext.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.1 + i * 0.05, audioContext.currentTime);
      lfoGain.gain.setValueAtTime(15, audioContext.currentTime);
      
      lfo.connect(lfoGain);
      lfoGain.connect(oscillator.frequency);
      
      // Low-pass filter for wind
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, audioContext.currentTime);
      filter.Q.setValueAtTime(0.5, audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(isMuted ? 0 : volume * 0.05, audioContext.currentTime);
      
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      lfo.start();
      
      oscillators.push(oscillator);
      gainNodes.push(gainNode);
    }
    
    // Distant bird calls (more realistic)
    for (let i = 0; i < 2; i++) {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800 + i * 300, audioContext.currentTime);
      
      // Bird call modulation
      const lfo = audioContext.createOscillator();
      const lfoGain = audioContext.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.5 + i * 0.2, audioContext.currentTime);
      lfoGain.gain.setValueAtTime(150, audioContext.currentTime);
      
      lfo.connect(lfoGain);
      lfoGain.connect(oscillator.frequency);
      
      // Band-pass filter for bird sound
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800 + i * 300, audioContext.currentTime);
      filter.Q.setValueAtTime(4, audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(isMuted ? 0 : volume * 0.03, audioContext.currentTime);
      
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      lfo.start();
      
      oscillators.push(oscillator);
      gainNodes.push(gainNode);
    }

    // Gentle forest rustling (mid frequencies)
    for (let i = 0; i < 2; i++) {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(200 + i * 100, audioContext.currentTime);
      
      // Rustling modulation
      const lfo = audioContext.createOscillator();
      const lfoGain = audioContext.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.3 + i * 0.1, audioContext.currentTime);
      lfoGain.gain.setValueAtTime(50, audioContext.currentTime);
      
      lfo.connect(lfoGain);
      lfoGain.connect(oscillator.frequency);
      
      // High-pass filter for rustling
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(150, audioContext.currentTime);
      filter.Q.setValueAtTime(1, audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(isMuted ? 0 : volume * 0.02, audioContext.currentTime);
      
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      lfo.start();
      
      oscillators.push(oscillator);
      gainNodes.push(gainNode);
    }
  };

  // Play positive SFX - Gentle nature success sound
  useEffect(() => {
    if (onPositiveAnswer) {
      const playPositive = () => {
        const audioContext = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create a gentle nature success sound
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
        const oscillators: OscillatorNode[] = [];
        const gainNodes: GainNode[] = [];
        
        frequencies.forEach((freq, index) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          const filter = audioContext.createBiquadFilter();
          
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
          
          // Gentle modulation
          const lfo = audioContext.createOscillator();
          const lfoGain = audioContext.createGain();
          lfo.type = 'sine';
          lfo.frequency.setValueAtTime(2 + index * 0.5, audioContext.currentTime);
          lfoGain.gain.setValueAtTime(freq * 0.02, audioContext.currentTime);
          
          lfo.connect(lfoGain);
          lfoGain.connect(oscillator.frequency);
          
          // Warm filter
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(2000, audioContext.currentTime);
          filter.Q.setValueAtTime(1, audioContext.currentTime);
          
          gainNode.gain.setValueAtTime(isMuted ? 0 : volume * 0.15, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 2);
          
          oscillator.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.start(audioContext.currentTime + index * 0.2);
          oscillator.stop(audioContext.currentTime + 2);
          lfo.start(audioContext.currentTime + index * 0.2);
          lfo.stop(audioContext.currentTime + 2);
          
          oscillators.push(oscillator);
          gainNodes.push(gainNode);
        });
      };

      (window as any).playPositiveSFX = playPositive;
    }
  }, [volume, isMuted, onPositiveAnswer]);

  // Play negative SFX - Gentle nature reminder
  useEffect(() => {
    if (onNegativeAnswer) {
      const playNegative = () => {
        const audioContext = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create a gentle wind reminder sound
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(120, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 1);
        
        // Gentle wind filter
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, audioContext.currentTime);
        filter.Q.setValueAtTime(0.7, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(isMuted ? 0 : volume * 0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1);
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1);
      };

      (window as any).playNegativeSFX = playNegative;
    }
  }, [volume, isMuted, onNegativeAnswer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      delete (window as any).playPositiveSFX;
      delete (window as any).playNegativeSFX;
    };
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    setShowControls(true);
  };

  const handleMouseLeave = () => {
    const timeout = window.setTimeout(() => {
      setShowControls(false);
    }, 1000);
    setHoverTimeout(timeout as any);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (values: number[]) => {
    setVolume(values[0]);
    if (values[0] > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {showControls && (
        <div className="bg-background/90 backdrop-blur-sm border border-border rounded-lg p-3 flex items-center gap-3 animate-in slide-in-from-right">
          <span className="text-xs text-muted-foreground font-medium">Volume</span>
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
            max={1}
            step={0.01}
            className="w-24"
          />
        </div>
      )}
      
      <Button
        variant="outline"
        size="icon"
        onClick={toggleMute}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="bg-background/90 backdrop-blur-sm shadow-lg hover:bg-background"
      >
        {isMuted ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
