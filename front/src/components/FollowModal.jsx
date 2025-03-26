import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { toast } from "sonner";

const FollowModal = ({ isOpen, onClose, userId, type: initialType }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialType);
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  useEffect(() => {
    setActiveTab(initialType);
  }, [initialType]);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [userId, activeTab, isOpen]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/user/${userId}/${activeTab === 'followers' ? 'followers' : 'following'}`);
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
      <DialogContent className="w-[90vw] sm:w-[400px] max-w-lg p-0">
        {/* Tabs Header */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-4 text-center font-semibold text-sm ${
              activeTab === 'followers'
                ? 'border-b-2 border-black'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('followers')}
          >
            Followers
          </button>
          <button
            className={`flex-1 py-4 text-center font-semibold text-sm ${
              activeTab === 'following'
                ? 'border-b-2 border-black'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('following')}
          >
            Following
          </button>
        </div>

        {/* Users List */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No {activeTab} yet
            </div>
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
                      <p className="text-sm text-gray-500">{u.bio || 'No bio'}</p>
                    </div>
                  </div>
                  {user._id !== u._id && (
                    <Button
                      variant={u.followers.includes(user._id) ? "secondary" : "default"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFollowUnfollow(u._id);
                      }}
                    >
                      {u.followers.includes(user._id) ? "Unfollow" : "Follow"}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FollowModal;
