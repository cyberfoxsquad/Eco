import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  RefreshCw,
  Volume2,
  VolumeX,
  CheckCircle2,
  Leaf,
  ShieldAlert,
  Recycle,
  HelpCircle,
  Coins,
  Flame,
  Maximize2,
  Minimize2,
  Award,
  ArrowRight,
  ExternalLink,
  Bot,
  Zap,
  Brain,
  Copy,
  Check,
  ChevronDown,
  Trash2,
} from 'lucide-react';
import { useEco } from '../context/EcoContext';
import { ChatMessage, WasteScanResult, GeminiModelType, ChatbotRole } from '../types';
import { EcoCollectLogo } from './EcoCollectLogo';

interface EcoChatBotProps {
  defaultOpen?: boolean;
  standalone?: boolean;
  onClose?: () => void;
}

const ROLE_DEFINITIONS: Record<
  ChatbotRole,
  {
    name: string;
    badge: string;
    icon: string;
    greeting: string;
    starters: string[];
  }
> = {
  civic_waste_expert: {
    name: 'Civic Waste Expert',
    badge: 'Municipal Standard',
    icon: '🏛️',
    greeting:
      '👋 Hello Citizen! I am your **Civic Waste Management Expert** on EcoCollect. I provide verified guidelines on municipal 4-color bin segregation (Green, Blue, Red, Yellow), polymer classifications, clean recycling preparation, and direct UPI reward points.',
    starters: [
      'Which bin for plastic milk packets?',
      'How do I earn UPI cash rewards?',
      'Official 4-color municipal bin guide',
      'Where do used dry cell batteries go?',
    ],
  },
  zero_waste_coach: {
    name: 'Zero-Waste Coach',
    badge: 'Circular Lifestyle',
    icon: '🌿',
    greeting:
      '🌱 Welcome! I am your **Zero-Waste & Sustainability Coach**. I specialize in helping households refuse single-use plastics, adopt reusable lifestyle habits, discover creative upcycling hacks, and achieve zero-landfill living.',
    starters: [
      'How to eliminate single-use plastic in kitchen?',
      'What are easy zero-waste swaps for grocery shopping?',
      'How to upcycle old glass jars at home?',
      'What is the 5R rule of zero-waste?',
    ],
  },
  compost_specialist: {
    name: 'Compost Specialist',
    badge: 'Organic Soil Master',
    icon: '🪴',
    greeting:
      '🌿 Greetings! I am your **Composting & Soil Science Specialist**. Ask me anything about home aerobic bin composting, terracotta pots, the 2:1 brown-to-green carbon/nitrogen ratio, moisture balancing, and troubleshooting odors.',
    starters: [
      'What is the 2:1 brown to green composting ratio?',
      'Can I put cooked food or citrus peels in compost?',
      'How do I fix a smelly or wet compost pile?',
      'How do I earn EcoPoints for home composting?',
    ],
  },
  circularity_auditor: {
    name: 'Circularity Auditor',
    badge: 'Life-Cycle Analyst',
    icon: '📊',
    greeting:
      '🔬 Greetings! I am your **Circularity & Life-Cycle Assessment Auditor**. I analyze materials from an industrial lifecycle perspective: carbon avoidance (kg CO₂e), resin identification codes (PET #1 through OTHER #7), and mechanical pulping recovery efficiencies.',
    starters: [
      'Explain recycling pathway for PET vs HDPE plastics',
      'What is the carbon footprint reduction from aluminum recycling?',
      'How many times can corrugated cardboard fibers be recycled?',
      'What is the circularity index of municipal e-waste?',
    ],
  },
};

