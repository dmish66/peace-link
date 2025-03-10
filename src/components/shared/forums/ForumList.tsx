import { useState, useEffect } from "react";
import { getForums } from "@/lib/appwrite/api";
import ForumItem from "@/components/shared/forums/ForumItem";

const ForumList = () => {
  const [forums, setForums] = useState<any[]>([]);
  const [filteredForums, setFilteredForums] = useState<any[]>([]);
  const [selectedTheme, setSelectedTheme] = useState("");

  useEffect(() => {
    const fetchForums = async () => {
      const data = await getForums();
      setForums(data.documents);
      setFilteredForums(data.documents);
    };
    fetchForums();
  }, []);

  useEffect(() => {
    if (selectedTheme) {
      setFilteredForums(forums.filter((forum) => forum.theme === selectedTheme));
    } else {
      setFilteredForums(forums);
    }
  }, [selectedTheme, forums]);

  return (
    <div className="min-h-screen bg-gray-900 text-white container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <label className="text-gray-400 font-medium">Filter by Theme:</label>
          <select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
            className="w-full p-3 bg-gray-800 rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all mt-2"
          >
            <option value="">All Themes</option>
            <option value="Refugee crises">Refugee crises</option>
            <option value="Cultural conflicts">Cultural conflicts</option>
            <option value="Social problems">Social problems</option>
            <option value="International relations">International relations</option>
          </select>
        </div>
        <div className="space-y-6">
          {filteredForums.map((forum) => (
            <ForumItem
              key={forum.$id}
              id={forum.$id}
              title={forum.title}
              description={forum.description}
              theme={forum.theme}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ForumList;