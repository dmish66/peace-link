import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import { useGetUserById } from "@/lib/react-query/queries";

const LikedPosts = ({ userId }: { userId: string }) => {
  const { data: user } = useGetUserById(userId); // Fetch liked posts for the profile being viewed

  if (!user)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  return (
    <>
      {user.liked.length === 0 ? (
        <p className="text-light-4">No liked posts</p>
      ) : (
        <GridPostList posts={user.liked} showStats={false} />
      )}
    </>
  );
};

export default LikedPosts;