const MODEL_OPTIONS: Array<{
  id: GeminiModelType;
  label: string;
  tag: string;
  icon: typeof Sparkles;
  description: string;
}> = [
  {
    id: 'gemini-2.5-flash',
    label: 'gemini-2.5-flash',
    tag: 'Balanced / General',
    icon: Sparkles,
    description: 'Optimal balance of speed and detailed civic reasoning',
  },
  {
    id: 'gemini-2.5-flash-lite',
    label: 'gemini-2.5-flash-lite',
    tag: 'Fast Responses',
    icon: Zap,
    description: 'Ultra low-latency responses for quick checks',
  },
  {
    id: 'gemini-2.5-pro',
    label: 'gemini-2.5-pro',
    tag: 'Complex Reasoning',
    icon: Brain,
    description: 'In-depth environmental science and technical breakdown',
  },
];

// Helper function to render inline markdown like **bold** and `code`
const renderInlineMarkdown = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, pIdx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={pIdx} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={pIdx} className="bg-slate-100 text-emerald-800 px-1 py-0.2 rounded text-[11px] font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
};

// Structured markdown renderer for lines, headers, lists and bullets
const renderFormattedContent = (content: string) => {
  const lines = content.split('\n');
  return lines.map((line, lineIdx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return <div key={lineIdx} className="h-1.5" />;
    }

    if (trimmed.startsWith('### ')) {
      return (
        <h4 key={lineIdx} className="font-extrabold text-sm text-slate-900 mt-2 mb-1">
          {renderInlineMarkdown(trimmed.replace('### ', ''))}
        </h4>
      );
    }

    if (trimmed.startsWith('## ')) {
      return (
        <h3 key={lineIdx} className="font-black text-sm text-slate-900 mt-2.5 mb-1">
          {renderInlineMarkdown(trimmed.replace('## ', ''))}
        </h3>
      );
    }

    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      return (
        <div key={lineIdx} className="flex items-start gap-1.5 ml-1 my-0.5">
          <span className="text-emerald-500 font-bold shrink-0 mt-0.5">•</span>
          <span className="leading-snug">{renderInlineMarkdown(trimmed.replace(/^[*-]\s+/, ''))}</span>
        </div>
      );
    }

    const numMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numMatch) {
      return (
        <div key={lineIdx} className="flex items-start gap-1.5 ml-1 my-0.5">
          <span className="text-emerald-600 font-bold shrink-0">{numMatch[1]}.</span>
          <span className="leading-snug">{renderInlineMarkdown(numMatch[2])}</span>
        </div>
      );
    }

    return (
      <p key={lineIdx} className="my-0.5 leading-relaxed">
        {renderInlineMarkdown(line)}
      </p>
    );
  });
};

