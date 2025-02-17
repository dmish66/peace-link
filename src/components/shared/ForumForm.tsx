import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createForum } from "@/lib/appwrite/api";
import { useUserContext } from "@/context/AuthContext";

const ForumForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState("");
  const { user } = useUserContext();
  const navigate = useNavigate();

  const handleCreateForum = async () => {
    if (!title || !description || !theme) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      await createForum(title, description, theme, user.id);
      navigate("/forums");
    } catch (error) {
      console.error("Error creating forum:", error);
      alert("Failed to create forum. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Create a New Forum
      </h1>
      <div className="max-w-2xl mx-auto space-y-6">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-4 bg-gray-800 rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-4 bg-gray-800 rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
          rows={5}
        />
        <div className="flex flex-col gap-2">
          <label className="text-gray-400 font-medium">Select Theme:</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full p-4 bg-gray-800 rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
          >
            <option value="" disabled>
              Choose a theme
            </option>
            <option value="Refugee crises">Refugee crises</option>
            <option value="Cultural conflicts">Cultural conflicts</option>
            <option value="Social problems">Social problems</option>
            <option value="International relations">International relations</option>
          </select>
        </div>
        <button
          onClick={handleCreateForum}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          Create Forum
        </button>
      </div>
    </div>
  );
};

export default ForumForm;