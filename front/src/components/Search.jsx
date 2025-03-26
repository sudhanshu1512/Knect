import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { searchUsers, followUnfollowUser } from '../api/user';
import { Input } from "./ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Link } from 'react-router-dom';
import { setSuggestedUsers } from '../redux/authSlice';

const Search = () => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState({});
  const dispatch = useDispatch();
  const { suggestedUsers } = useSelector(store => store.auth);

  const handleSearch = async (e) => {
    const searchQuery = e.target.value;
    setQuery(searchQuery);

    if (searchQuery.trim()) {
      try {
        setLoading(true);
        const data = await searchUsers(searchQuery);
        setUsers(data?.users || []);
      } catch (error) {
        toast.error(error?.message || 'Error searching users');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    } else {
      setUsers([]);
    }
  };

  const handleFollowUnfollow = async (userId) => {
    try {
      setFollowLoading(prev => ({ ...prev, [userId]: true }));
      const data = await followUnfollowUser(userId);
      
      // Update the user's follow status in search results
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId 
            ? { ...user, isFollowing: !user.isFollowing }
            : user
        )
      );

      // Update suggested users in Redux
      const updatedSuggestedUsers = suggestedUsers.filter(user => user._id !== userId);
      dispatch(setSuggestedUsers(updatedSuggestedUsers));
      
      toast.success(data.message);
    } catch (error) {
      toast.error(error?.message || 'Error following/unfollowing user');
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <div className="w-[70%] md:w-full max-w-md mx-auto p-4">
      <Input
        type="text"
        placeholder="Search users..."
        value={query}
        onChange={handleSearch}
        className="mb-4"
      />

      {/* Show suggested users on small screens when no search is active */}
      {!query.trim() && (
        <div className="md:hidden mb-6">
          <h2 className="font-semibold text-gray-600 mb-4">Suggested for you</h2>
          <div className="space-y-4">
            {suggestedUsers?.slice(0, 3).map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow"
              >
                <div className="flex items-center gap-3">
                  <Link to={`/profile/${user._id}`}>
                    <Avatar>
                      <AvatarImage src={user.profilePicture} />
                      <AvatarFallback>{user.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <Link to={`/profile/${user._id}`}>
                      <h3 className="font-medium">{user.username}</h3>
                    </Link>
                    <p className="text-sm text-gray-500">{user.bio || 'No bio'}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#3BADF8] hover:text-[#3495d6] hover:bg-blue-50 dark:hover:bg-blue-950 font-bold"
                  onClick={() => handleFollowUnfollow(user._id)}
                  disabled={followLoading[user._id]}
                >
                  {followLoading[user._id] ? "Loading..." : "Follow"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="space-y-4">
          {Array.isArray(users) && users.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user.profilePicture} />
                  <AvatarFallback>{user.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{user.username}</h3>
                  <p className="text-sm text-gray-500">{user.bio || 'No bio'}</p>
                </div>
              </div>
              <Button
                variant={user.isFollowing ? "secondary" : "default"}
                onClick={() => handleFollowUnfollow(user._id)}
                disabled={followLoading[user._id]}
              >
                {followLoading[user._id] ? (
                  "Loading..."
                ) : (
                  user.isFollowing ? "Unfollow" : "Follow"
                )}
              </Button>
            </div>
          ))}
          {!loading && Array.isArray(users) && users.length === 0 && query.trim() && (
            <div className="text-center text-gray-500">No users found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
