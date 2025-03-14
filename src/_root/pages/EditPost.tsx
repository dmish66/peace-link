import { useParams } from 'react-router-dom';
import Loader from '@/components/shared/utils/Loader';
import PostForm from '@/components/shared/posts/PostForm';
import { useGetPostById } from '@/lib/react-query/queries';

const EditPost = () => {
  const { id } = useParams();
  const { data: post, isLoading } = useGetPostById(id);

  // Show a loader while the post data is being fetched
  if (isLoading) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="flex-start gap-3 justify-start w-full max-w-5xl">
          <img
            src="/assets/icons/edit.svg"
            width={36}
            height={36}
            alt="edit"
            className="invert-white"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Edit Post</h2>
        </div>

        {/* Render the PostForm with the fetched post data */}
        <PostForm action="Update" post={post} />
      </div>
    </div>
  );
};

export default EditPost;