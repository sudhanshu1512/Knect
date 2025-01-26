import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUserProfile } from '@/redux/authSlice';
import useGetUserProfile from '@/hooks/useGetUserProfile';
import { AtSign,Heart, MessageCircle,Trash } from 'lucide-react';
import api from '@/api/axios';
import { toast } from 'sonner';
import FollowModal from "./FollowModal";

const Profile = () => {
  const params = useParams();
  const userId = params.id;
  const [activeTab, setActiveTab] = useState('posts');
  const [favorites, setFavorites] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followModalType, setFollowModalType] = useState("");

  const { userProfile, user } = useSelector(store => store.auth);
  const dispatch = useDispatch();
  
  // Call the custom hook
  useGetUserProfile(userId);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (activeTab === 'favorites') {
        try {
          setLoading(true);
          const { data } = await api.get(`/favorite/user${userId ? `/${userId}` : ''}`);
          if (data.success) {
            // Filter out invalid favorites and map the valid ones
            setFavorites(data.favorites
              .filter(fav => fav?.post) // Only include favorites with valid post data
              .map(fav => ({
                _id: fav._id,
                image: fav.post.image,
                postId: fav.post._id
              }))
            );
          } else {
            toast.error(data.message || 'Failed to load favorites');
          }
        } catch (error) {
          console.error('Error fetching favorites:', error);
          toast.error(error?.response?.data?.message || 'Failed to load favorites');
        } finally {
          setLoading(false);
        }
      }
    };
    
    const fetchBookmarks = async () => {
      if (activeTab === 'saved') {
        try {
          setLoading(true);
          const { data } = await api.get(`/bookmark/user${userId ? `/${userId}` : ''}`);
          if (data.success) {
            // Backend returns array of post objects directly
            setBookmarks(data.bookmarks
              .filter(post => post) // Filter out any null posts
              .map(post => ({
                _id: post._id,
                image: post.image,
                postId: post._id
              }))
            );
          } else {
            toast.error(data.message || 'Failed to load bookmarks');
          }
        } catch (error) {
          console.error('Error fetching bookmarks:', error);
          toast.error(error?.response?.data?.message || 'Failed to load bookmarks');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchFavorites();
    fetchBookmarks();
  }, [activeTab, userId]);

  const isOwnProfile = user?._id === userProfile?._id;
  const isFollowing = userProfile?.followers?.includes(user?._id);

  const followUnfollowHandler = async () => {
    try {
      await api.post(`/user/followorunfollow/${userProfile?._id}`);
      // Refetch user profile after follow/unfollow
      useGetUserProfile(userId);
    } catch (error) {
      console.error('Error following/unfollowing:', error);
      toast.error('Failed to follow/unfollow');
    }
  };

  const deletePost = async (postId) => {
    try {
      const { data } = await api.delete(`/post/delete/${postId}`);
      if (data.success) {
        // Update local state
        const updatedPosts = userProfile.posts.filter(post => post._id !== postId);
        dispatch(setUserProfile({ ...userProfile, posts: updatedPosts }));
        toast.success('Post deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete post');
    }
  };

  const removeFromFavorites = async (favoriteId) => {
    try {
      const favorite = favorites.find(f => f._id === favoriteId);
      if (!favorite?.postId) {
        toast.error('Invalid favorite post');
        return;
      }

      const { data } = await api.get(`/favorite/toggle/${favorite.postId}`);
      if (data.success) {
        setFavorites(prev => prev.filter(f => f._id !== favoriteId));
        toast.success('Removed from favorites');
      } else {
        toast.error(data.message || 'Failed to remove from favorites');
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error(error?.response?.data?.message || 'Failed to remove from favorites');
    }
  };

  const removeFromBookmarks = async (postId) => {
    try {
      const { data } = await api.get(`/bookmark/toggle/${postId}`);
      if (data.success) {
        setBookmarks(prev => prev.filter(bookmark => bookmark.postId !== postId));
        toast.success('Removed from bookmarks');
      } else {
        toast.error(data.message || 'Failed to remove from bookmarks');
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast.error(error?.response?.data?.message || 'Failed to remove from bookmarks');
    }
  };

  if (!userProfile) {
    return <div>Loading...</div>;
  }

  return (
    <div className='flex max-w-5xl justify-center mx-auto pl-10'>
      <div>
        <section className='flex gap-10 py-10'>
          <div>
            <Avatar className='w-40 h-40'>
              <AvatarImage src={userProfile?.profilePicture} alt={userProfile?.username} />
              <AvatarFallback>{userProfile?.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
          <div>
            <div className='flex gap-10 items-center'>
              <span>{userProfile?.username}</span>
              {isOwnProfile ? (
                <Link to="/account/edit">
                  <Button>Edit Profile</Button>
                </Link>
              ) : (
                <Button onClick={followUnfollowHandler}>
                  {isFollowing ? "Unfollow" : "Follow"}
                </Button>
              )}
            </div>
            <div className='flex gap-10 my-5'>
              <span><strong>{userProfile?.posts?.length || 0}</strong> posts</span>
              <button
                onClick={() => {
                  setFollowModalType("followers");
                  setShowFollowModal(true);
                }}
                className="hover:underline"
              >
                <strong>{userProfile?.followers?.length || 0}</strong> followers
              </button>
              <button
                onClick={() => {
                  setFollowModalType("following");
                  setShowFollowModal(true);
                }}
                className="hover:underline"
              >
                <strong>{userProfile?.following?.length || 0}</strong> following
              </button>
            </div>
            <div className='flex flex-col gap-1'>
              <span className='font-semibold'>{userProfile?.bio || 'bio here...'}</span>
              <Badge className='w-fit' variant='secondary'>
                <AtSign /> <span className='pl-1'>{userProfile?.username}</span>
              </Badge>
            </div>
          </div>
        </section>

        <div className='border-t'>
          <div className='flex justify-center gap-14'>
            <span
              className={`py-3 cursor-pointer ${activeTab === 'posts' ? 'font-bold border-t border-black -mt-[1px]' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              POSTS
            </span>
            <span
              className={`py-3 cursor-pointer ${activeTab === 'saved' ? 'font-bold border-t border-black -mt-[1px]' : ''}`}
              onClick={() => setActiveTab('saved')}
            >
              SAVED
            </span>
            <span
              className={`py-3 cursor-pointer ${activeTab === 'favorites' ? 'font-bold border-t border-black -mt-[1px]' : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              FAVORITES
            </span>
          </div>

          <div className='grid grid-cols-3 gap-1'>
            {loading ? (
              <div className="col-span-3 text-center py-4">Loading...</div>
            ) : activeTab === 'posts' ? (
              userProfile?.posts?.map((post) => (
                <div key={post._id} className='aspect-square w-[293px] h-[293px] relative group'>
                  <img
                    src={post.image}
                    alt='post'
                    className='w-full h-full object-cover cursor-pointer'
                  />
                  {isOwnProfile && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <button className='flex items-center gap-3 p-2 hover:text-red-500'>
                          <Heart />
                          <span>{post?.likes.length}</span>
                        </button>
                        <button className='flex items-center gap-3 p-2 hover:text-gray-300'>
                          <MessageCircle />
                          <span>{post?.comments.length}</span>
                        </button>
                      <button
                        onClick={() => deletePost(post._id)}className='flex items-center p-2 gap-3 hover:text-red-500' >
                          <Trash />
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : activeTab === 'saved' ? (
              bookmarks?.map((bookmark) => (
                <div key={bookmark._id} className='aspect-square w-[293px] h-[293px] relative group'>
                  <img
                    src={bookmark.image}
                    alt='saved post'
                    className='w-full h-full object-cover cursor-pointer'
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button
                      onClick={() => removeFromBookmarks(bookmark.postId)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" >
                     <Trash />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              favorites?.map((favorite) => (
                <div key={favorite._id} className='aspect-square w-[293px] h-[293px] relative group'>
                  <img
                    src={favorite.image}
                    alt='favorite post'
                    className='w-full h-full object-cover cursor-pointer'
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button
                      onClick={() => removeFromFavorites(favorite._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                      <Trash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <FollowModal
        isOpen={showFollowModal}
        onClose={() => setShowFollowModal(false)}
        userId={userProfile?._id}
        type={followModalType}
      />
    </div>
  );
};

export default Profile;