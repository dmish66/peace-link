import { useEffect, useState, useRef } from "react"; // ✅ Import useRef
import { getMessages, sendMessage, getSingleMessage } from "@/lib/appwrite/api";
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
  
  const messagesEndRef = useRef<HTMLDivElement>(null); // ✅ Create ref for auto-scroll

  // ✅ Function to scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ✅ Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✅ Optimistic UI Update on Send
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const tempId = Date.now().toString(); // Temporary ID for optimistic update

    const tempMessage: IMessage = {
      $id: tempId,
      text: newMessage,
      createdAt: new Date().toISOString(),
      senderId: user.id,
      conversationId: conversationId,
    };

    setMessages((prev) => [...prev, tempMessage]); // ✅ Optimistic UI update
    setNewMessage(""); // Clear input
    scrollToBottom(); // ✅ Scroll after sending

    try {
      const sentMessage = await sendMessage(conversationId, user.id, newMessage);

      const newMessageFormatted: IMessage = {
        $id: sentMessage.$id,
        text: sentMessage.text,
        createdAt: sentMessage.createdAt || new Date().toISOString(),
        senderId: sentMessage.senderId,
        conversationId: sentMessage.conversationId,
      };

      setMessages((prev) =>
        prev.map((msg) => (msg.$id === tempId ? newMessageFormatted : msg))
      );
      scrollToBottom(); // ✅ Scroll when message is confirmed
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => prev.filter((msg) => msg.$id !== tempId));
    }
  };

  // ✅ Fetch Messages When Component Mounts
  useEffect(() => {
    const fetchMessages = async () => {
      const data: Models.Document[] = await getMessages(conversationId);
      const mappedMessages: IMessage[] = data.map((doc) => ({
        $id: doc.$id,
        text: doc.text,
        createdAt: doc.createdAt || new Date().toISOString(),
        senderId: doc.senderId,
        conversationId: doc.conversationId,
      }));
      setMessages(mappedMessages);
      scrollToBottom(); // ✅ Scroll after fetching messages
    };

    fetchMessages();
  }, [conversationId]);

  // ✅ Real-Time Subscription for New Messages
  useEffect(() => {
    const unsubscribe = client.subscribe(
      `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.text_messagesCollectionId}.documents`,
      async (response) => {
        if (
          response.events.includes(
            `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.text_messagesCollectionId}.documents.*.create`
          )
        ) {
          const payload = response.payload as Models.Document;

          if (payload.conversationId !== conversationId) return;

          if (payload.senderId === user.id) return; // ✅ Skip if message is from current user

          try {
            const fullMessage = await getSingleMessage(payload.$id);
            const formattedMessage: IMessage = {
              $id: fullMessage.$id,
              text: fullMessage.text,
              createdAt: fullMessage.createdAt || new Date().toISOString(),
              senderId: fullMessage.senderId,
              conversationId: fullMessage.conversationId,
            };

            setMessages((prevMessages) => {
              if (!prevMessages.some((msg) => msg.$id === formattedMessage.$id)) {
                return [...prevMessages, formattedMessage];
              }
              return prevMessages;
            });

            scrollToBottom(); // ✅ Scroll when a new message is received
          } catch (error) {
            console.error("Error fetching full message:", error);
          }
        }
      }
    );

    return () => unsubscribe();
  }, [conversationId, user.id]);

  // ✅ Translation Function
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
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Chat Header */}
      <ChatHeader profileImage={profileImage} username={username} />

      {/* Translate Button */}
      <button
        onClick={handleTranslate}
        className="mx-4 my-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
      >
        Translate Messages
      </button>

      {/* Messages Section */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-4 space-y-4">
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
        {/* ✅ Invisible div to ensure scrolling works */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <form onSubmit={handleSendMessage} className="flex gap-4 mt-auto p-4 border-t border-gray-700">
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