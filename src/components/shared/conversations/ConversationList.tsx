import { useEffect, useState } from "react";
import { useUserContext } from "@/context/AuthContext";
import { createConversation, getUsers, getConversations } from "@/lib/appwrite/api";
import { IConversation, IConversationList, IUser } from "@/types";
import { Models } from "appwrite";

const ConversationList = ({ onSelectConversation }: IConversationList) => {
  const { user } = useUserContext();
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredUsers, setFilteredUsers] = useState<IUser[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);

  // Fetch all users (excluding the logged-in user)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await getUsers();
        if (!allUsers?.documents || allUsers.documents.length === 0) {
          console.warn("No users found or error fetching users.");
          return;
        }
        const mappedUsers: IUser[] = allUsers.documents
          .map((doc: Models.Document) => ({
            id: doc.$id,
            name: doc.name ?? "No name",
            username: doc.username ?? "No username",
            email: doc.email ?? "No email",
            imageUrl: doc.imageUrl ?? "",
            nationality: doc.nationality ?? "",
            followers: doc.followers ?? [],
            following: doc.following ?? [],
          }))
          .filter((userItem) => userItem.id !== user.id);
        setUsers(mappedUsers);
        setFilteredUsers(mappedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [user.id]);

  // Fetch existing conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getConversations(user.id);
        const mappedConversations: IConversation[] = data.documents.map((doc: any) => ({
          $id: doc.$id,
          participants: doc.participants,
          lastMessage: doc.lastMessage,
        }));
        setConversations(mappedConversations);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    fetchConversations();
  }, [user.id]);

  // Update filtered users based on the search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers([]);
    } else {
      const filtered = users.filter(
        (userItem) =>
          userItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          userItem.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const handleCreateConversation = async (otherUserId: string) => {
    if (!user || !otherUserId) return;
    try {
      const existingConversation = conversations.find(
        (convo) =>
          convo.participants.includes(otherUserId) &&
          convo.participants.includes(user.id)
      );
      if (existingConversation) {
        // Use onSelectConversation to update the parent's state
        onSelectConversation(existingConversation.$id);
        return;
      }
      const newConversationDocument = await createConversation([user.id, otherUserId]);
      const newConversation: IConversation = {
        $id: newConversationDocument.$id,
        participants: newConversationDocument.participants,
        lastMessage: newConversationDocument.lastMessage,
      };
      setConversations((prev) => [...prev, newConversation]);
      onSelectConversation(newConversation.$id);
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const getOtherParticipantUsername = (participants: string[]) => {
    const otherParticipantId = participants.find((id) => id !== user.id);
    const otherParticipant = users.find((userItem) => userItem.id === otherParticipantId);
    return otherParticipant ? otherParticipant.username : "Unknown";
  };

  return (
    <div className="flex flex-col h-full p-8 bg-gray-900 text-white">
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-4">Start a conversation</h3>
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className="w-full p-3 mb-4 bg-gray-800 text-white border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
        />
        {isSearchFocused && filteredUsers.length > 0 && (
          <ul className="space-y-2 bg-gray-800 p-4 rounded-xl shadow-lg">
            {filteredUsers.map((userItem) => (
              <li key={userItem.id}>
                {/* Using onMouseDown to ensure click registers before blur */}
                <button
                  type="button"
                  onMouseDown={() => handleCreateConversation(userItem.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-700 transition-colors"
                >
                  <span className="font-semibold">{userItem.name}</span>
                  <span className="text-gray-400 text-sm">({userItem.username})</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <h3 className="text-2xl font-bold mb-4">Your Conversations</h3>
        {conversations.length === 0 ? (
          <p className="text-gray-400">No conversations yet</p>
        ) : (
          <div className="space-y-4">
            {conversations.map((convo) => (
              <div
                key={convo.$id}
                onClick={() => onSelectConversation(convo.$id)}
                className="p-4 bg-gray-800 rounded-xl hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <p className="font-semibold text-lg">
                  {getOtherParticipantUsername(convo.participants)}
                </p>
                <p className="text-base text-gray-400 mt-1">
                  {convo.lastMessage || "No messages yet"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;