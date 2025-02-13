import { useNavigate } from "react-router-dom";

interface ForumItemProps {
  id: string;
  title: string;
  description: string;
  theme: string;
}

const ForumItem = ({ id, title, description, theme }: ForumItemProps) => {
  const navigate = useNavigate();

  return (
    <div
      className="p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700"
      onClick={() => navigate(`/forum/${id}`)}
    >
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-gray-400">{description}</p>
      <div className="mt-2">
        <span className="px-2 py-1 bg-gray-700 rounded text-sm">{theme}</span>
      </div>
    </div>
  );
};

export default ForumItem;