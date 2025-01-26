import api from './axios';

export const searchUsers = async (query) => {
  try {
    const { data } = await api.get(`/user/search?query=${query}`);
    return data;
  } catch (error) {
    throw error.response?.data || { message: 'Error searching users' };
  }
};

export const followUnfollowUser = async (userId) => {
  try {
    const { data } = await api.post(`/user/followorunfollow/${userId}`);
    return data;
  } catch (error) {
    throw error.response?.data || { message: 'Error following/unfollowing user' };
  }
};
