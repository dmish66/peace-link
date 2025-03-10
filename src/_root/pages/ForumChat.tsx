import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getForumMessages, postMessage, getForumDetails } from "@/lib/appwrite/api";
import { useUserContext } from "@/context/AuthContext";
import { client, appwriteConfig } from "@/lib/appwrite/config";
import { Models } from "appwrite";

const ForumChat = () => {
  const { forumId } = useParams();
  const [forumDetails, setForumDetails] = useState<{ title: string; description: string } | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const { user } = useUserContext();

  useEffect(() => {
    const fetchForumDetails = async () => {
      if (forumId) {
        try {
          const data = await getForumDetails(forumId);
          setForumDetails({ title: data.title, description: data.description });
        } catch (error) {
          console.error("Error fetching forum details:", error);
        }
      }
    };

    const fetchMessages = async () => {
      if (forumId) {
        try {
          const data = await getForumMessages(forumId);
          setMessages(data.documents);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      }
    };

    fetchForumDetails();
    fetchMessages();
  }, [forumId]);

  useEffect(() => {
    if (!forumId) return;
   
    const unsubscribe = client.subscribe(
      `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.forums_messagesCollectionId}.documents`,
      async (response) => {
        if (
          response.events.includes(
            `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.forums_messagesCollectionId}.documents.*.create`
          )
        ) {
          const payload = response.payload as Models.Document;
          // Skip if the message is from the current user
          if (payload.senderId === user.id) return;
   
          const formattedMessage = {
            $id: payload.$id,
            text: payload.text,
            createdAt: payload.createdAt,
            senderId: payload.senderId,
            username: payload.username,
          };
          setMessages((prev) => {
            if (!prev.some((msg) => msg.$id === formattedMessage.$id)) {
              return [...prev, formattedMessage];
            }
            return prev;
          });
        }
      }
    );
    return () => unsubscribe();
  }, [forumId, user.id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !forumId) return;
   
    // Optimistic update
    const tempId = Date.now().toString();
    const tempMessage = {
      $id: tempId,
      text: newMessage,
      createdAt: new Date().toISOString(),
      senderId: user.id,
      username: user.username,
    };
    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");
   
    try {
      // Send message and get the created document
      const sentMessage = await postMessage(forumId, newMessage, user.id, user.username);
      // Replace optimistic message with actual data
      const newMessageFormatted = {
        $id: sentMessage.$id,
        text: sentMessage.text,
        createdAt: sentMessage.createdAt,
        senderId: sentMessage.senderId,
        username: sentMessage.username,
      };
      setMessages((prev) =>
        prev.map((msg) => (msg.$id === tempId ? newMessageFormatted : msg))
      );
    } catch (error) {
      console.error("Error posting message:", error);
      // Rollback optimistic update on error
      setMessages((prev) => prev.filter((msg) => msg.$id !== tempId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white w-full mx-auto p-6">
      {forumDetails ? (
        <>
          <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            {forumDetails.title}
          </h1>
          <p className="text-gray-400 mb-6">{forumDetails.description}</p>
        </>
      ) : (
        <p>Loading forum details...</p>
      )}

      <div className="space-y-4 max-w-4xl mx-auto">
        {messages.map((message) => (
          <div
            key={message.$id}
            className="p-4 bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-500 transition-all"
          >
            <p className="text-gray-300 mb-2">{message.text}</p>
            <span className="text-sm text-gray-500">
              Posted by {message.username} at{" "}
              {new Date(message.createdAt).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 max-w-4xl mx-auto">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="w-full p-4 bg-gray-800 rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
          placeholder="Type your message here..."
          rows={3}
        />
        <button
          onClick={handleSendMessage}
          className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ForumChat;