import { useNavigate } from "react-router-dom";
import ForumList from "@/components/shared/ForumList";

const Forum = () => {
  const navigate = useNavigate();

  const handleCreateForum = () => {
    navigate("/create-forum");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Forums</h1>
        <button
          onClick={handleCreateForum}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
        >
          Create Forum
        </button>
      </div>
      <ForumList />
    </div>
  );
};

export default Forum;
