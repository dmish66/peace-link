import React, { useState, useEffect } from 'react';
import { sendMessage, getMessages, deleteMessage, getRecentConversations } from '@/lib/appwrite/api';
import Loader from '@/components/shared/Loader'; // Import Loader for consistent loading states

const TabMessages: React.FC = () => {
    const [conversations, setConversations] = useState<any[]>([]); // List of recent conversations
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null); // Selected user ID for conversation
    const [messages, setMessages] = useState<any[]>([]); // Messages in the selected conversation
    const [newMessage, setNewMessage] = useState<string>(''); // New message input
    const [isLoading, setIsLoading] = useState<boolean>(true); // Loading state

    const currentUserId = 'user1'; // Replace with the current user's ID (e.g., from authentication)

    // Fetch recent conversations when the component mounts
    useEffect(() => {
        fetchRecentConversations();
    }, []);

    // Fetch messages when a conversation is selected
    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(currentUserId, selectedConversation);
        }
    }, [selectedConversation]);

    // Fetch recent conversations
    const fetchRecentConversations = async () => {
        try {
            const data = await getRecentConversations(currentUserId);
            setConversations(data);
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            setIsLoading(false); // Stop loading
        }
    };

    // Fetch messages between two users
    const fetchMessages = async (senderId: string, receiverId: string) => {
        try {
            const data = await getMessages(senderId, receiverId);
            setMessages(data);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    // Send a new message
    const handleSendMessage = async () => {
        if (!selectedConversation || !newMessage.trim()) return;

        try {
            await sendMessage(currentUserId, selectedConversation, newMessage);
            setNewMessage(''); // Clear the input
            fetchMessages(currentUserId, selectedConversation); // Refresh messages
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    // Delete a message
    const handleDeleteMessage = async (messageId: string) => {
        try {
            await deleteMessage(messageId);
            fetchMessages(currentUserId, selectedConversation!); // Refresh messages
        } catch (error) {
            console.error('Failed to delete message:', error);
        }
    };

    return (
        <div className="flex flex-1 gap-6"> {/* Added 'gap-6' for spacing */}
            {/* Main chat area - Larger and on the left */}
            <div className="flex flex-col flex-[3] bg-dark-2 p-6 rounded-lg">
                <h3 className="h3-bold text-light-1">Messages</h3>
                <div className="flex flex-col flex-1 gap-4 overflow-y-auto">
                    {messages.map((message) => (
                        <div
                            key={message.$id}
                            className={`flex flex-col p-4 rounded-lg ${
                                message.senderId === currentUserId
                                    ? 'bg-primary-500 self-end'
                                    : 'bg-dark-4 self-start'
                            }`}
                        >
                            <p className="body-medium text-light-1">{message.text}</p>
                            <small className="small-regular text-light-3">
                                {new Date(message.timestamp).toLocaleTimeString()}
                            </small>
                            {message.senderId === currentUserId && (
                                <button
                                    onClick={() => handleDeleteMessage(message.$id)}
                                    className="small-regular text-red-500 cursor-pointer mt-2"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    ))}
                </div>
    
                {/* Input area for sending new messages */}
                <div className="flex gap-2 mt-4">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 p-2 rounded-lg bg-dark-3 text-light-1 border-none focus:outline-none"
                    />
                    <button
                        onClick={handleSendMessage}
                        className="p-2 rounded-lg bg-primary-500 text-light-1 cursor-pointer"
                    >
                        Send
                    </button>
                </div>
            </div>
    
            {/* Sidebar for recent conversations - Smaller and on the right */}
            <div className="flex flex-col flex-[1] bg-dark-3 p-4 rounded-lg">
                <h2 className="h3-bold md:h2-bold text-left w-full">Recent Conversations</h2>
                {isLoading ? (
                    <Loader /> // Show loader while loading
                ) : (
                    <ul className="flex flex-col flex-1 gap-3 w-full">
                        {conversations.map((conversation) => (
                            <li
                                key={conversation.$id}
                                className={`flex justify-between items-center p-4 rounded-lg cursor-pointer ${
                                    selectedConversation === conversation.receiverId
                                        ? 'bg-dark-4'
                                        : 'bg-dark-2'
                                }`}
                                onClick={() => setSelectedConversation(conversation.receiverId)}
                            >
                                <div>
                                    <p className="body-medium text-light-1">{conversation.receiverId}</p>
                                    <p className="small-regular text-light-3">{conversation.text}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
export default TabMessages;