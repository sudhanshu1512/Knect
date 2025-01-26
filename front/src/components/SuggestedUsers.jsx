import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { followUnfollowUser } from '../api/user';
import { toast } from 'sonner';
import { setSuggestedUsers } from '../redux/authSlice';

const SuggestedUsers = () => {
    const dispatch = useDispatch();
    const { suggestedUsers } = useSelector(store => store.auth);
    const [followLoading, setFollowLoading] = useState({});

    const handleFollowUnfollow = async (userId) => {
        try {
            setFollowLoading(prev => ({ ...prev, [userId]: true }));
            const data = await followUnfollowUser(userId);
            
            // Update the suggested users list by removing the followed user
            const updatedUsers = suggestedUsers.filter(user => user._id !== userId);
            dispatch(setSuggestedUsers(updatedUsers));
            
            toast.success(data.message);
        } catch (error) {
            toast.error(error?.message || 'Error following user');
        } finally {
            setFollowLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    if (!suggestedUsers?.length) {
        return null; // Don't show the component if there are no suggestions
    }

    return (
        <div className='my-10'>
            <div className='flex items-center justify-between text-sm'>
                <h1 className='font-semibold text-gray-600'>Suggested for you</h1>
                <span className='font-medium cursor-pointer'>See All</span>
            </div>
            {suggestedUsers.map((user) => (
                <div key={user._id} className='flex items-center justify-between my-5'>
                    <div className='flex items-center gap-2'>
                        <Link to={`/profile/${user?._id}`}>
                            <Avatar>
                                <AvatarImage src={user?.profilePicture} alt={user?.username} />
                                <AvatarFallback>{user?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                            </Avatar>
                        </Link>
                        <div>
                            <h1 className='font-semibold text-sm'>
                                <Link to={`/profile/${user?._id}`}>{user?.username}</Link>
                            </h1>
                            <span className='text-gray-600 text-sm'>{user?.bio || 'Bio here...'}</span>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#3BADF8] hover:text-[#3495d6] hover:bg-blue-50 dark:hover:bg-blue-950 font-bold"
                        onClick={() => handleFollowUnfollow(user._id)}
                        disabled={followLoading[user._id]}
                    >
                        {followLoading[user._id] ? 'Loading...' : 'Follow'}
                    </Button>
                </div>
            ))}
        </div>
    );
};

export default SuggestedUsers;