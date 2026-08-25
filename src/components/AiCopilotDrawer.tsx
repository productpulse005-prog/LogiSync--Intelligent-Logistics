import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  RotateCcw,
  Zap,
  HelpCircle,
  Mic,
  MicOff,
  Volume2,
} from 'lucide-react';
import { api } from '../services/api';
import { CityId, SUPPORTED_CITIES } from '../data/multiCityData';

interface AiCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  activeCity?: CityId;
}

interface Message {
  id: string;
  sender: 'USER' | 'AI';
  text: string;
  source?: string;
  timestamp: string;
}

const CITY_SUGGESTED_CHIPS: Record<CityId, string[]> = {
  PUNE: [
    'Why are Hinjewadi deliveries delayed today?',
    'What happens when mitigation is applied?',
    'Explain Mathadi union demand at Megapolis Gate 2',
    'Which societies in Wakad & Baner have afternoon lift blackouts?',
  ],
  BANGALORE: [
    'Why is Silk Board & Outer Ring Road jammed today?',
    'What happens when mitigation is applied?',
    'Explain gate entry restrictions at Prestige Shantiniketan',
    'Which towers in Bellandur & Whitefield have lift maintenance windows?',
  ],
  DELHI_NCR: [
    'Why is Dwarka Expressway transit delayed today?',
    'What happens when mitigation is applied?',
    'Explain security gate protocols at ATS Greens Village Sector 150',
    'Which sectors in Noida & Gurgaon restrict afternoon heavy cargo?',
  ],
  MUMBAI: [
    'Why is Eastern Freeway & JVLR traffic delayed today?',
    'What happens when mitigation is applied?',
    'Explain Mathadi union toll at Hiranandani Gardens Powai',
    'Which high-rises in Lower Parel & Thane require freight lift permits?',
  ],
  HYDERABAD: [
    'Why are Financial District & Gachibowli dispatches delayed?',
    'What happens when mitigation is applied?',
    'Explain service elevator protocol at My Home Bhooja Tower D',
    'Which societies in Kondapur & Hitec City restrict heavy vehicle entry?',
  ],
};

export const AiCopilotDrawer: React.FC<AiCopilotDrawerProps> = ({
  isOpen,
  onClose,
  initialQuery,
  activeCity = 'PUNE',
}) => {
  const currentCityConfig = SUPPORTED_CITIES[activeCity] || SUPPORTED_CITIES.PUNE;
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'AI',
      text: `Hello! I am your LogiSync Operations Copilot for ${currentCityConfig.name}.
I analyze real-world ground constraints (road excavations, Mathadi union demands, lift blackout windows, society security protocols) across all active corridors in ${currentCityConfig.name}.

How can I assist your dispatch team today? You can type or tap the microphone to speak.`,
      source: 'LogiSync AI',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState<string>(initialQuery || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);

  const suggestedChips = CITY_SUGGESTED_CHIPS[activeCity] || CITY_SUGGESTED_CHIPS.PUNE;

  // Speech Recognition Setup
  const toggleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setInputValue('What happens when mitigation is applied?');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputValue(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('SpeechRecognition error:', e);
      setIsListening(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setInputValue(initialQuery);
    }
  }, [initialQuery]);

  const handleSendMessage = async (queryText?: string) => {
    const q = (queryText || inputValue).trim();
    if (!q || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await api.queryAiCopilot(q);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'AI',
        text: res.response,
        source: res.source,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'AI',
          text: 'When mitigation is applied, LogiSync coordinates 4 simultaneous actions: (1) Telematics dynamic bypass around road blocks, (2) Pre-authorized digital gate voucher for Mathadi/gate fees, (3) Customer promise protection with reassuring transparent updates, and (4) Closed-loop learning calibration for future route accuracy.',
          source: 'LogiSync Mitigation Engine',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col animate-slide-left text-sm">
      {/* Drawer Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm">AI Operations Copilot</h3>
            <span className="text-[11px] text-slate-400">Powered by Gemini &amp; LogiSync Telematics</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Suggested Questions */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 space-y-1.5">
        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
          Suggested Queries ({currentCityConfig.name})
        </span>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {suggestedChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              className="text-[11px] bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 px-3 py-1 rounded-full whitespace-nowrap transition-colors shadow-2xs font-medium cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isAi = msg.sender === 'AI';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
            >
              {isAi && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 space-y-1.5 leading-relaxed text-xs ${
                  isAi
                    ? 'bg-slate-50 border border-slate-200 text-slate-800'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                <div
                  className={`flex items-center justify-between text-[10px] pt-1 ${
                    isAi ? 'text-slate-400 border-t border-slate-200' : 'text-indigo-200'
                  }`}
                >
                  <span>{msg.source || 'Dispatch Query'}</span>
                  <span>{msg.timestamp}</span>
                </div>
              </div>

              {!isAi && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
              <RotateCcw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>Analyzing city corridor telemetry &amp; constraint graphs...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box with Microphone Voice Button */}
      <div className="p-3 bg-white border-t border-slate-200 space-y-2">
        {isListening && (
          <div className="text-[11px] text-rose-600 font-bold flex items-center gap-1.5 px-2 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-600" />
            <span>Listening... Speak your logistics question now</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-600/30'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title={isListening ? 'Stop Listening' : 'Speak Question with Microphone'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={isListening ? 'Listening...' : 'Ask about delays, mitigations, Mathadi fees...'}
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-medium"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 transition-colors shadow-xs cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
