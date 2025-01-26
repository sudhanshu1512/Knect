import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { toast } from "sonner";

const FollowModal = ({ isOpen, onClose, userId, type }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [userId, type]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Using the correct endpoint based on the type (followers/following)
      const { data } = await api.get(`/user/${userId}/${type === 'followers' ? 'followers' : 'following'}`);
      if (data.success) {
        setUsers(data.users);
      } else {
        toast.error('Failed to load users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(error?.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUnfollow = async (targetUserId) => {
    try {
      const { data } = await api.post(`/user/followorunfollow/${targetUserId}`);
      if (data.success) {
        setUsers(users.map(u => {
          if (u._id === targetUserId) {
            return {
              ...u,
              followers: data.isFollowing 
                ? [...u.followers, user._id]
                : u.followers.filter(id => id !== user._id)
            };
          }
          return u;
        }));
        toast.success(data.message);
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
      toast.error('Failed to update follow status');
    }
  };

  const handleUserClick = (userId) => {
    onClose();
    navigate(`/profile/${userId}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <h2 className="text-xl font-semibold mb-4 text-center">
          {type === "followers" ? "Followers" : "Following"}
        </h2>
        
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-4">No users found</div>
        ) : (
          <div className="space-y-4">
            {users.map((u) => (
              <div key={u._id} className="flex items-center justify-between">
                <div 
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => handleUserClick(u._id)}
                >
                  <Avatar>
                    <AvatarImage src={u.profilePicture} />
                    <AvatarFallback>{u.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{u.username}</p>
                  </div>
                </div>
                {user._id !== u._id && (
                  <Button
                    variant="outline"
                    onClick={() => handleFollowUnfollow(u._id)}
                  >
                    {u.followers.includes(user._id) ? "Unfollow" : "Follow"}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FollowModal;
