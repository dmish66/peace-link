import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ConversationList from "@/components/shared/ConversationList";
import ChatWindow from "@/components/shared/ChatWindow";
import { getOtherUserDetails } from "@/lib/appwrite/api"; // Updated API call
import { useUserContext } from "@/context/AuthContext";

const Message = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string>("/assets/icons/profile-placeholder.svg");
  const [username, setUsername] = useState<string>("Unknown");
  const location = useLocation();
  const { user } = useUserContext();

  // Fetch the other user's details when a conversation is selected
  useEffect(() => {
    const fetchOtherUser = async () => {
      if (selectedConversation) {
        try {
          const details = await getOtherUserDetails(selectedConversation, user.id);
          setProfileImage(details.profileImage || "/assets/icons/profile-placeholder.svg");
          setUsername(details.username || "Unknown");
        } catch (error) {
          console.error("Error fetching other user details:", error);
          setProfileImage("/assets/icons/profile-placeholder.svg");
          setUsername("Unknown");
        }
      } else {
        setProfileImage("/assets/icons/profile-placeholder.svg");
        setUsername("Unknown");
      }
    };

    fetchOtherUser();
  }, [selectedConversation, user.id]);

  // Pre-select conversation if passed via location state.
  useEffect(() => {
    if (location.state && (location.state as any).conversationId) {
      setSelectedConversation((location.state as any).conversationId);
    }
  }, [location.state]);

  return (
    <div className="flex h-screen w-full bg-gray-900 overflow-scroll custom-scrollbar">
      <div className="w-1/4 border-r border-gray-700 p-6">
        <ConversationList onSelectConversation={setSelectedConversation} />
      </div>
      <div className="w-3/4">
        {selectedConversation ? (
          <ChatWindow
            conversationId={selectedConversation}
            profileImage={profileImage}
            username={username}
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
