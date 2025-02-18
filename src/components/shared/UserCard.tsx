import { Models } from "appwrite";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserContext } from "@/context/AuthContext";
import { useGetCurrentUser } from "@/lib/react-query/queries";
import { followUser, unfollowUser } from "@/lib/appwrite/api";
import { Button } from "../ui/button";
import Loader from "../shared/Loader";

type UserCardProps = {
  user: Models.Document;
};

const UserCard = ({ user }: UserCardProps) => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useUserContext();
  const { data: loggedInUser } = useGetCurrentUser();

  const isFollowing = currentUser?.following?.includes(user.$id) ?? false;

  const followMutation = useMutation({
    mutationFn: () => {
      if (!loggedInUser?.$id) throw new Error("User not logged in");
      return followUser(loggedInUser.$id, user.$id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => {
      if (!loggedInUser?.$id) throw new Error("User not logged in");
      return unfollowUser(loggedInUser.$id, user.$id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });

  const handleFollowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!loggedInUser) return;
    isFollowing ? unfollowMutation.mutate() : followMutation.mutate();
  };

  return (
    <Link to={`/profile/${user.$id}`} className="user-card">
      <img
        src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
        alt="creator"
        className="rounded-full w-14 h-14"
      />

      <div className="flex-center flex-col gap-1">
        <p className="base-medium text-light-1 text-center line-clamp-1">
          {user.name}
        </p>
        <p className="small-regular text-light-3 text-center line-clamp-1">
          @{user.username}
        </p>
      </div>

      <Button 
        type="button" 
        size="sm" 
        className={`px-5 ${isFollowing ? 'bg-light-2 text-dark-1 hover:bg-light-3' : 'shad-button_primary'}`}
        onClick={handleFollowClick}
        disabled={followMutation.isPending || unfollowMutation.isPending}
      >
        {followMutation.isPending || unfollowMutation.isPending ? (
          <Loader />
        ) : isFollowing ? (
          "Unfollow"
        ) : (
          "Follow"
        )}
      </Button>
    </Link>
  );
};

export default UserCard;