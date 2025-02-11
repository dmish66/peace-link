import { IChatHeader } from "@/types";
import React from "react";


const ChatHeader: React.FC<IChatHeader> = ({ profileImage, name }) => {
  return (
    <div className="p-4 bg-gray-800 text-white flex items-center gap-4">
      <img
        src={profileImage || "/assets/icons/profile-placeholder.svg"}
        alt={name}
        className="rounded-full w-10 h-10"
      />
      <div className="flex flex-col">
        <p className="text-lg font-semibold">{name}</p>
      </div>
    </div>
  );
};

export default ChatHeader;