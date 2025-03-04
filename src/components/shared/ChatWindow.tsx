import { useEffect, useState } from "react";
import { getMessages, sendMessage } from "@/lib/appwrite/api";
import { Models } from "appwrite";
import { IMessage, IChatWindow } from "@/types";
import { useUserContext } from "@/context/AuthContext";
import ChatHeader from "./ChatHeader";
import { translateText } from "@/lib/translate";
import { client, appwriteConfig } from "@/lib/appwrite/config";

const ChatWindow: React.FC<IChatWindow> = ({ conversationId, profileImage, username }) => {
  const { user } = useUserContext();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [translatedMessages, setTranslatedMessages] = useState<IMessage[] | null>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const tempId = Date.now().toString(); // Temporary ID for optimistic update
    setMessages((prev) => [
      ...prev,
      {
        $id: tempId,
        text: newMessage,
        createdAt: new Date().toISOString(),
        senderId: user.id,
      },
    ]);
    setNewMessage("");
    
    try {
      await sendMessage(conversationId, user.id, newMessage);
    } catch (error) {
      // Remove optimistic update if send fails
      setMessages(prev => prev.filter(msg => msg.$id !== tempId));
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      const data: Models.Document[] = await getMessages(conversationId);
      const mapped: IMessage[] = data.map((doc) => ({
        $id: doc.$id,
        text: doc.text,
        createdAt: doc.createdAt,
        senderId: doc.senderId,
      }));
      setMessages(mapped);
    };

    fetchMessages();
  }, [conversationId]);


  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = client.subscribe(
      `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.text_messagesCollectionId}.documents`,
      (response) => {
        // Handle new message creation events
        if (response.events.includes(`databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.text_messagesCollectionId}.documents.*.create`)) {
          const newMessage = response.payload as Models.Document;
          
          // Check if the message belongs to the current conversation
          if (newMessage.conversationId === conversationId) {
            // Check if message already exists in state
            const messageExists = messages.some(msg => msg.$id === newMessage.$id);
            
            if (!messageExists) {
              setMessages(prev => [
                ...prev,
                {
                  $id: newMessage.$id,
                  text: newMessage.text,
                  createdAt: newMessage.createdAt,
                  senderId: newMessage.senderId,
                }
              ]);
            }
          }
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [conversationId, messages]);
  

  const handleTranslate = async () => {
    if (!user.nationality) return;
  
    const translated = await Promise.all(
      messages.map(async (message) => ({
        ...message,
        text: await translateText(message.text, user.nationality),
      }))
    );
    setTranslatedMessages(translated);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Chat Header */}
      <ChatHeader profileImage={profileImage} username={username} />

      {/* Translate Button */}
      <button
        onClick={handleTranslate}
        className="m-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
      >
        Translate Messages
      </button>

      {/* Messages Section */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {(translatedMessages || messages).map((message) => (
          <div
            key={message.$id}
            className={`flex ${message.senderId === user.id ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`p-4 rounded-xl shadow-md break-words max-w-xs ${
                message.senderId === user.id ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-100"
              }`}
            >
              <p className="text-base">{message.text}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(message.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input Field */}
      <form onSubmit={handleSendMessage} className="flex gap-4 p-4 border-t border-gray-700">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
