import { useState, useEffect } from "react";
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

  // Local state for instant UI update
  const [isFollowing, setIsFollowing] = useState(false);

  // Sync initial follow state when user data is available
  useEffect(() => {
    if (currentUser?.following?.includes(user.$id)) {
      setIsFollowing(true);
    }
  }, [currentUser, user.$id]);

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!loggedInUser?.$id) throw new Error("User not logged in");
      return followUser(loggedInUser.$id, user.$id);
    },
    onMutate: () => {
      setIsFollowing(true); // Optimistically update state
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: () => {
      setIsFollowing(false); // Revert on error
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      if (!loggedInUser?.$id) throw new Error("User not logged in");
      return unfollowUser(loggedInUser.$id, user.$id);
    },
    onMutate: () => {
      setIsFollowing(false); // Optimistically update state
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: () => {
      setIsFollowing(true); // Revert on error
    },
  });

  const handleFollowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!loggedInUser) return;

    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
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
