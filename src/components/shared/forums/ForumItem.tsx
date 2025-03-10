import { IForumItem } from "@/types";
import { useNavigate } from "react-router-dom";

const ForumItem = ({ id, title, description, theme }: IForumItem) => {
  const navigate = useNavigate();

  return (
    <div
      className="p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-500 hover:shadow-lg hover:scale-105 transition-all transform cursor-pointer"
      onClick={() => navigate(`/forum/${id}`)}
    >
      <h2 className="text-2xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        {title}
      </h2>
      <p className="text-gray-400 mb-4">{description}</p>
      <div className="flex justify-between items-center">
        <span className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300">
          {theme}
        </span>
      </div>
    </div>
  );
};

export default ForumItem;