export const EcoChatBot: React.FC<EcoChatBotProps> = ({
  defaultOpen = false,
  standalone = false,
  onClose,
}) => {
  const { setCurrentRoute, setDraftDetails, currentUser } = useEco();

  const [isOpen, setIsOpen] = useState(defaultOpen || standalone);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Gemini Model & Role states
  const [selectedModel, setSelectedModel] = useState<GeminiModelType>('gemini-2.5-flash');
  const [selectedRole, setSelectedRole] = useState<ChatbotRole>('civic_waste_expert');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowModelDropdown(false);
        setShowRoleDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const createInitialMessage = (role: ChatbotRole): ChatMessage => {
    const roleInfo = ROLE_DEFINITIONS[role];
    const citizenName = currentUser ? currentUser.name.split(' ')[0] : 'Citizen';
    return {
      id: `msg-welcome-${role}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sender: 'bot',
      text: roleInfo.greeting.replace('Citizen', citizenName),
      timestamp: Date.now(),
      modelUsed: selectedModel,
      roleUsed: role,
      suggestedPrompts: roleInfo.starters,
    };
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    createInitialMessage('civic_waste_expert'),
  ]);

  // Scroll only the chat container without jumping outer window
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Audio Speech Synthesis
  const speakText = (text: string) => {
    if (!soundEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    // Clean markdown syntax from spoken audio
    const cleanSpeech = text
      .replace(/[#*`_]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .slice(0, 240);

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 0.96;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Copy text to clipboard
  const handleCopy = (text: string, id: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Change Role and update conversation
  const handleRoleChange = (newRole: ChatbotRole) => {
    setSelectedRole(newRole);
    setShowRoleDropdown(false);
    const greetingMsg = createInitialMessage(newRole);
    setMessages((prev) => [...prev, greetingMsg]);
  };

  // Reset/Clear entire chat history
  const handleResetChat = () => {
    stopSpeaking();
    setMessages([createInitialMessage(selectedRole)]);
  };

  // Send Message (Multi-turn Gemini API call)
  const handleSend = async (customText?: string) => {
    const textToSend = customText !== undefined ? customText : inputMessage.trim();
    if (!textToSend || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build conversation history from the single thread
      const historyPayload = messages.slice(-10).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'bot',
        content: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          model: selectedModel,
          role: selectedRole,
        }),
      });

      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply || 'Here is the municipal waste guidance for your query.',
        scanResult: data.scanResult || undefined,
        suggestedPrompts: data.suggestedPrompts || ROLE_DEFINITIONS[selectedRole].starters,
        modelUsed: data.modelUsed || selectedModel,
        roleUsed: data.roleUsed || selectedRole,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botMsg]);

      // If speech synthesis enabled, read brief summary aloud
      if (soundEnabled && data.reply) {
        speakText(data.reply.slice(0, 180));
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'bot',
        text: "I couldn't reach the server right now, but you can continue checking waste segregation rules, bin colors, and UPI cash rewards using the suggestions below!",
        suggestedPrompts: ROLE_DEFINITIONS[selectedRole].starters,
        modelUsed: selectedModel,
        roleUsed: selectedRole,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick action: forward to disposal screen with prefilled details
  const handleLogDisposalFromChat = (scan: WasteScanResult) => {
    setDraftDetails(
      scan.category,
      scan.itemName,
      (scan.estimatedWeightKg || 0.5).toString()
    );
    if (onClose) onClose();
    setIsOpen(false);
    setCurrentRoute('disposal');
  };

  // If floating and closed, render launcher badge
  if (!isOpen && !standalone) {
    return (
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end gap-2">
        {/* Floating Callout Bubble */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 text-white text-xs px-3.5 py-1.5 rounded-full shadow-lg border border-slate-700/80 animate-bounce">
          <Sparkles size={13} className="text-emerald-400" />
          <span className="font-semibold">Ask Gemini Waste Assistant</span>
        </div>

        {/* Floating Button */}
        <button
          id="btn_open_ecochatbot"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all border border-emerald-400/40"
          title="Open EcoBot Gemini Assistant"
        >
          <div className="w-8 h-8 rounded-xl bg-white/15 p-1 flex items-center justify-center">
            <EcoCollectLogo className="w-full h-full text-white" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight font-heading">EcoBot AI</span>
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            </div>
            <div className="text-[10px] text-emerald-100 flex items-center gap-1">
              <Bot size={10} />
              <span>Multi-turn Gemini Chat</span>
            </div>
          </div>
        </button>
      </div>
    );
  }

  const activeRoleInfo = ROLE_DEFINITIONS[selectedRole];
  const activeModelInfo =
    MODEL_OPTIONS.find((m) => m.id === selectedModel) || MODEL_OPTIONS[0];

  return (
    <div
      className={
        standalone
          ? 'w-full h-full min-h-[600px] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden'
          : `fixed z-50 transition-all duration-200 ${
              isExpanded
                ? 'inset-2 sm:inset-6 bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-300'
                : 'bottom-4 sm:bottom-6 right-2 sm:right-6 w-[calc(100vw-1rem)] sm:w-[470px] h-[610px] max-h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden'
            }`
      }
    >
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-700/80 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 p-1 flex items-center justify-center shadow-inner">
            <EcoCollectLogo className="w-full h-full text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight font-heading">
                EcoBot Gemini Chat
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Sparkles size={9} />
                <span>Multi-turn</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-300 flex items-center gap-1.5">
              <span>{activeRoleInfo.icon}</span>
              <span className="font-medium">{activeRoleInfo.name}</span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-300 text-[10px] font-mono">
                {selectedModel}
              </span>
            </p>
          </div>
        </div>

        {/* Header Action Icons */}
        <div className="flex items-center gap-1 text-slate-300">
          {/* TTS Audio toggle */}
          <button
            onClick={() => {
              if (isSpeaking) stopSpeaking();
              setSoundEnabled(!soundEnabled);
            }}
            className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${
              soundEnabled ? 'text-emerald-400' : 'text-slate-400'
            }`}
            title={soundEnabled ? 'Mute voice audio' : 'Enable voice audio'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Clear Thread / New Chat */}
          <button
            onClick={handleResetChat}
            className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
            title="Start new chat thread"
          >
            <Trash2 size={15} />
          </button>

          {/* Maximize / Minimize (only if floating) */}
          {!standalone && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="hidden sm:inline-flex p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
              title={isExpanded ? 'Restore compact' : 'Expand window'}
            >
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          )}

          {/* Close button */}
          {!standalone && (
            <button
              onClick={() => {
                stopSpeaking();
                setIsOpen(false);
                if (onClose) onClose();
              }}
              className="p-1.5 rounded-lg hover:bg-rose-500/20 hover:text-rose-300 transition-colors ml-1"
              title="Close assistant"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Gemini Controls Sub-Bar: Model Selector & Role Switcher */}
      <div ref={dropdownRef} className="bg-slate-100 border-b border-slate-200 px-3 py-1.5 flex items-center justify-between gap-2 text-xs relative shrink-0">
        {/* Model Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowModelDropdown(!showModelDropdown);
              setShowRoleDropdown(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold shadow-2xs text-[11px] transition-colors"
          >
            <activeModelInfo.icon size={12} className="text-emerald-600" />
            <span className="font-mono">{selectedModel}</span>
            <ChevronDown size={11} className="text-slate-400" />
          </button>

          {showModelDropdown && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-1 space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Select Gemini Model
              </div>
              {MODEL_OPTIONS.map((m) => {
                const isSelected = selectedModel === m.id;
                const IconComponent = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedModel(m.id);
                      setShowModelDropdown(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg flex items-start gap-2 transition-colors ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <IconComponent
                      size={14}
                      className={isSelected ? 'text-emerald-600 mt-0.5' : 'text-slate-400 mt-0.5'}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs">{m.label}</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-sans">
                          {m.tag}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-normal leading-tight mt-0.5">
                        {m.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Role Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowRoleDropdown(!showRoleDropdown);
              setShowModelDropdown(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold shadow-2xs text-[11px] transition-colors"
          >
            <span>{activeRoleInfo.icon}</span>
            <span>Role: {activeRoleInfo.name}</span>
            <ChevronDown size={11} className="text-slate-400" />
          </button>

          {showRoleDropdown && (
            <div className="absolute top-full right-0 mt-1 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-1 space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                System Instruction Persona
              </div>
              {(Object.keys(ROLE_DEFINITIONS) as ChatbotRole[]).map((rKey) => {
                const rInfo = ROLE_DEFINITIONS[rKey];
                const isSelected = selectedRole === rKey;
                return (
                  <button
                    key={rKey}
                    onClick={() => handleRoleChange(rKey)}
                    className={`w-full text-left p-2 rounded-lg flex items-start gap-2 transition-colors ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-base">{rInfo.icon}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">{rInfo.name}</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-sans">
                          {rInfo.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-normal leading-tight mt-0.5">
                        {rKey === 'civic_waste_expert' && 'Official 4-color municipal segregation rules'}
                        {rKey === 'zero_waste_coach' && 'Zero-landfill habits, reusables & upcycling'}
                        {rKey === 'compost_specialist' && '2:1 brown-green ratio, soil nutrition & care'}
                        {rKey === 'circularity_auditor' && 'Resin codes, industrial LCA & CO₂ metrics'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Messages Scroll Area - Single Thread */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/80">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[92%] sm:max-w-[85%] ${
                isUser ? 'ml-auto' : 'mr-auto'
              }`}
            >
              {/* Message Bubble */}
              <div
                className={`group relative p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-xs'
                    : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs'
                }`}
              >
                {/* Formatted Text Content */}
                <div className="space-y-1 font-sans">
                  {renderFormattedContent(msg.text)}
                </div>

                {/* Waste Scan Result Card with Scores if an item was queried */}
                {msg.scanResult && (
                  <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-3">
                    {/* Waste Classification Header */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                            Identified Material
                          </span>
                          <h4 className="font-extrabold text-slate-900 text-sm">
                            {msg.scanResult.itemName}
                          </h4>
                          <span className="text-[11px] text-slate-600">
                            {msg.scanResult.itemType || msg.scanResult.materialType}
                          </span>
                        </div>
                        {/* Biodegradability Badge */}
                        <div
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 ${
                            msg.scanResult.isBiodegradable
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {msg.scanResult.isBiodegradable ? (
                            <>
                              <Leaf size={12} />
                              <span>Biodegradable</span>
                            </>
                          ) : (
                            <>
                              <ShieldAlert size={12} />
                              <span>Non-Biodegradable</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Material and Designated Bin */}
                      <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2 text-[11px]">
                        <span className="text-slate-500 truncate max-w-[170px]">
                          Material: <b>{msg.scanResult.materialType}</b>
                        </span>
                        <span
                          className="px-2 py-0.5 rounded font-extrabold text-white text-[10px] shrink-0"
                          style={{ backgroundColor: msg.scanResult.binColorHex || '#16A34A' }}
                        >
                          {msg.scanResult.binColorName.split(' ')[0]} Bin
                        </span>
                      </div>
                    </div>

                    {/* Official SCORES Breakdown Grid */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1">
                          <Award size={13} className="text-emerald-600" />
                          <span>Official Waste Scores</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          Confidence: {Math.round((msg.scanResult.confidenceScore || 0.98) * 100)}%
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {/* Score 1: Recyclability */}
                        <div className="bg-emerald-50/70 border border-emerald-200/80 p-2 rounded-xl">
                          <div className="flex items-center justify-between text-[10px] text-emerald-800 font-bold mb-0.5">
                            <span className="flex items-center gap-1">
                              <Recycle size={11} /> Recyclability
                            </span>
                            <span className="font-extrabold font-heading text-xs">
                              {msg.scanResult.recyclabilityPercentage || 95}/100
                            </span>
                          </div>
                          <div className="w-full bg-emerald-200/80 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(
                                  100,
                                  msg.scanResult.recyclabilityPercentage || 95
                                )}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Score 2: Eco Points & UPI Cash */}
                        <div className="bg-amber-50/70 border border-amber-200/80 p-2 rounded-xl">
                          <div className="flex items-center justify-between text-[10px] text-amber-900 font-bold mb-0.5">
                            <span className="flex items-center gap-1">
                              <Coins size={11} className="text-amber-600" /> Civic Reward
                            </span>
                            <span className="font-extrabold font-heading text-xs">
                              +{msg.scanResult.estimatedPoints || 50} pts
                            </span>
                          </div>
                          <div className="w-full bg-amber-200/80 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-amber-500 h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(
                                  100,
                                  ((msg.scanResult.estimatedPoints || 50) / 100) * 100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Score 3: Purity */}
                        <div className="bg-blue-50/70 border border-blue-200/80 p-2 rounded-xl">
                          <div className="flex items-center justify-between text-[10px] text-blue-900 font-bold mb-0.5">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 size={11} className="text-blue-600" /> Purity Score
                            </span>
                            <span className="font-extrabold font-heading text-xs">
                              {msg.scanResult.purityScore || 94}%
                            </span>
                          </div>
                          <div className="w-full bg-blue-200/80 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(100, msg.scanResult.purityScore || 94)}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Score 4: Carbon Savings */}
                        <div className="bg-teal-50/70 border border-teal-200/80 p-2 rounded-xl">
                          <div className="flex items-center justify-between text-[10px] text-teal-900 font-bold mb-0.5">
                            <span className="flex items-center gap-1">
                              <Flame size={11} className="text-teal-600" /> CO₂ Avoided
                            </span>
                            <span className="font-extrabold font-heading text-xs">
                              {msg.scanResult.co2SavedKg || 1.25} kg
                            </span>
                          </div>
                          <div className="w-full bg-teal-200/80 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-teal-600 h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(
                                  100,
                                  ((msg.scanResult.co2SavedKg || 1.25) / 2.5) * 100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* How It Can Be Recycled */}
                    {msg.scanResult.howItCanBeRecycled && (
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-700 leading-relaxed">
                        <span className="font-bold text-slate-900 block mb-1 flex items-center gap-1">
                          <Recycle size={12} className="text-emerald-600" />
                          How to Recycle / Dispose:
                        </span>
                        <p>{msg.scanResult.howItCanBeRecycled}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        onClick={() => handleLogDisposalFromChat(msg.scanResult!)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <span>Claim +{msg.scanResult.estimatedPoints || 50} pts in Wallet</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick Message Actions (Copy & Read Aloud) */}
                {!isUser && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[10px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="hover:text-slate-700 flex items-center gap-1 transition-colors"
                        title="Copy response"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check size={11} className="text-emerald-600" />
                            <span className="text-emerald-600 font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          if (isSpeaking) {
                            stopSpeaking();
                          } else {
                            speakText(msg.text);
                          }
                        }}
                        className="hover:text-slate-700 flex items-center gap-1 transition-colors"
                        title="Read aloud"
                      >
                        <Volume2 size={11} className={isSpeaking ? 'text-emerald-600' : ''} />
                        <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                      </button>
                    </div>

                    {msg.modelUsed && (
                      <span className="font-mono text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {msg.modelUsed}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Timestamp & Sender indicator */}
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1 px-1">
                <span>{isUser ? 'You' : 'EcoBot AI'}</span>
                <span>•</span>
                <span>
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Suggested Follow-up Prompts */}
              {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && !isUser && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {msg.suggestedPrompts.map((prompt, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => handleSend(prompt)}
                      className="text-[11px] font-semibold bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs transition-all flex items-center gap-1 active:scale-95 text-left"
                    >
                      <HelpCircle size={10} className="text-emerald-500 shrink-0" />
                      <span>{prompt}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-3 rounded-2xl border border-slate-200 w-fit shadow-xs">
            <RefreshCw size={14} className="animate-spin text-emerald-600" />
            <span className="font-medium animate-pulse">
              EcoBot ({selectedModel}) is reasoning...
            </span>
          </div>
        )}
      </div>

      {/* Input Bar & Multi-turn Controls */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          {/* Text Input */}
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Ask ${activeRoleInfo.name} or follow up on previous answers...`}
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
            disabled={isLoading}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Send question in conversation"
          >
            <Send size={16} />
          </button>
        </form>

        {/* Quick Help Footer Note */}
        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 px-1">
          <span className="flex items-center gap-1 truncate max-w-[240px]">
            <Sparkles size={10} className="text-emerald-500" />
            <span>Multi-turn memory: answers remember conversation context</span>
          </span>
          <button
            type="button"
            onClick={() => {
              if (onClose) onClose();
              setIsOpen(false);
              setCurrentRoute('scanner');
            }}
            className="text-emerald-600 hover:underline flex items-center gap-1 font-semibold shrink-0"
          >
            <span>Camera Scanner</span>
            <ExternalLink size={10} />
          </button>
        </div>
      </div>
    </div>
  );
};
