import { useState, useEffect } from "react";
import { getForums } from "@/lib/appwrite/api";
import ForumItem from "./ForumItem";

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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Forums</h1>

      {/* Theme Filter */}
      <div className="mb-6">
        <label className="text-gray-300">Filter by Theme:</label>
        <select
          value={selectedTheme}
          onChange={(e) => setSelectedTheme(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded mt-2"
        >
          <option value="">All Themes</option>
          <option value="Refugee crises">Refugee crises</option>
          <option value="Cultural conflicts">Cultural conflicts</option>
          <option value="Social problems">Social problems</option>
          <option value="International relations">International relations</option>
        </select>
      </div>

      {/* List of Forums */}
      <div className="space-y-4">
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
  );
};

export default ForumList;