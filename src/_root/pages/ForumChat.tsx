import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getForumMessages, postMessage, getForumDetails, getUserById } from "@/lib/appwrite/api";
import { useUserContext } from "@/context/AuthContext";
import { client, appwriteConfig } from "@/lib/appwrite/config";
import { Models } from "appwrite";

const ForumChat = () => {
  const { forumId } = useParams();
  const [forumDetails, setForumDetails] = useState<{ title: string; description: string } | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const { user } = useUserContext();
  const [userImages, setUserImages] = useState<{ [key: string]: string }>({}); // ✅ Cache user images

  useEffect(() => {
    if (!forumId) return;

    const fetchForumDetails = async () => {
      try {
        const data = await getForumDetails(forumId);
        setForumDetails({ title: data.title, description: data.description });
      } catch (error) {
        console.error("Error fetching forum details:", error);
      }
    };

    const fetchMessages = async () => {
      try {
        const data = await getForumMessages(forumId);
        console.log("Fetched messages:", data.documents); // 🔹 Debug log
        setMessages(data.documents);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchForumDetails();
    fetchMessages();
  }, [forumId]);

  useEffect(() => {
    if (!forumId) return;

    console.log("Subscribing to messages...");

    const unsubscribe = client.subscribe(
      `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.forums_messagesCollectionId}.documents`,
      async (response) => {
        console.log("Subscription event:", response);

        if (response.events.includes("databases.*.collections.*.documents.*.create")) {
          const payload = response.payload as Models.Document;

          if (!payload) return;

          const newMessage = {
            $id: payload.$id,
            text: payload.text,
            createdAt: payload.createdAt,
            senderId: payload.senderId,
            username: payload.username,
          };

          console.log("New message received:", newMessage);

          setMessages((prev) => {
            if (!prev.some((msg) => msg.$id === newMessage.$id)) {
              return [...prev, newMessage];
            }
            return prev;
          });
        }
      }
    );

    return () => unsubscribe();
  }, [forumId]);

  // ✅ Fetch user image when needed
  const fetchUserImage = async (userId: string) => {
    if (userImages[userId]) return; // Already cached

    try {
      const userData = await getUserById(userId);

      if (!userData) {
        console.warn(`User data not found for ID: ${userId}`);
        return;
      }

      setUserImages((prev) => ({
        ...prev,
        [userId]: userData.imageUrl || "/default-avatar.png",
      }));
    } catch (error) {
      console.error("Error fetching user image:", error);
    }
  };

  useEffect(() => {
    messages.forEach((msg) => fetchUserImage(msg.senderId));
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !forumId) return;

    const userImage = user.imageUrl || "/default-avatar.png"; // ✅ Ensure `imageUrl` is passed

    const tempId = Date.now().toString();
    const tempMessage = {
      $id: tempId,
      text: newMessage,
      createdAt: new Date().toISOString(),
      senderId: user.id,
      username: user.username,
      imageUrl: userImage, // ✅ Now includes `imageUrl`
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");

    try {
      const sentMessage = await postMessage(forumId, newMessage, user.id, user.username, userImage);
      console.log("Sent message:", sentMessage);
      setMessages((prev) =>
        prev.map((msg) => (msg.$id === tempId ? sentMessage : msg))
      );
    } catch (error) {
      console.error("Error posting message:", error);
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

      {/* Messages List */}
      <div className="space-y-4 max-w-4xl mx-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
        {messages.map((message) => {
          const isCurrentUser = message.senderId === user.id;
          return (
            <div key={message.$id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
              <div className={`flex items-start gap-2 ${isCurrentUser ? "flex-row-reverse" : ""}`}>
                <img
                  src={userImages[message.senderId] || "/default-avatar.png"}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
                />
                <div className={`p-4 rounded-xl ${isCurrentUser ? "bg-blue-600 ml-2" : "bg-gray-800 mr-2"}`}>
                  <p className="text-gray-300 mb-2">{message.text}</p>
                  <span className="text-sm text-gray-300">
                    {message.username} • {new Date(message.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Message Input */}
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
