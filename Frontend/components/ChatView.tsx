import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
// FIX: Added apiFetch prop type, removed unused Message type.
import type { User, ChatSession, Message } from '../types';
// FIX: Removed imports from blank local files. AI logic is now on the backend.
import { SendIcon, UserIcon, LogoIcon, SpinnerIcon, TrashIcon, MicrophoneIcon, ThumbsUpIcon, ThumbsDownIcon, PlusIcon, PencilIcon, StarIcon } from './Icons';
import ConfirmationDialog from './ConfirmationDialog';
import EmergencyBanner from './EmergencyBanner';
import FeedbackForm from './FeedbackForm';
// FIX: The LiveSession type is not exported from @google/genai. It has been removed.
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from "@google/genai";

// Component to render markdown-formatted text safely
const MarkdownFormatter: React.FC<{ text: string }> = ({ text }) => {
    const createMarkup = (markdown: string) => {
        let html = markdown;

        // 1. Isolate and escape multi-line code blocks
        const codeBlocks: string[] = [];
        html = html.replace(/```(?:\w*\n)?([\s\S]*?)```/g, (match, code) => {
            const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            codeBlocks.push(`<pre class="bg-gray-800 dark:bg-gray-900 text-white dark:text-gray-200 p-3 rounded-md my-2 overflow-x-auto text-sm font-mono">${escapedCode.trim()}</pre>`);
            return `%%CODE_BLOCK_PLACEHOLDER_${codeBlocks.length - 1}%%`;
        });

        // 2. Process the rest of the text line by line
        const lines = html.split('\n');
        const newHtmlLines: string[] = [];
        let inList = false;
        let listType: 'ul' | 'ol' | null = null;

        const applyInlineFormatting = (line: string) => {
            // Escape HTML characters to prevent XSS
            let safeLine = line.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            // Apply inline markdown
            safeLine = safeLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            safeLine = safeLine.replace(/_(.*?)_/g, '<em>$1</em>');
            safeLine = safeLine.replace(/`([^`]+)`/g, '<code class="bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded-md font-mono text-sm">$1</code>');
            return safeLine;
        };

        for (const line of lines) {
            const ulMatch = line.match(/^(\s*[\-\*])\s+(.*)/);
            const olMatch = line.match(/^(\s*\d+\.)\s+(.*)/);

            if (ulMatch) {
                if (listType !== 'ul') {
                    if (inList) newHtmlLines.push(`</${listType}>`);
                    newHtmlLines.push('<ul class="list-disc list-inside my-2 space-y-1">');
                    listType = 'ul';
                    inList = true;
                }
                newHtmlLines.push(`<li>${applyInlineFormatting(ulMatch[2])}</li>`);
            } else if (olMatch) {
                if (listType !== 'ol') {
                    if (inList) newHtmlLines.push(`</${listType}>`);
                    newHtmlLines.push('<ol class="list-decimal list-inside my-2 space-y-1">');
                    listType = 'ol';
                    inList = true;
                }
                newHtmlLines.push(`<li>${applyInlineFormatting(olMatch[2])}</li>`);
            } else {
                if (inList) {
                    newHtmlLines.push(`</${listType}>`);
                    inList = false;
                    listType = null;
                }
                if (line.trim() !== '' && !line.includes('%%CODE_BLOCK_PLACEHOLDER_')) {
                    newHtmlLines.push(`<p>${applyInlineFormatting(line)}</p>`);
                } else {
                    newHtmlLines.push(line); // Keep placeholders and empty lines
                }
            }
        }

        if (inList) {
            newHtmlLines.push(`</${listType}>`);
        }

        html = newHtmlLines.join('');

        // 3. Re-insert code blocks
        html = html.replace(/%%CODE_BLOCK_PLACEHOLDER_(\d+)%%/g, (match, index) => {
            return codeBlocks[parseInt(index, 10)];
        });

        // Clean up empty paragraphs
        html = html.replace(/<p>\s*<\/p>/g, '');

        return html;
    };

    return <div className="text-sm leading-relaxed space-y-2" dangerouslySetInnerHTML={{ __html: createMarkup(text) }} />;
}

const StreamingMarkdown: React.FC<{ text: string; shouldStream: boolean; onDone: () => void }> = ({ text, shouldStream, onDone }) => {
    const [visibleText, setVisibleText] = useState(shouldStream ? '' : text);

    useEffect(() => {
        if (!shouldStream) {
            setVisibleText(text);
            return;
        }

        setVisibleText('');
        let index = 0;
        const timer = window.setInterval(() => {
            index += Math.max(1, Math.ceil(text.length / 90));
            if (index >= text.length) {
                setVisibleText(text);
                window.clearInterval(timer);
                onDone();
                return;
            }
            setVisibleText(text.slice(0, index));
        }, 18);

        return () => window.clearInterval(timer);
    }, [onDone, shouldStream, text]);

    return <MarkdownFormatter text={visibleText} />;
};


interface ChatViewProps {
  currentUser: User;
  // FIX: Added props to manage state from App.tsx instead of useLocalStorage
  chatSessions: ChatSession[];
  setChatSessions: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  apiFetch: (url: string, options?: RequestInit) => Promise<any>;
}

const suggestionPrompts = [
    {
        title: "Help me practice gratitude",
        prompt: "Can you give me a journaling prompt about gratitude?",
    },
    {
        title: "I'm feeling anxious",
        prompt: "I'm feeling anxious right now, can you suggest a quick breathing exercise?",
    },
    {
        title: "Explain a CBT concept",
        prompt: "Explain what a 'cognitive distortion' is in simple terms.",
    },
    {
        title: "Help me reframe a thought",
        prompt: "I keep thinking 'I'm not good enough'. Can you help me challenge this thought?",
    }
];

const followUpChips = [
    { label: 'Tell me more', prompt: 'Can you tell me more about that?' },
    { label: 'Help me relax', prompt: 'Can you guide me through something calming?' },
    { label: 'I feel anxious', prompt: "I'm feeling anxious. Can you help me slow down?" },
    { label: 'Breathing exercise', prompt: 'Can we do a quick breathing exercise together?' },
];

// Audio helper functions
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const ChatView: React.FC<ChatViewProps> = ({ currentUser, chatSessions, setChatSessions, apiFetch }) => {
  // FIX: Removed useLocalStorage, state is now managed by props.
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // FIX: Replaced non-exported LiveSession type with `any` to resolve the type error.
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const currentInputTranscriptionRef = useRef('');
  const recordingTimerRef = useRef<number | null>(null);
  
  const sortedSessions = useMemo(() => {
    // The backend already sorts by updated_at, but we can re-sort just in case.
    return [...chatSessions].sort((a, b) => new Date(b.updated_at || b.createdAt).getTime() - new Date(a.updated_at || a.createdAt).getTime());
  }, [chatSessions]);

  const activeSession = useMemo(() => {
    return chatSessions.find(s => s.id === activeSessionId) || null;
  }, [chatSessions, activeSessionId]);

  const messages = useMemo(() => activeSession?.messages || [], [activeSession]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Logic to detect crisis keywords
  const checkForCrisis = useCallback((text: string) => {
      const crisisKeywords = /\b(suicide|die|kill myself|harm myself|end my life|cut myself|self-harm|end it all|commit suicide|taking my life)\b/gi;
      if (crisisKeywords.test(text)) {
          setShowEmergency(true);
      }
  }, []);

  useEffect(() => {
    scrollToBottom();
    // Scan new messages for crisis keywords
    if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        checkForCrisis(lastMessage.text);
    }
  }, [messages, checkForCrisis]);

  useEffect(() => {
      if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
  }, [input]);

  const handleNewChat = () => {
      setActiveSessionId(null);
      setShowEmergency(false);
  };
  
  const handleSend = useCallback(async (messageText: string, source: 'text' | 'voice' = 'text') => {
    if (messageText.trim() === '' || isLoading) return;

    // Immediate check on user input
    checkForCrisis(messageText);

    const tempUserMessage: Message = {
        id: Date.now().toString(),
        text: messageText,
        sender: 'user',
        source,
        isNew: true,
    };

    setInput('');
    setError(null);
    setIsLoading(true);
    
    const isNewChat = !activeSessionId;

    try {
        if (isNewChat) {
            // Optimistically add user message to a temporary session for UI responsiveness
            const tempSession: ChatSession = { id: 'temp', title: 'New Conversation...', messages: [tempUserMessage], createdAt: new Date().toISOString() };
            setChatSessions(prev => [tempSession, ...prev]);
            setActiveSessionId('temp');

            const newSession = await apiFetch('/chat/sessions', {
                method: 'POST',
                body: JSON.stringify({ text: messageText, source }),
            });
            // Replace temporary session with real one from backend
            setChatSessions(prev => [newSession, ...prev.filter(s => s.id !== 'temp')]);
            setActiveSessionId(newSession.id);
            
            // Check AI response for keywords (happens via the messages useEffect as well, but being explicit)
            if (newSession.messages && newSession.messages.length > 1) {
                checkForCrisis(newSession.messages[1].text);
            }
        } else {
            // Optimistically add user message
            setChatSessions(prev => prev.map(s => 
                s.id === activeSessionId 
                    ? { ...s, messages: [...s.messages, tempUserMessage] } 
                    : s
            ));
            
            const { userMessage, aiMessage } = await apiFetch(`/chat/sessions/${activeSessionId}/messages`, {
                method: 'POST',
                body: JSON.stringify({ text: messageText, source }),
            });

            // Replace temp user message and add AI message
            setChatSessions(prev => prev.map(s => {
                if (s.id === activeSessionId) {
                    const newMessages = s.messages.filter(m => m.id !== tempUserMessage.id);
                    return { ...s, messages: [...newMessages, userMessage, aiMessage] };
                }
                return s;
            }));

            // Check AI message
            checkForCrisis(aiMessage.text);
        }

    } catch (error) {
        console.error("Failed to get AI response:", error);
        setError("I'm sorry, I'm having a little trouble connecting right now. Please try again in a moment.");
    } finally {
        setIsLoading(false);
    }
}, [isLoading, activeSessionId, apiFetch, setChatSessions, checkForCrisis]);
  
  const handleDeleteChat = (id: string) => {
    setSessionToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleClearConfirm = async () => {
    if (!sessionToDelete) return;
    try {
        await apiFetch(`/chat/sessions/${sessionToDelete}`, { method: 'DELETE' });
        setChatSessions(prev => prev.filter(s => s.id !== sessionToDelete));
        if (activeSessionId === sessionToDelete) {
            const nextSession = sortedSessions.find(s => s.id !== sessionToDelete);
            setActiveSessionId(nextSession?.id || null);
            setShowEmergency(false);
        }
    } catch (error) {
        console.error("Failed to delete chat:", error);
        setError("Could not delete the chat session. Please try again.");
    } finally {
        setIsConfirmOpen(false);
        setSessionToDelete(null);
    }
  };

  const handleFeedback = async (messageId: string, feedback: 'like' | 'dislike') => {
    if (!activeSessionId) return;
    const currentFeedback = activeSession?.messages.find(m => m.id === messageId)?.feedback;
    const newFeedback = currentFeedback === feedback ? undefined : feedback;

    try {
        // FIX: The API endpoint for message feedback was missing the "/chat" prefix.
        await apiFetch(`/chat/messages/${messageId}/feedback`, {
            method: 'PUT',
            body: JSON.stringify({ feedback: newFeedback }),
        });
        setChatSessions(prev => prev.map(s => {
            if (s.id === activeSessionId) {
                return { ...s, messages: s.messages.map(msg => msg.id === messageId ? { ...msg, feedback: newFeedback } : msg) };
            }
            return s;
        }));
    } catch (error) {
        console.error("Failed to update feedback:", error);
        setError("Could not save feedback. Please try again.");
    }
  };

  const handleAnimationEnd = (messageId: string) => {
    if (!activeSessionId) return;
    setChatSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
            return {
                ...s,
                messages: s.messages.map(msg => msg.id === messageId ? { ...msg, isNew: false } : msg)
            };
        }
        return s;
    }));
  };
  
  const handleRename = async (id: string, title: string) => {
    const originalTitle = chatSessions.find(s => s.id === id)?.title;
    if (title.trim() === '' || title.trim() === originalTitle) {
        setEditingSessionId(null);
        return;
    }
    try {
        await apiFetch(`/chat/sessions/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ title: title.trim() }),
        });
        setChatSessions(prev => prev.map(s => s.id === id ? { ...s, title: title.trim() } : s));
    } catch (error) {
        console.error("Failed to rename session:", error);
        setError("Could not rename the session. Please try again.");
    } finally {
        setEditingSessionId(null);
        setEditingTitle('');
    }
  };
  
  useEffect(() => {
    if (editingSessionId && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [editingSessionId]);


  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const stopVoicemailSession = useCallback(async () => {
    if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
    }
    setRecordingTime(0);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
    }
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        await inputAudioContextRef.current.close();
        inputAudioContextRef.current = null;
    }
    if (sessionPromiseRef.current) {
        const session = await sessionPromiseRef.current;
        session.close();
        sessionPromiseRef.current = null;
    }

    setIsRecording(false);
    setIsConnecting(false);
    currentInputTranscriptionRef.current = '';
  }, []);

  const startVoicemailSession = useCallback(async () => {
      setError(null);
      setIsConnecting(true);
      try {
          streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

          // FIX: Per coding guidelines, use `process.env.API_KEY` directly and assume it is configured.
          // The previous implementation used `import.meta.env`, which is specific to Vite and caused a type error.
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          
          sessionPromiseRef.current = ai.live.connect({
              model: 'gemini-2.5-flash-native-audio-preview-09-2025',
              callbacks: {
                  onopen: () => {
                      setIsConnecting(false);
                      setIsRecording(true);

                      setRecordingTime(0);
                      recordingTimerRef.current = window.setInterval(() => {
                          setRecordingTime(prev => prev + 1);
                      }, 1000);

                      inputAudioContextRef.current = new (window.AudioContext)({ sampleRate: 16000 });
                      mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(streamRef.current!);
                      scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                      
                      scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                          const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                          const pcmBlob = createBlob(inputData);
                          sessionPromiseRef.current?.then((session) => {
                              session.sendRealtimeInput({ media: pcmBlob });
                          });
                      };
                      mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                      scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
                  },
                  onmessage: async (message: LiveServerMessage) => {
                      if (message.serverContent?.inputTranscription) {
                          const text = message.serverContent.inputTranscription.text;
                          if (text) {
                              currentInputTranscriptionRef.current += text;
                              checkForCrisis(text);
                          }
                      }
                  },
                  onerror: (e: ErrorEvent) => {
                      console.error("Live session error:", e);
                      setError("Sorry, there was an issue with the voice connection. Please try again.");
                      stopVoicemailSession();
                  },
                  onclose: (e: CloseEvent) => {
                      stopVoicemailSession();
                  },
              },
              config: {
                  responseModalities: [Modality.AUDIO],
                  inputAudioTranscription: {},
              }
          });
      } catch (err) {
          console.error("Failed to start voicemail session:", err);
          setError("Could not access the microphone. Please check your browser permissions.");
          setIsConnecting(false);
      }
  }, [stopVoicemailSession, checkForCrisis]);

  const handleStartRecording = useCallback(() => {
    if (!isRecording && !isConnecting) {
        startVoicemailSession();
    }
  }, [isRecording, isConnecting, startVoicemailSession]);

  const handleSendVoicemail = useCallback(async () => {
    const finalTranscription = currentInputTranscriptionRef.current.trim();
    await stopVoicemailSession();
    if (finalTranscription) {
        handleSend(finalTranscription, 'voice');
    }
  }, [stopVoicemailSession, handleSend]);

  const handleCancelVoicemail = useCallback(async () => {
    await stopVoicemailSession();
  }, [stopVoicemailSession]);


  useEffect(() => {
      return () => {
          stopVoicemailSession();
      };
  }, [stopVoicemailSession]);

  return (
    <div className="flex h-full bg-gray-100 dark:bg-gray-900 overflow-hidden">
        {/* Chat History Sidebar */}
        <aside className="w-80 flex flex-col bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <button 
                    onClick={handleNewChat}
                    className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:border-solid transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <PlusIcon /> New Chat
                </button>
            </div>
            <div className="flex-1 overflow-y-auto">
                <nav className="p-2 space-y-1">
                    {sortedSessions.map(session => (
                        <div key={session.id} className={`group relative flex items-center rounded-lg ${activeSessionId === session.id ? 'bg-blue-100 dark:bg-blue-900/50' : ''}`}>
                             <button
                                onClick={() => setActiveSessionId(session.id)}
                                className={`flex-1 text-left p-3 pr-16 truncate text-sm font-medium ${activeSessionId === session.id ? 'text-blue-800 dark:text-blue-100' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                            >
                                {editingSessionId === session.id ? (
                                    <input
                                        ref={titleInputRef}
                                        type="text"
                                        name="session-title"
                                        value={editingTitle}
                                        onChange={(e) => setEditingTitle(e.target.value)}
                                        onBlur={() => handleRename(session.id, editingTitle)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleRename(session.id, editingTitle); }}
                                        className="w-full bg-transparent border-b border-blue-500 focus:outline-none"
                                    />
                                ) : (
                                    session.title
                                )}
                            </button>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => { setEditingSessionId(session.id); setEditingTitle(session.title); }}
                                    className="p-1.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                                    aria-label="Rename chat"
                                >
                                    <PencilIcon />
                                </button>
                                <button
                                    onClick={() => handleDeleteChat(session.id)}
                                    className="p-1.5 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                                    aria-label="Delete chat"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    ))}
                </nav>
            </div>
        </aside>

      <div className="flex flex-col h-full flex-1">
        {showEmergency && <EmergencyBanner />}
        
        {messages.length === 0 && !isRecording && !isConnecting && !isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <LogoIcon className="h-16 w-16" />
                <h1 className="text-3xl font-bold mt-4 text-gray-800 dark:text-white">I&apos;m here whenever you need someone to talk to.</h1>
                <p className="mt-2 max-w-md text-gray-500 dark:text-gray-400">Start with whatever feels present. You do not need to organize it perfectly.</p>
                <button 
                    onClick={() => setShowFeedbackForm(true)}
                    className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors text-sm font-medium border border-yellow-200 dark:border-yellow-800"
                >
                    <StarIcon className="h-4 w-4" /> Rate AI Experience
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 w-full max-w-lg">
                    {suggestionPrompts.map((item) => (
                        <button
                            key={item.title}
                            onClick={() => handleSend(item.prompt, 'text')}
                            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <p className="font-semibold text-gray-700 dark:text-gray-200">{item.title}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.prompt}</p>
                        </button>
                    ))}
                </div>
            </div>
        ) : (
            <div role="log" aria-live="polite" className="flex-1 overflow-y-auto px-4 space-y-6 pt-6 pb-20">
                {messages.map((msg, index) => {
                    const animationClass = msg.isNew 
                        ? (msg.sender === 'user' ? 'animate-message-in-right' : 'animate-message-in-left')
                        : '';
                    const isLatestAiMessage = msg.sender === 'ai' && index === messages.length - 1;
                    return (
                        <div 
                            key={msg.id} 
                            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''} ${animationClass}`}
                            onAnimationEnd={() => {
                                if (msg.sender === 'user') {
                                    handleAnimationEnd(msg.id);
                                }
                            }}
                        >
                            {msg.sender === 'ai' && (
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0" aria-hidden="true">
                                <LogoIcon className="h-5 w-5" />
                            </div>
                            )}
                            <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-xl p-3 rounded-xl shadow-sm ${
                                msg.sender === 'user'
                                    ? 'bg-blue-500 text-white rounded-br-none'
                                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                                }`}>
                                {msg.source === 'voice' && (
                                    <div className="flex items-center gap-2 mb-1 text-xs text-blue-200 dark:text-blue-300">
                                    <MicrophoneIcon className="w-3 h-3" />
                                    <span>From your voicemail</span>
                                    </div>
                                )}
                                {msg.sender === 'ai' ? (
                                    <StreamingMarkdown text={msg.text} shouldStream={!!msg.isNew} onDone={() => handleAnimationEnd(msg.id)} />
                                ) : (
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                )}
                                </div>
                                {msg.sender === 'ai' && (
                                    <>
                                        <div className="mt-2 flex items-center gap-2">
                                            <button
                                                onClick={() => handleFeedback(msg.id, 'like')}
                                                className={`p-1 rounded-full transition-all duration-200 ease-in-out ${msg.feedback === 'like' ? 'text-blue-500 bg-blue-100 dark:bg-blue-900/50 transform scale-125' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                                                aria-label="Like response"
                                                aria-pressed={msg.feedback === 'like'}
                                            >
                                                <ThumbsUpIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleFeedback(msg.id, 'dislike')}
                                                className={`p-1 rounded-full transition-all duration-200 ease-in-out ${msg.feedback === 'dislike' ? 'text-red-500 bg-red-100 dark:bg-red-900/50 transform scale-125' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                                                aria-label="Dislike response"
                                                aria-pressed={msg.feedback === 'dislike'}
                                            >
                                                <ThumbsDownIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                        {isLatestAiMessage && !isLoading && (
                                            <div className="mt-3 flex max-w-xl flex-wrap gap-2">
                                                {followUpChips.map(chip => (
                                                    <button
                                                        key={chip.label}
                                                        onClick={() => handleSend(chip.prompt, 'text')}
                                                        className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-300 dark:hover:bg-teal-950/50"
                                                    >
                                                        {chip.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            {msg.sender === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 flex-shrink-0" aria-hidden="true">
                                <UserIcon />
                            </div>
                            )}
                        </div>
                    );
                })}
                {isLoading && (
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0" aria-hidden="true">
                    <LogoIcon className="h-5 w-5" />
                    </div>
                    <div className="typing-indicator max-w-md p-3 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-sm">
                    <span className="sr-only" role="status">CalmConnect is typing...</span>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-300">Thinking...</span>
                        <span className="flex items-center space-x-1">
                            <span className="typing-dot h-2 w-2 bg-gray-400 rounded-full"></span>
                            <span className="typing-dot h-2 w-2 bg-gray-400 rounded-full"></span>
                            <span className="typing-dot h-2 w-2 bg-gray-400 rounded-full"></span>
                        </span>
                    </div>
                    </div>
                </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        )}

        <div className="mt-auto px-4 pb-4">
            {error && <p role="alert" className="text-red-500 text-sm text-center mb-2">{error}</p>}
            
            {isConnecting || isRecording ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex items-center p-3 gap-3">
                    <button
                        onClick={handleCancelVoicemail}
                        className="p-3 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-red-500 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800"
                        aria-label="Cancel recording"
                    >
                        <TrashIcon />
                    </button>
                    <div className="flex-1 text-center text-sm text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2">
                        {isConnecting ? (
                            <>
                                <SpinnerIcon className="h-4 w-4" /> Connecting...
                            </>
                        ) : (
                            <>
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                <span>Recording... {formatTime(recordingTime)}</span>
                            </>
                        )}
                    </div>
                    <button
                        onClick={handleSendVoicemail}
                        disabled={isLoading || isConnecting}
                        className="p-3 rounded-lg text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                        aria-label="Send voicemail"
                    >
                        <SendIcon />
                    </button>
                </div>
            ) : (
                <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex items-center">
                    <label htmlFor="chat-input" className="sr-only">Type your message here...</label>
                    <textarea
                        ref={textareaRef}
                        id="chat-input"
                        name="chat-input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend(input, 'text');
                        }
                        }}
                        placeholder="Type your message here..."
                        className="w-full p-4 pr-24 bg-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-48"
                        rows={1}
                        disabled={isLoading}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                            onClick={handleStartRecording}
                            disabled={isLoading}
                            className="p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                            aria-label="Start recording"
                        >
                            <MicrophoneIcon />
                        </button>
                        <button
                            onClick={() => handleSend(input, 'text')}
                            disabled={isLoading || input.trim() === ''}
                            className="p-3 rounded-lg text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                            aria-label="Send message"
                        >
                            <SendIcon />
                        </button>
                    </div>
                </div>
            )}
        </div>
        <ConfirmationDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleClearConfirm}
                title="Delete Chat"
            >
                Are you sure you want to permanently delete this chat session? This action cannot be undone.
        </ConfirmationDialog>

        {showFeedbackForm && (
            <FeedbackForm
                type="ai_support"
                title="Rate your AI experience"
                onClose={() => setShowFeedbackForm(false)}
                apiFetch={apiFetch}
                onSubmit={() => {
                    // Success
                }}
            />
        )}
      </div>
    </div>
  );
};

export default ChatView;
