
import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { User, DirectMessage, Conversation } from '../types';
import { SendIcon, CheckIcon, DoubleCheckIcon, TrashIcon, PencilIcon, SaveIcon, ArrowLeftIcon } from './Icons';
import ConfirmationDialog from './ConfirmationDialog';
import UserProfileModal from './UserProfileModal';

interface MessagingViewProps {
    currentUser: User;
    users: User[];
    conversations: Conversation[];
    setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
    apiFetch: (url: string, options?: RequestInit) => Promise<any>;
}

const MessageStatus: React.FC<{ status: DirectMessage['status'] }> = ({ status }) => {
    if (!status) return null;

    const neutralColor = "text-gray-500 dark:text-gray-400";
    const readColor = "text-sky-400"; // A bright, distinct blue for 'read' status

    if (status === 'sent') {
        return <CheckIcon className={`h-4 w-4 ${neutralColor}`} title="Sent" />;
    }
    if (status === 'delivered') {
        return <DoubleCheckIcon className={`h-4 w-4 ${neutralColor}`} title="Delivered" />;
    }
    if (status === 'read') {
        return <DoubleCheckIcon className={`h-4 w-4 ${readColor}`} title="Read" />;
    }
    return null;
};

const MessagingView: React.FC<MessagingViewProps> = ({ currentUser, users, conversations, setConversations, apiFetch }) => {
    const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [editingMessage, setEditingMessage] = useState<DirectMessage | null>(null);
    const [messageToDelete, setMessageToDelete] = useState<DirectMessage | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const contacts = useMemo(() => {
        let potentialContacts: User[] = [];

        if (currentUser.role === 'patient') {
            // Patients can message any professional.
            potentialContacts = users.filter(u => u.role !== 'patient');
        } else {
            // Professionals can message other professionals.
            const otherProfessionals = users.filter(u => u.role !== 'patient' && u.id !== currentUser.id);

            // And they can message patients they already have a conversation with.
            const existingPatientIds = new Set(
                conversations
                    .filter(c => c.participantIds.includes(currentUser.id))
                    .map(c => c.participantIds.find(id => id !== currentUser.id))
            );
            const existingPatients = users.filter(u => u.role === 'patient' && existingPatientIds.has(u.id));

            potentialContacts = [...otherProfessionals, ...existingPatients];
        }
        
        // Also include anyone from an existing conversation, just in case.
        const allParticipantIds = new Set(conversations.flatMap(c => c.participantIds));
        allParticipantIds.delete(currentUser.id);
        
        const allContactUsers = users.filter(u => allParticipantIds.has(u.id));

        // Combine and remove duplicates
        const combinedContacts = [...potentialContacts, ...allContactUsers];
        const uniqueContacts = Array.from(new Map(combinedContacts.map(item => [item.id, item])).values());
        
        // Sort contacts: show contacts with existing conversations first, then by username
        return uniqueContacts.sort((a, b) => {
            const aHasConvo = conversations.some(c => c.participantIds.includes(a.id));
            const bHasConvo = conversations.some(c => c.participantIds.includes(b.id));
            if (aHasConvo && !bHasConvo) return -1;
            if (!aHasConvo && bHasConvo) return 1;
            return a.username.localeCompare(b.username);
        });

    }, [currentUser, users, conversations]);
    
    const activeConversation = useMemo(() => {
        if (!selectedContactId) return null;
        return conversations.find(c => c.participantIds.includes(selectedContactId) && c.participantIds.includes(currentUser.id));
    }, [conversations, selectedContactId, currentUser.id]);

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeConversation?.messages]);

    // Effect to mark messages as read when a conversation is opened
    useEffect(() => {
        if (activeConversation) {
            const unreadMessages = activeConversation.messages.filter(
                msg => msg.senderId !== currentUser.id && msg.status !== 'read'
            );
            if (unreadMessages.length > 0) {
                apiFetch(`/conversations/${activeConversation.id}/read`, { method: 'PUT' })
                    .then(() => {
                        setConversations(prev => prev.map(convo => {
                            if (convo.id === activeConversation.id) {
                                return {
                                    ...convo,
                                    messages: convo.messages.map(msg => 
                                        msg.senderId !== currentUser.id ? { ...msg, status: 'read' } : msg
                                    )
                                };
                            }
                            return convo;
                        }));
                    })
                    .catch(console.error);
            }
        }
    }, [activeConversation, currentUser.id, apiFetch, setConversations]);

    const handleSendMessage = async () => {
        if (newMessage.trim() === '' || !selectedContactId) return;

        try {
            const { message, conversationId } = await apiFetch('/conversations/messages', {
                method: 'POST',
                body: JSON.stringify({
                    recipientId: selectedContactId,
                    text: newMessage.trim(),
                }),
            });

            setConversations(prev => {
                const existingConvo = prev.find(c => c.id === conversationId);
                if (existingConvo) {
                    return prev.map(c => c.id === conversationId ? { ...c, messages: [...c.messages, message] } : c);
                } else {
                    // New conversation
                    const newConvo: Conversation = {
                        id: conversationId,
                        participantIds: [currentUser.id, selectedContactId],
                        messages: [message],
                    };
                    return [...prev, newConvo];
                }
            });

            setNewMessage('');
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const handleUpdateMessage = async () => {
        if (!editingMessage || newMessage.trim() === '') return;

        try {
            const updatedMessage = await apiFetch(`/conversations/messages/${editingMessage.id}`, {
                method: 'PUT',
                body: JSON.stringify({ text: newMessage.trim() }),
            });

            setConversations(prev => prev.map(convo => {
                if (activeConversation && convo.id === activeConversation.id) {
                    return {
                        ...convo,
                        messages: convo.messages.map(m => m.id === editingMessage.id ? updatedMessage : m)
                    };
                }
                return convo;
            }));

            setEditingMessage(null);
            setNewMessage('');
        } catch (error) {
            console.error("Failed to update message:", error);
        }
    };

    const handleEditClick = (msg: DirectMessage) => {
        setEditingMessage(msg);
        setNewMessage(msg.text);
    };

    const handleCancelEdit = () => {
        setEditingMessage(null);
        setNewMessage('');
    };

    const handleDeleteMessage = async () => {
        if (!messageToDelete) return;
        try {
            await apiFetch(`/conversations/messages/${messageToDelete.id}`, {
                method: 'DELETE',
            });
            setConversations(prev => prev.map(convo => {
                if (activeConversation && convo.id === activeConversation.id) {
                    return {
                        ...convo,
                        messages: convo.messages.filter(m => m.id !== messageToDelete.id)
                    };
                }
                return convo;
            }));
            setMessageToDelete(null);
        } catch (error) {
            console.error("Failed to delete message:", error);
        }
    };
    
    const getContactInfo = (contactId: string) => {
        const conversation = conversations.find(c => c.participantIds.includes(contactId) && c.participantIds.includes(currentUser.id));
        const lastMessage = conversation?.messages[conversation.messages.length - 1];
        const unreadCount = conversation?.messages.filter(
            msg => msg.senderId === contactId && msg.status !== 'read'
        ).length || 0;

        return { lastMessage, unreadCount };
    };

    const selectedContact = users.find(u => u.id === selectedContactId);
    
    // Auto-select the first contact if none is selected
    useEffect(() => {
        if (!selectedContactId && contacts.length > 0) {
            setSelectedContactId(contacts[0].id);
        }
    }, [contacts, selectedContactId]);

    return (
        <div className="flex h-full bg-gray-100 dark:bg-gray-900">
            <aside className="w-96 flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold">Direct Messages</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <nav className="p-2 space-y-1">
                        {contacts.map(contact => {
                            const { lastMessage, unreadCount } = getContactInfo(contact.id);
                            return (
                                <button
                                    key={contact.id}
                                    onClick={() => setSelectedContactId(contact.id)}
                                    className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${selectedContactId === contact.id ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300 flex-shrink-0">
                                        {contact.username.charAt(0)}
                                    </div>
                                    <div className="ml-3 flex-1 min-w-0">
                                        <p className={`font-semibold truncate ${selectedContactId === contact.id ? 'text-blue-800 dark:text-blue-200' : 'text-gray-800 dark:text-white'}`}>
                                            {contact.username}
                                        </p>
                                        {lastMessage && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                {lastMessage.senderId === currentUser.id && 'You: '}{lastMessage.text}
                                            </p>
                                        )}
                                    </div>
                                    {unreadCount > 0 && (
                                        <span className="ml-2 bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </aside>
            <main className="flex-1 flex flex-col">
                {selectedContact ? (
                    <>
                        <header className="flex items-center p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <button 
                                onClick={() => setIsProfileModalOpen(true)}
                                className="text-lg font-bold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none"
                            >
                                {selectedContact.username}
                            </button>
                        </header>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {activeConversation?.messages.map(msg => (
                                <div key={msg.id} className={`flex items-end gap-2 group ${msg.senderId === currentUser.id ? 'justify-end' : ''}`}>
                                    <div className={`flex flex-col space-y-1 max-w-lg ${msg.senderId === currentUser.id ? 'items-end' : ''}`}>
                                        <div className="flex items-center gap-2">
                                            {msg.senderId === currentUser.id && (
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                    {msg.status !== 'read' && (
                                                        <button 
                                                            onClick={() => handleEditClick(msg)}
                                                            className="p-1 text-gray-400 hover:text-blue-500 transition-all rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                                                            title="Edit message"
                                                        >
                                                            <PencilIcon />
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => setMessageToDelete(msg)}
                                                        className="p-1 text-gray-400 hover:text-red-500 transition-all rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                                                        title="Delete message"
                                                    >
                                                        <TrashIcon />
                                                    </button>
                                                </div>
                                            )}
                                            <div className={`px-4 py-2 rounded-xl ${
                                                msg.senderId === currentUser.id
                                                ? 'bg-blue-500 text-white rounded-br-none'
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                                            }`}>
                                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-400">
                                            <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            {msg.senderId === currentUser.id && <MessageStatus status={msg.status} />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                             <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                            {editingMessage && (
                                <div className="flex items-center justify-between mb-2 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-t-lg border-b border-blue-100 dark:border-blue-900/30">
                                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                                        <PencilIcon className="h-3 w-3" />
                                        <span>Editing message</span>
                                    </div>
                                    <button 
                                        onClick={handleCancelEdit}
                                        className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                            <div className="relative">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    onKeyDown={e => { 
                                        if (e.key === 'Enter') {
                                            editingMessage ? handleUpdateMessage() : handleSendMessage();
                                        }
                                        if (e.key === 'Escape' && editingMessage) {
                                            handleCancelEdit();
                                        }
                                    }}
                                    placeholder={editingMessage ? "Edit message..." : "Type a message..."}
                                    className={`w-full p-3 pr-12 bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${editingMessage ? 'rounded-b-lg' : 'rounded-lg'}`}
                                />
                                <button
                                    onClick={editingMessage ? handleUpdateMessage : handleSendMessage}
                                    disabled={!newMessage.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                    aria-label={editingMessage ? "Save changes" : "Send message"}
                                >
                                    {editingMessage ? <SaveIcon /> : <SendIcon />}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <p>{contacts.length > 0 ? 'Select a contact to start messaging.' : 'You have no contacts to message yet.'}</p>
                    </div>
                )}
            </main>

            <UserProfileModal 
                user={isProfileModalOpen ? (selectedContact || null) : null}
                onClose={() => setIsProfileModalOpen(false)}
            />

            <ConfirmationDialog
                isOpen={!!messageToDelete}
                onClose={() => setMessageToDelete(null)}
                onConfirm={handleDeleteMessage}
                title="Delete Message"
                confirmText="Delete"
            >
                Are you sure you want to delete this message? This action cannot be undone.
            </ConfirmationDialog>
        </div>
    );
};

export default MessagingView;
