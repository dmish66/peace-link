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
      navigate("/forums"); // Redirect to the forum list after creation
    } catch (error) {
      console.error("Error creating forum:", error);
      alert("Failed to create forum. Please try again.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create a New Forum</h1>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded"
        />
        <div className="flex flex-col gap-2">
          <label className="text-gray-300">Select Theme:</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded"
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
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Forum
        </button>
      </div>
    </div>
  );
};

export default ForumForm;