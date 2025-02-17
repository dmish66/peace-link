import { Models } from "appwrite";
import Loader from "@/components/shared/Loader";
import PostCard from "@/components/shared/PostCard";
import UserCard from "@/components/shared/UserCard";
import { useGetRecentPosts, useGetUsers } from "@/lib/react-query/queries";
import { useUserContext } from "@/context/AuthContext";

type HomeProps = {
  selectedCountry?: string; // Pass the selected country as a prop
};

const Home = ({ selectedCountry }: HomeProps) => {
  const { user: currentUser } = useUserContext();
  const {
    data: posts,
    isPending: isPostLoading,
    isError: isErrorPosts,
  } = useGetRecentPosts();
  const {
    data: creators,
    isPending: isUserLoading,
    isError: isErrorCreators,
  } = useGetUsers(10);

  const filteredCreators = creators?.documents.filter(
    (creator: Models.Document) => creator.$id !== currentUser.id
  );

  if (isErrorPosts || isErrorCreators) {
    return (
      <div className="flex flex-1">
        <div className="home-container">
          <p className="body-medium text-light-1">Something bad happened</p>
        </div>
        <div className="home-creators">
          <p className="body-medium text-light-1">Something bad happened</p>
        </div>
      </div>
    );
  }

  // Filter posts based on the selected country
  const filteredPosts = selectedCountry
    ? posts?.documents.filter((post: Models.Document) => post.location === selectedCountry)
    : posts?.documents;

  return (
    <div className="flex flex-1">
      <div className="home-container">
        <div className="home-posts">
          <h2 className="h3-bold md:h2-bold text-left w-full">Home Feed</h2>
          {isPostLoading && !posts ? (
            <Loader />
          ) : (
            <ul className="flex flex-col flex-1 gap-9 w-full ">
              {filteredPosts?.map((post: Models.Document) => (
                <li key={post.$id} className="flex justify-center w-full">
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="home-creators">
        <h3 className="h3-bold text-light-1">Recommended Users</h3>
        {isUserLoading && !creators ? (
          <Loader />
        ) : (
          <ul className="grid 2xl:grid-cols-2 gap-6">
            {filteredCreators?.map((creator) => (
              <li key={creator?.$id}>
                <UserCard user={creator} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Home;