import { useState, useEffect } from "react";
import { getForums, getMyForums } from "@/lib/appwrite/api";
import { useUserContext } from "@/context/AuthContext";
import ForumItem from "@/components/shared/forums/ForumItem";

const ForumList = () => {
  const [forums, setForums] = useState<any[]>([]);
  const [filteredForums, setFilteredForums] = useState<any[]>([]);
  const [selectedTheme, setSelectedTheme] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMyForums, setShowMyForums] = useState(false);
  const { user } = useUserContext();

  // Fetch all forums or only user-created forums
  useEffect(() => {
    const fetchForums = async () => {
      try {
        const data = showMyForums
          ? await getMyForums(user.id)
          : await getForums();

        setForums(data.documents);
        setFilteredForums(data.documents);
      } catch (error) {
        console.error("Error fetching forums:", error);
      }
    };

    fetchForums();
  }, [showMyForums, user?.id]);

  // Apply search & theme filters
  useEffect(() => {
    let filtered = forums;

    if (selectedTheme) {
      filtered = filtered.filter((forum) => forum.theme === selectedTheme);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((forum) =>
        forum.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredForums(filtered);
  }, [searchQuery, selectedTheme, forums]);

  return (
    <div className="min-h-screen bg-gray-900 text-white container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        {/* Tabs for All Forums & My Forums */}
        <div className="flex justify-center gap-6 mb-6">
          <button
            className={`px-4 py-2 rounded-full text-lg ${
              !showMyForums ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
            }`}
            onClick={() => setShowMyForums(false)}
          >
            All Forums
          </button>
          <button
            className={`px-4 py-2 rounded-full text-lg ${
              showMyForums ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
            }`}
            onClick={() => setShowMyForums(true)}
          >
            My Forums
          </button>
        </div>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search forums..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-800 rounded-xl border border-gray-700 focus:ring-2 focus:ring-blue-500 transition-all"
        />

        {/* Theme Filter */}
        <div className="mb-8">
          <label className="text-gray-400 font-medium">Filter by Theme:</label>
          <select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
            className="w-full p-3 bg-gray-800 rounded-xl border border-gray-700 focus:ring-2 focus:ring-blue-500 transition-all mt-2"
          >
            <option value="">All Themes</option>
            <option value="Refugee crises">Refugee crises</option>
            <option value="Cultural conflicts">Cultural conflicts</option>
            <option value="Social problems">Social problems</option>
            <option value="International relations">International relations</option>
          </select>
        </div>

        {/* Forums List */}
        <div className="space-y-6">
          {filteredForums.length > 0 ? (
            filteredForums.map((forum) => (
              <ForumItem
                key={forum.$id}
                id={forum.$id}
                title={forum.title}
                description={forum.description}
                theme={forum.theme}
                createdBy={forum.createdBy}
                showActions={showMyForums} // ✅ Pass showMyForums to show/hide buttons
              />
            ))
          ) : (
            <p className="text-gray-400 text-center">
              {showMyForums ? "You haven't created any forums yet." : "No forums found."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForumList;
