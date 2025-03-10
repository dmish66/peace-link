import { useNavigate } from "react-router-dom";
import ForumList from "@/components/shared/forums/ForumList";

const Forum = () => {
  const navigate = useNavigate();

  const handleCreateForum = () => {
    navigate("/create-forum");
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white mx-auto p-6 overflow-scroll custom-scrollbar">
      <div className="flex justify-between items-center mb-6 p-6">
        <h1 className="text-3xl font-bold">Forums</h1>
        <button
          onClick={handleCreateForum}
          className="px-5 py-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create Forum
        </button>
      </div>
      <ForumList />
    </div>
  );
};

export default Forum;
