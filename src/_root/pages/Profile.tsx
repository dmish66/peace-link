import {
  Route,
  Routes,
  Link,
  Outlet,
  useParams,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { Button } from "@/components/ui/button";
import { LikedPosts } from "@/_root/pages";
import { useUserContext } from "@/context/AuthContext";
import { useGetUserById, useGetCurrentUser } from "@/lib/react-query/queries";
import Loader from "@/components/shared/Loader";
import GridPostList from "@/components/shared/GridPostList";
import { createConversation } from "@/lib/appwrite/api";

interface StatBlockProps {
  value: string | number;
  label: string;
}

const StatBlock = ({ value, label }: StatBlockProps) => (
  <div className="flex-center gap-2">
    <p className="small-semibold lg:body-bold text-primary-500">{value}</p>
    <p className="small-medium lg:base-medium text-light-2">{label}</p>
  </div>
);

const SavedPosts = () => {
  const { data: currentUser } = useGetCurrentUser();

  if (!currentUser) return <Loader />;

  const savePosts =
    currentUser?.save?.length > 0
      ? [...currentUser.save]
          .map((savePost) => ({
            ...savePost.post,
            creator: {
              imageUrl: currentUser.imageUrl,
            },
          }))
          .reverse()
      : [];

  return (
    <div className="saved-container">
      {savePosts.length === 0 ? (
        <p className="text-light-4">No saved posts</p>
      ) : (
        <GridPostList posts={savePosts} showStats={false} />
      )}
    </div>
  );
};

const Profile = () => {
  const { id } = useParams();
  const { user } = useUserContext();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const { data: currentUser } = useGetUserById(id || "");

  if (!currentUser)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  // When Message is clicked, attempt to create (or retrieve) the conversation.
  // Then redirect to "/messages" with the conversationId (if available).
  const handleMessageClick = async () => {
    try {
      const conversationDoc = await createConversation([user.id, currentUser.$id]);
      navigate("/messages", { state: { conversationId: conversationDoc.$id } });
    } catch (error) {
      console.error("Error creating conversation (possibly already exists):", error);
      navigate("/messages");
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-inner_container">
        <div className="flex xl:flex-row flex-col max-xl:items-center flex-1 gap-7">
          <img
            src={currentUser.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt="profile"
            className="w-28 h-28 lg:h-36 lg:w-36 rounded-full"
          />
          <div className="flex flex-col flex-1 justify-between md:mt-2">
            <h1 className="text-center xl:text-left h3-bold md:h1-semibold w-full">
              {currentUser.name}
            </h1>
            <p className="small-regular md:body-medium text-light-3 text-center xl:text-left">
              @{currentUser.username}
            </p>

            <div className="flex gap-8 mt-10 items-center justify-center xl:justify-start flex-wrap z-20">
              <StatBlock value={currentUser.posts.length} label="Posts" />
              <StatBlock value={69} label="Followers" />
              <StatBlock value={20} label="Following" />
            </div>

            <p className="small-medium md:base-medium text-center xl:text-left mt-7 max-w-screen-sm">
              {currentUser.bio}
            </p>
          </div>

          <div className="flex justify-center gap-4">
            {user.id === currentUser.$id ? (
              <Link
                to={`/update-profile/${currentUser.$id}`}
                className="h-12 bg-dark-4 px-5 text-light-1 flex-center gap-2 rounded-lg"
              >
                <img src={"/assets/icons/edit.svg"} alt="edit" width={20} height={20} />
                <p className="flex whitespace-nowrap small-medium">Edit Profile</p>
              </Link>
            ) : (
              <>
                <Button type="button" className="shad-button_primary px-10">
                  Follow
                </Button>
                <Button
                  type="button"
                  className="shad-button_primary px-8"
                  onClick={handleMessageClick}
                >
                  Message
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {currentUser.$id === user.id && (
        <div className="flex max-w-5xl w-full">
          <Link
            to={`/profile/${id}`}
            className={`profile-tab rounded-l-lg ${pathname === `/profile/${id}` && "!bg-dark-3"}`}
          >
            <img src={"/assets/icons/posts.svg"} alt="posts" width={20} height={20} />
            Posts
          </Link>
          <Link
            to={`/profile/${id}/liked-posts`}
            className={`profile-tab ${pathname === `/profile/${id}/liked-posts` && "!bg-dark-3"}`}
          >
            <img src={"/assets/icons/like.svg"} alt="like" width={20} height={20} />
            Liked Posts
          </Link>
          <Link
            to={`/profile/${id}/saved-posts`}
            className={`profile-tab rounded-r-lg ${pathname === `/profile/${id}/saved-posts` && "!bg-dark-3"}`}
          >
            <img src={"/assets/icons/save.svg"} alt="save" width={20} height={20} />
            Saved Posts
          </Link>
        </div>
      )}

      <Routes>
        <Route index element={<GridPostList posts={currentUser.posts} showUser={false} />} />
        {currentUser.$id === user.id && (
          <>
            <Route path="/liked-posts" element={<LikedPosts />} />
            <Route path="/saved-posts" element={<SavedPosts />} />
          </>
        )}
      </Routes>
      <Outlet />
    </div>
  );
};

export default Profile;
