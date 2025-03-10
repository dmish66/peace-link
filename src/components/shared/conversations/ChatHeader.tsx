import React from "react";

export type IChatHeader = {
  profileImage: string;
  username: string;
};

const ChatHeader: React.FC<IChatHeader> = ({ profileImage, username }) => {
  return (
    <div className="p-4 bg-gray-800 text-white flex items-center gap-4">
      <img
        src={profileImage || "/assets/icons/profile-placeholder.svg"}
        alt={username}
        className="rounded-full w-10 h-10"
      />
      <div className="flex flex-col">
        <p className="text-lg font-semibold">{username}</p>
      </div>
    </div>
  );
};

export default ChatHeader;
