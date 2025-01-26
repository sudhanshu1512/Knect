import { useState } from 'react';
import { searchUsers, followUnfollowUser } from '../api/user';
import { Input } from "./ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { toast } from "sonner";

const Search = () => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState({});

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
      toast.success(data.message);
      
      // Update the user's follow status locally
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId 
            ? { ...user, isFollowing: !user.isFollowing }
            : user
        )
      );
    } catch (error) {
      toast.error(error?.message || 'Error following/unfollowing user');
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <Input
        type="text"
        placeholder="Search users..."
        value={query}
        onChange={handleSearch}
        className="mb-4"
      />

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
