import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Square,
  Play,
  RotateCcw,
} from 'lucide-react';
import { Department, Doctor } from '../types';

interface PetChatBotProps {
  departments: Department[];
  doctors: Doctor[];
  onStartBooking: (doctorId?: string) => void;
  onTrackToken: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  quickActions?: { label: string; action: () => void }[];
}

// Clean text for speech synthesis (remove markdown formatting & excessive symbols)
function sanitizeTextForSpeech(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/[*_~`#]/g, '')
    .replace(/🐾|📅|⏱️|🩺|❤️|🏥|💊|⚡|🔔|📧|Namaste/g, 'Namaste')
    .replace(/\s+/g, ' ')
    .trim();
}

export const PetChatBot: React.FC<PetChatBotProps> = ({
  departments,
  doctors,
  onStartBooking,
  onTrackToken,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Namaste! 🐾 Main Shrushrut Buddy hoon, aapka OPD Virtual Voice Assistant. Main bol kar aur likh kar aapki poori madad kar sakta hoon. Aap mujhse doctor, department ya token ke baare mein puch sakte hain!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickActions: [
        { label: '📅 Book Consultation', action: () => onStartBooking() },
        { label: '⏱️ Track My Token', action: () => onTrackToken() },
        { label: '🩺 Department Guide', action: () => handleSendPreset('Which department should I visit for checkup?') },
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Check speech synthesis support
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSpeechSupported(false);
    }
  }, []);

  // Speak function using SpeechSynthesis
  const speakText = useCallback(
    (text: string, messageId?: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      window.speechSynthesis.cancel(); // Stop any active speech

      const cleanText = sanitizeTextForSpeech(text);
      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Select natural voice (prefer Indian English or Hindi if available)
      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find(
        (v) => v.lang.includes('hi') || v.lang.includes('IN') || v.name.includes('India') || v.name.includes('Hindi')
      );
      const englishVoice = voices.find((v) => v.lang.startsWith('en'));

      if (hindiVoice) {
        utterance.voice = hindiVoice;
      } else if (englishVoice) {
        utterance.voice = englishVoice;
      }

      utterance.rate = 1.0;
      utterance.pitch = 1.05;

      utterance.onstart = () => {
        setIsSpeaking(true);
        if (messageId) setCurrentlySpeakingId(messageId);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentlySpeakingId(null);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setCurrentlySpeakingId(null);
      };

      window.speechSynthesis.speak(utterance);
    },
    []
  );

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentlySpeakingId(null);
    }
  };

  // Auto-speak initial greeting when bot opened first time
  useEffect(() => {
    if (isOpen && voiceEnabled && messages.length === 1) {
      speakText(messages[0].text, messages[0].id);
    }
    if (!isOpen) {
      stopSpeaking();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Speech Recognition (Voice Input / Mic)
  const toggleListening = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported on this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN'; // Works for Hindi and Indian English accents
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          handleUserMessage(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleSendPreset = (text: string) => {
    handleUserMessage(text);
  };

  const handleUserMessage = (userText: string) => {
    if (!userText.trim()) return;

    // Stop speaking if previously talking
    stopSpeaking();

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Generate intelligent assistant response
    setTimeout(() => {
      let botResponse = '';
      const lower = userText.toLowerCase();

      if (
        lower.includes('chest') ||
        lower.includes('heart') ||
        lower.includes('bp') ||
        lower.includes('cardio') ||
        lower.includes('dil') ||
        lower.includes('dhadkan')
      ) {
        botResponse =
          'Dil ya chest pain, breathlessness, ya blood pressure ki pareshani ke liye hamare Cardiology Department (Wing A — 2nd Floor, Dr. Anjali Sharma) mein consult karein.';
      } else if (
        lower.includes('bone') ||
        lower.includes('joint') ||
        lower.includes('fracture') ||
        lower.includes('knee') ||
        lower.includes('back') ||
        lower.includes('haddi') ||
        lower.includes('ghutne')
      ) {
        botResponse =
          'Haddi, jod dard, knee pain ya fracture ke liye hamare Orthopedics Department (Wing B — 1st Floor, Dr. Rajesh Verma) mein consultation uplabdh hai.';
      } else if (
        lower.includes('headache') ||
        lower.includes('brain') ||
        lower.includes('nerve') ||
        lower.includes('stroke') ||
        lower.includes('migraine') ||
        lower.includes('sar dard')
      ) {
        botResponse =
          'Sar dard, chakkar, migraine ya naso ki jaanch ke liye Neurology Department (Wing A — 3rd Floor, Dr. Priya Nair) sampark karein.';
      } else if (
        lower.includes('cough') ||
        lower.includes('cold') ||
        lower.includes('breath') ||
        lower.includes('asthma') ||
        lower.includes('lung') ||
        lower.includes('khansi') ||
        lower.includes('saans')
      ) {
        botResponse =
          'Khansi, zukaam, asthma ya saans lene ki takleef ke liye Pulmonology Department (Wing C — 2nd Floor, Dr. Suresh Reddy) uplabdh hai.';
      } else if (
        lower.includes('fever') ||
        lower.includes('general') ||
        lower.includes('body pain') ||
        lower.includes('infection') ||
        lower.includes('bukhar') ||
        lower.includes('dard')
      ) {
        botResponse =
          'Bukhar, seasonal infection, ya general triage checkup ke liye General Medicine OPD (Ground Floor Main Atrium, Dr. Amit Patel) mein token lein.';
      } else if (
        lower.includes('child') ||
        lower.includes('kid') ||
        lower.includes('baby') ||
        lower.includes('vaccin') ||
        lower.includes('bachhe')
      ) {
        botResponse =
          'Bachho ki sehat, routine checkup aur vaccination ke liye Pediatrics Department (Wing D — 1st Floor, Dr. Sneha Kulkarni) se slot book karein.';
      } else if (
        lower.includes('book') ||
        lower.includes('appointment') ||
        lower.includes('slot') ||
        lower.includes('token')
      ) {
        botResponse =
          'Aap apna digital OPD Token abhi turant book kar sakte hain! Doctor select karke Book Now par click karein.';
      } else if (
        lower.includes('wait') ||
        lower.includes('time') ||
        lower.includes('queue') ||
        lower.includes('track') ||
        lower.includes('kab')
      ) {
        botResponse =
          'Aaj OPD mein average wait time lagbhag 25 se 35 minutes hai. Aap apna token number daalkar Live Queue Tracker par live status dekh sakte hain.';
      } else if (
        lower.includes('namaste') ||
        lower.includes('hello') ||
        lower.includes('hi') ||
        lower.includes('kya hal')
      ) {
        botResponse =
          'Namaste! Main badhiya hoon. Shrushrut Hospital OPD mein aapka swagat hai. Main aapki kis prakar sahayata kar sakta hoon?';
      } else {
        botResponse =
          'Main aapko sahi department guide kar sakta hoon, OPD timings bata sakta hoon aur slot book karne me madad kar sakta hoon. Aapko kya jaankari chahiye?';
      }

      const newBotMsgId = (Date.now() + 1).toString();
      const botMsg: ChatMessage = {
        id: newBotMsgId,
        sender: 'bot',
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickActions: [
          { label: '📅 Book Now', action: () => onStartBooking() },
          { label: '⏱️ Live Queue Tracker', action: () => onTrackToken() },
        ],
      };

      setMessages((prev) => [...prev, botMsg]);

      // Automatically speak the response if voice is enabled
      if (voiceEnabled) {
        speakText(botResponse, newBotMsgId);
      }
    }, 450);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Collapsed Floating Pet Icon Button with Sound Wave Pulse */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white p-3.5 sm:px-5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 border-white/80"
          title="Chat & Voice Assistant"
        >
          <div className="w-8 h-8 rounded-full bg-white text-teal-600 flex items-center justify-center font-bold text-base shadow-xs">
            🐾
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="font-bold text-xs tracking-wide flex items-center gap-1">
              <span>OPD Voice Bot</span>
              <Volume2 className="w-3 h-3 text-teal-200 animate-pulse" />
            </span>
            <span className="text-[10px] text-teal-100 font-medium">Bolo ya Chat karo</span>
          </div>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-white animate-ping" />
        </button>
      )}

      {/* Expanded Chat Drawer / Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 h-[530px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#06182e] via-[#0b2b4f] to-[#0d3b66] p-4 text-white flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-white flex items-center justify-center text-lg shadow-xs">
                  🐾
                </div>
                {isSpeaking && (
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse" />
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold flex items-center gap-1.5">
                  <span>Shrushrut Voice Bot</span>
                  <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-teal-200">
                  {isSpeaking ? (
                    <span className="flex items-center gap-1 text-emerald-300 font-semibold animate-pulse">
                      <Volume2 className="w-3 h-3" />
                      <span>Speaking audio...</span>
                    </span>
                  ) : (
                    <span>Virtual OPD Audio Assistant</span>
                  )}
                </div>
              </div>
            </div>

            {/* Header Controls: Voice Toggle & Close */}
            <div className="flex items-center gap-1.5">
              {/* Stop Speaking Button if Active */}
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="p-1.5 bg-rose-500/80 hover:bg-rose-600 text-white rounded-full transition-colors cursor-pointer"
                  title="Stop audio"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                </button>
              )}

              {/* Voice Sound Toggle */}
              <button
                onClick={() => {
                  const newState = !voiceEnabled;
                  setVoiceEnabled(newState);
                  if (!newState) stopSpeaking();
                }}
                className={`p-2 rounded-full transition-colors cursor-pointer ${
                  voiceEnabled ? 'bg-teal-500/30 text-teal-200 hover:bg-teal-500/50' : 'bg-white/10 text-slate-400 hover:bg-white/20'
                }`}
                title={voiceEnabled ? 'Voice output ON (Click to mute)' : 'Voice output OFF (Click to unmute)'}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  stopSpeaking();
                  setIsOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Speaking Status Bar */}
          {isSpeaking && (
            <div className="bg-emerald-50 border-b border-emerald-200 px-3 py-1.5 flex items-center justify-between text-[11px] text-emerald-800">
              <div className="flex items-center gap-1.5 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Bot Bol Raha Hai (Audio Active)</span>
              </div>
              <button
                onClick={stopSpeaking}
                className="text-[10px] uppercase font-bold text-rose-700 hover:underline cursor-pointer"
              >
                Mute / Stop
              </button>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/70 text-xs">
            {messages.map((msg) => {
              const isMsgSpeaking = currentlySpeakingId === msg.id && isSpeaking;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5 shadow-2xs">
                      🐾
                    </div>
                  )}
                  <div className="max-w-[82%] space-y-2">
                    <div
                      className={`p-3.5 rounded-2xl relative ${
                        msg.sender === 'user'
                          ? 'bg-teal-600 text-white rounded-tr-xs shadow-xs'
                          : isMsgSpeaking
                          ? 'bg-emerald-50 text-slate-900 border-2 border-emerald-400 rounded-tl-xs shadow-sm ring-2 ring-emerald-200'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-2xs'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/40">
                        <span
                          className={`text-[9px] font-mono ${
                            msg.sender === 'user' ? 'text-teal-200' : 'text-slate-400'
                          }`}
                        >
                          {msg.timestamp}
                        </span>

                        {/* Listen Again / Speak Single Message Button */}
                        {msg.sender === 'bot' && (
                          <button
                            onClick={() => {
                              if (isMsgSpeaking) {
                                stopSpeaking();
                              } else {
                                speakText(msg.text, msg.id);
                              }
                            }}
                            className={`p-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors ${
                              isMsgSpeaking
                                ? 'bg-emerald-600 text-white'
                                : 'text-teal-700 hover:bg-teal-50 bg-slate-100/80'
                            }`}
                            title="Listen to this message"
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>{isMsgSpeaking ? 'Stop Audio' : 'Sunnein'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Quick Action Chips */}
                    {msg.quickActions && msg.quickActions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.quickActions.map((qa, i) => (
                          <button
                            key={i}
                            onClick={qa.action}
                            className="text-[11px] font-semibold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-full cursor-pointer transition-colors"
                          >
                            {qa.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Voice Input Indicator Banner */}
          {isListening && (
            <div className="bg-amber-50 border-t border-amber-200 px-3 py-1.5 flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="font-semibold text-[11px]">Aapki aawaz sun raha hai (Speak now)...</span>
              </div>
              <button
                onClick={toggleListening}
                className="text-[10px] uppercase font-bold text-rose-600 hover:underline cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Input Box with Mic and Send */}
          <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
            {/* Mic Speech-to-Text Button */}
            <button
              onClick={toggleListening}
              className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white animate-bounce shadow-md'
                  : 'bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200'
              }`}
              title={isListening ? 'Listening... click to stop' : 'Click to speak by voice'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleUserMessage(input);
                }
              }}
              placeholder={isListening ? 'Listening to your voice...' : 'Type ya mic dabakar bole...'}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-medium"
            />

            <button
              onClick={() => handleUserMessage(input)}
              className="p-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl cursor-pointer transition-colors shadow-xs"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

