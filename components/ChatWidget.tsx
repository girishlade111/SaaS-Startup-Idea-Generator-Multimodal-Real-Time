
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { v4 as uuidv4 } from 'uuid';
import type { ChatMessage } from '../types';
import { MessageCircleIcon, XIcon, SendIcon, BotIcon } from './IconComponents';

interface ChatWidgetProps {
    initialMessage: string | null;
    onInitialMessageSent: () => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ initialMessage, onInitialMessageSent }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    
    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY }), []);
    const chatRef = useRef<Chat | null>(null);

    // Gets or creates a chat session. Can be forced to create a new one.
    const getChat = (forceNew: boolean = false): Chat => {
        if (forceNew || !chatRef.current) {
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: 'You are a friendly and encouraging AI mentor for SaaS startup founders. Keep your answers concise, helpful, and focused on entrepreneurship, technology, and business strategy. Start the conversation with a welcoming message.',
                },
            });
        }
        return chatRef.current;
    };

    // Effect to handle starting a conversation from an Idea Card
    useEffect(() => {
        if (initialMessage) {
            setIsOpen(true);
            
            const currentChat = getChat(true); // Force a new chat session for a clean context
            const userMessage: ChatMessage = { id: uuidv4(), role: 'user', parts: initialMessage };
            const modelMessageId = uuidv4();
            
            setMessages([userMessage, { id: modelMessageId, role: 'model', parts: '' }]);
            setInput('');
            setIsLoading(true);

            const send = async () => {
                try {
                    const stream = await currentChat.sendMessageStream({ message: initialMessage });
                    for await (const chunk of stream) {
                        setMessages(prev => prev.map(msg =>
                            msg.id === modelMessageId ? { ...msg, parts: msg.parts + chunk.text } : msg
                        ));
                    }
                } catch (error) {
                    console.error("Chat error from initial message:", error);
                     setMessages(prev => prev.map(msg =>
                        msg.id === modelMessageId ? { ...msg, parts: "Sorry, I ran into an issue. Please try again." } : msg
                    ));
                } finally {
                    setIsLoading(false);
                    onInitialMessageSent();
                }
            };
            send();
        }
    }, [initialMessage]);


    // Effect for the initial greeting when opened manually
    useEffect(() => {
        if (isOpen && messages.length === 0 && !isLoading) {
            setIsLoading(true);
            const currentChat = getChat();
            currentChat.sendMessage({ message: "Hello" }).then(response => {
                setMessages([{ id: uuidv4(), role: 'model', parts: response.text }]);
            }).catch(err => {
                 console.error("Failed to start chat:", err);
            }).finally(() => {
                setIsLoading(false);
            });
        }
    }, [isOpen, messages.length, isLoading]);

    useEffect(() => {
        // Scroll to the bottom of the chat container when new messages are added
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const currentChat = getChat();
        const userMessage: ChatMessage = { id: uuidv4(), role: 'user', parts: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const modelMessageId = uuidv4();
        setMessages(prev => [...prev, { id: modelMessageId, role: 'model', parts: '' }]);

        try {
            const stream = await currentChat.sendMessageStream({ message: input });

            for await (const chunk of stream) {
                setMessages(prev => prev.map(msg => 
                    msg.id === modelMessageId 
                    ? { ...msg, parts: msg.parts + chunk.text }
                    : msg
                ));
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => prev.map(msg => 
                msg.id === modelMessageId 
                ? { ...msg, parts: "Sorry, I encountered an error. Please try again." }
                : msg
            ));
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <>
            <div className={`fixed bottom-0 right-0 m-6 transition-all duration-300 ${isOpen ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}>
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-brand text-white rounded-full p-4 shadow-lg hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-brand"
                    aria-label="Open AI Mentor chat"
                >
                    <MessageCircleIcon className="w-8 h-8" />
                </button>
            </div>

            <div className={`fixed bottom-0 right-0 sm:m-6 bg-neutral-900/80 backdrop-blur-lg border border-neutral-700/60 rounded-xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'w-full h-full sm:w-96 sm:h-[600px] opacity-100' : 'w-0 h-0 opacity-0'}`} style={{ transformOrigin: 'bottom right' }}>
                {isOpen && (
                    <div className="flex flex-col h-full animate-[fadeIn_0.3s_ease-out]">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-neutral-700/60 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <BotIcon className="w-6 h-6 text-brand-light" />
                                <h3 className="text-lg font-bold text-neutral-100">AI Mentor</h3>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-neutral-100 transition-colors" aria-label="Close chat">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto space-y-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] px-4 py-2 rounded-xl ${msg.role === 'user' ? 'bg-brand text-white' : 'bg-neutral-800 text-neutral-200'}`}>
                                        <p className="text-sm whitespace-pre-wrap">{msg.parts || '...'}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && messages[messages.length - 1]?.role !== 'model' && (
                                <div className="flex justify-start">
                                    <div className="bg-neutral-800 px-4 py-2 rounded-xl">
                                        <div className="flex items-center space-x-1">
                                            <div className="w-2 h-2 bg-neutral-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                            <div className="w-2 h-2 bg-neutral-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                            <div className="w-2 h-2 bg-neutral-500 rounded-full animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-neutral-700/60 flex-shrink-0">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask your mentor..."
                                    disabled={isLoading}
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all disabled:opacity-50"
                                    aria-label="Chat input"
                                />
                                <button type="submit" disabled={isLoading || !input.trim()} className="p-3 bg-brand text-white rounded-lg disabled:opacity-50 transition-opacity" aria-label="Send message">
                                    <SendIcon className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};
