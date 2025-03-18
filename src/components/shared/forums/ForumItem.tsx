import { IForumItem } from "@/types";
import { useNavigate } from "react-router-dom";
import { deleteForum, updateForum } from "@/lib/appwrite/api";
import { useState } from "react";

const ForumItem = ({ id, title, description, showActions }: IForumItem & { showActions: boolean }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [newDescription, setNewDescription] = useState(description);

  // ✅ Handle Forum Update
  const handleUpdate = async () => {
    const updatedForum = await updateForum(id, newTitle, newDescription);
    if (updatedForum) {
      setIsEditing(false);
    }
  };

  // ✅ Handle Forum Deletion
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this forum?")) {
      const success = await deleteForum(id);
      if (success) {
        window.location.reload(); // ✅ Refresh forums after deletion
      }
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-500 hover:shadow-lg transition-all transform">
      {isEditing ? (
        <div>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full p-2 mb-2 bg-gray-700 text-white border border-gray-600 rounded-md"
          />
          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-md"
            rows={3}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div onClick={() => navigate(`/forum/${id}`)} className="cursor-pointer">
          <h2 className="text-2xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            {title}
          </h2>
          <p className="text-gray-400 mb-4">{description}</p>
        </div>
      )}

      {/* ✅ Show Edit/Delete buttons ONLY in "My Forums" tab */}
      {showActions && (
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={() => setIsEditing(!isEditing)} className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition">
            {isEditing ? "Cancel" : "Edit"}
          </button>
          <button onClick={handleDelete} className="px-4 py-2 bg-red text-white rounded-lg hover:bg-red-700 transition">
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default ForumItem;
