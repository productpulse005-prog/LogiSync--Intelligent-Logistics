import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Square,
  Sparkles,
  Volume2,
  AlertCircle,
  Check,
  RotateCcw,
  AudioLines,
} from 'lucide-react';

interface VoiceMicRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  placeholder?: string;
  isListening?: boolean;
}

export const VoiceMicRecorder: React.FC<VoiceMicRecorderProps> = ({
  onTranscriptionComplete,
  placeholder = 'Speak ground report in Hindi, English, or Hinglish...',
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [micError, setMicError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize Speech Recognition & Audio Meter
  const startRecording = async () => {
    setMicError(null);
    setLiveTranscript('');

    try {
      // 1. Audio stream for live volume meter
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const checkVolume = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
            animationFrameRef.current = requestAnimationFrame(checkVolume);
          };
          checkVolume();
        }
      }

      // 2. Speech Recognition (Web Speech API)
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-IN'; // Optimized for Indian English / accents

        recognition.onresult = (event: any) => {
          let current = '';
          for (let i = 0; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          setLiveTranscript(current);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition event:', event.error);
          if (event.error === 'not-allowed') {
            setMicError('Microphone permission was denied. Please allow mic in browser.');
          }
        };

        recognition.onend = () => {
          // If still marked recording, can auto restart or finalize
        };

        recognitionRef.current = recognition;
        recognition.start();
      } else {
        console.warn('SpeechRecognition API not available in this browser.');
      }

      setIsRecording(true);
    } catch (err: any) {
      console.warn('Mic start notice:', err.message);
      setMicError(
        err.name === 'NotAllowedError'
          ? 'Microphone permission denied. Enable microphone access to use voice dictation.'
          : 'Unable to access microphone device.'
      );
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);

    // Stop audio stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    // Stop recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (liveTranscript.trim()) {
      onTranscriptionComplete(liveTranscript.trim());
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Quick Voice Simulation Presets
  const VOICE_PRESETS = [
    'Gate 2 union demanded 350 cash for unloading clearance at Megapolis',
    'Main Phase 1 bridge has fresh Metro excavation road block, taking Marunji bypass',
    'Service elevator shut down for 2 hours maintenance in Tower B',
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-500 tracking-wider">
          <Mic className="w-3.5 h-3.5 text-indigo-600" />
          <span>Microphone Voice Dictation (Hands-Free)</span>
        </div>

        {isRecording && (
          <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-600" />
            Live Recording ({audioLevel}%)
          </span>
        )}
      </div>

      {/* Mic Record Bar */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer ${
            isRecording
              ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {isRecording ? (
            <>
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>Stop &amp; Transcribe</span>
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5" />
              <span>Start Speaking</span>
            </>
          )}
        </button>

        {/* Live Audio Visualizer Waves */}
        <div className="flex-1 flex items-center gap-1 justify-center px-2">
          {isRecording ? (
            <div className="flex items-center gap-1">
              {[40, 70, 100, 60, 30, 80, 95, 50, 60, 85].map((h, i) => {
                const dynamicHeight = Math.max(4, Math.min(24, (h * audioLevel) / 100));
                return (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-indigo-500 transition-all duration-75"
                    style={{ height: `${dynamicHeight}px` }}
                  />
                );
              })}
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 italic text-center">
              {liveTranscript ? liveTranscript : placeholder}
            </span>
          )}
        </div>

        {liveTranscript && !isRecording && (
          <button
            type="button"
            onClick={() => onTranscriptionComplete(liveTranscript)}
            className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
            title="Use Live Transcript"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Use</span>
          </button>
        )}
      </div>

      {micError && (
        <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{micError}</span>
        </div>
      )}

      {/* Quick Dictation Presets (1-Tap Driver Presets) */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[10px] text-slate-400 font-semibold">1-Tap Voice Simulation:</span>
        {VOICE_PRESETS.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onTranscriptionComplete(preset)}
            className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-lg truncate max-w-[220px] transition-colors cursor-pointer"
            title={preset}
          >
            &ldquo;{preset.slice(0, 32)}...&rdquo;
          </button>
        ))}
      </div>
    </div>
  );
};
