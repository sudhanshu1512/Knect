import { setPosts, setSelectedPost } from "@/redux/postSlice";
import api from '../api/axios';
import { Bookmark, BookmarkCheck, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import CommentDialog from "./CommentDialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import moment from 'moment';

const Post = ({ post }) => {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
  const [postLike, setPostLike] = useState(post.likes.length);
  const [comment, setComment] = useState(post.comments);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      try {
        const { data } = await api.get(`/bookmark/check/${post._id}`);
        if (data.success) {
          setIsBookmarked(data.isBookmarked);
        }
      } catch (error) {
        console.error('Error checking bookmark status:', error);
      }
    };
    checkBookmarkStatus();
  }, [post._id]);

  useEffect(() => {
    // Check if the current user is following the post author
    const checkFollowStatus = async () => {
      try {
        const { data } = await api.get(`/user/${post.author._id}/profile`);
        setIsFollowing(data.user.followers.includes(user?._id));
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };

    // Check if the post is in favorites
    const checkFavoriteStatus = async () => {
      try {
        const { data } = await api.get(`/favorite/check/${post._id}`);
        setIsFavorited(data.isFavorited);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    if (post.author._id !== user?._id) {
      checkFollowStatus();
    }
    checkFavoriteStatus();
  }, [post.author._id, user?._id, post._id]);

  const handleFollowUnfollow = async () => {
    if (followLoading) return;
    try {
      setFollowLoading(true);
      const { data } = await api.post(`/user/followorunfollow/${post.author._id}`);
      setIsFollowing(!isFollowing);
      toast.success(data.message);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error updating follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (favoriteLoading) return;
    try {
      setFavoriteLoading(true);
      const { data } = await api.get(`/favorite/toggle/${post._id}`);
      if (data.success) {
        setIsFavorited(data.isFavorited);
        toast.success(data.isFavorited ? 'Added to favorites' : 'Removed from favorites');
      } else {
        toast.error(data.message || 'Failed to update favorites');
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
      toast.error(error?.response?.data?.message || 'Error updating favorites');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const bookmarkHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.get(`/bookmark/toggle/${post._id}`);
      if (data.success) {
        setIsBookmarked(data.isBookmarked);
        toast.success(data.isBookmarked ? 'Added to bookmarks' : 'Removed from bookmarks');
      } else {
        toast.error(data.message || 'Failed to update bookmark');
      }
    } catch (error) {
      console.error('Error updating bookmark:', error);
      toast.error(error?.response?.data?.message || 'Failed to update bookmark');
    }
  };

  const handleDelete = async () => {
    try {
      const { data } = await api.delete(`/post/delete/${post._id}`);
      if (data.success) {
        dispatch(setPosts(posts.filter(p => p._id !== post._id)));
        toast.success('Post deleted successfully');
      } else {
        toast.error(data.message || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete post');
    }
  };

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  };

  const likeOrDislikeHandler = async () => {
    try {
      const action = liked ? "dislike" : "like";
      const { data } = await api.get(`/post/${post._id}/${action}`);
      
      if (data.success) {
        const updatedLikes = liked ? postLike - 1 : postLike + 1;
        setPostLike(updatedLikes);
        setLiked(!liked);

        // Update posts in Redux store
        const updatedPosts = posts.map((p) =>
          p._id === post._id
            ? {
                ...p,
                likes: liked
                  ? p.likes.filter((id) => id !== user._id)
                  : [...p.likes, user._id],
              }
            : p
        );
        dispatch(setPosts(updatedPosts));
      }
    } catch (error) {
      console.error('Error updating like:', error);
      toast.error('Failed to update like');
    }
  };

  const addCommentHandler = async () => {
    try {
      const res = await api.post(
        `/post/${post._id}/comment`,
        { text },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        setText("");
        setComment([...comment, res.data.comment]);
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const format = (date) => {
    return moment(date).fromNow();
  };

  return (
    <div className="my-8 w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={post.author?.profilePicture} />
            <AvatarFallback>
              {post.author?.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{post.author?.username}</span>
              {user?._id !== post.author._id && (
                <button
                  className={`text-xs font-semibold ${
                    isFollowing ? 'text-gray-500' : 'text-blue-500'
                  }`}
                  onClick={handleFollowUnfollow}
                  disabled={followLoading}
                >
                  {followLoading ? '...' : (isFollowing ? '• Following' : '• Follow')}
                </button>
              )}
            </div>
            <span className="text-xs text-gray-500">{format(post.createdAt)}</span>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
           
            <MoreHorizontal className="cursor-pointer" />
            
          </DialogTrigger>
          <DialogContent className="flex flex-col items-center text-sm text-center">
            {post?.author?._id !== user?._id && (
              <Button
                variant="ghost"
                className={`cursor-pointer w-fit font-bold ${
                  isFollowing ? 'text-red-500' : 'text-blue-500'
                }`}
                onClick={handleFollowUnfollow}
                disabled={followLoading}
              >
                {followLoading ? 'Loading...' : (isFollowing ? 'Unfollow' : 'Follow')}
              </Button>
            )}
            <Button
              variant="ghost"
              className={`cursor-pointer w-fit font-bold ${
                isFavorited ? 'text-yellow-500' : 'text-gray-500'
              }`}
              onClick={handleFavorite}
              disabled={favoriteLoading}
            >
              {favoriteLoading ? 'Loading...' : (isFavorited ? 'Remove from Favorites' : 'Add to Favorites')}
            </Button>
            {post?.author?._id === user?._id && (
              <Button
                variant="ghost"
                className="cursor-pointer w-fit text-[#ED4956] font-bold"
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <img
        className="rounded-sm my-2 w-full aspect-square object-cover"
        src={post.image}
        alt="post_img"
      />

      <div className="flex items-center justify-between my-2">
        <div className="flex items-center gap-3">
          {liked ? (
            <FaHeart
              onClick={likeOrDislikeHandler}
              size={"24"}
              className="cursor-pointer text-red-600"
            />
          ) : (
            <FaRegHeart
              onClick={likeOrDislikeHandler}
              size={"22px"}
              className="cursor-pointer hover:text-gray-600"
            />
          )}

          <MessageCircle
            onClick={() => {
              dispatch(setSelectedPost(post));
              setOpen(true);
            }}
            className="cursor-pointer hover:text-gray-600"
          />
         <Send 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `Post by ${post.author?.username}`,
                  text: post.caption || 'Check out this post!',
                  url: post.image
                }).catch(err => {
                  // Fallback if sharing fails
                  navigator.clipboard.writeText(post.image);
                  toast.success('Link copied to clipboard');
                });
              } else {
                // Fallback for browsers that don't support share API
                navigator.clipboard.writeText(post.image);
                toast.success('Link copied to clipboard');
              }
            }}
            className="cursor-pointer hover:text-gray-600" 
          />
        </div>
        {isBookmarked ? (
          <BookmarkCheck
            onClick={bookmarkHandler}
            className="cursor-pointer text-gray-900 fill-current"
          />
        ) : (
          <Bookmark
            onClick={bookmarkHandler}
            className="cursor-pointer hover:text-gray-600"
          />
        )}
      </div>
      <span className="font-medium block mb-2">{postLike} likes</span>
      <p>
        <span className="font-medium mr-2">{post.author?.username}</span>
        {post.caption}
      </p>
      {comment.length > 0 && (
        <span
          onClick={() => {
            dispatch(setSelectedPost(post));
            setOpen(true);
          }}
          className="cursor-pointer text-sm text-gray-400"
        >
          View all {comment.length} comments
        </span>
      )}
      <CommentDialog open={open} setOpen={setOpen} />
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Add a comment..."
          value={text}
          onChange={changeEventHandler}
          className="outline-none text-sm w-full"
        />
        {text && (
          <span
            onClick={addCommentHandler}
            className="text-[#3BADF8] cursor-pointer"
          >
            Post
          </span>
        )}
      </div>
    </div>
  );
};

export default Post;
