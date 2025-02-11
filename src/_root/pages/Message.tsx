import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ConversationList from "@/components/shared/ConversationList";
import ChatWindow from "@/components/shared/ChatWindow";
import { getConversationDetails } from "@/lib/appwrite/api"; // Updated API call
import { useUserContext } from "@/context/AuthContext";

const Message = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string>("");
  const [name, setName] = useState<string>("");
  const location = useLocation();
  const { user } = useUserContext();

  useEffect(() => {
    const fetchConversationDetails = async () => {
      if (selectedConversation) {
        try {
          const conversationDetails = await getConversationDetails(selectedConversation);
          
          if (conversationDetails && conversationDetails.participants) {
            const otherUser = conversationDetails.participants.find(
              (participant: any) => participant.$id !== user.id
            );

            if (otherUser) {
              setProfileImage(otherUser.imageUrl || "/assets/icons/profile-placeholder.svg");
              setName(otherUser.name || otherUser.username || "Unknown");
            }
          }
        } catch (error) {
          console.error("Error fetching conversation details:", error);
        }
      }
    };

    fetchConversationDetails();
  }, [selectedConversation, user.id]);

  // Pre-select conversation if passed via location
  useEffect(() => {
    if (location.state && (location.state as any).conversationId) {
      setSelectedConversation((location.state as any).conversationId);
    }
  }, [location.state]);

  return (
    <div className="flex h-screen w-full bg-gray-900">
      <div className="w-1/4 border-r border-gray-700 p-6">
        <ConversationList onSelectConversation={setSelectedConversation} />
      </div>
      <div className="w-3/4">
        {selectedConversation ? (
          <ChatWindow
            conversationId={selectedConversation}
            profileImage={profileImage}
            name={name}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-xl text-gray-400">Select a conversation to view messages.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;