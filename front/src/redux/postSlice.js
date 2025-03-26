import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    posts: [],
    selectedPost: null
};

const postSlice = createSlice({
    name: "post",
    initialState,
    reducers: {
        setPosts: (state, action) => {
            // Sort posts by createdAt in descending order (newest first)
            state.posts = action.payload.sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            );
        },
        setSelectedPost: (state, action) => {
            state.selectedPost = action.payload;
        },
        addNewPost: (state, action) => {
            // Add new post at the beginning
            state.posts.unshift(action.payload);
        },
        updatePost: (state, action) => {
            const index = state.posts.findIndex(post => post._id === action.payload._id);
            if (index !== -1) {
                state.posts[index] = action.payload;
            }
        },
        deletePost: (state, action) => {
            state.posts = state.posts.filter(post => post._id !== action.payload);
        },
        updatePostComments: (state, action) => {
            const { postId, comment, comments } = action.payload;
            
            // Function to update comments based on action type
            const updateComments = (post) => {
                if (comments) {
                    // If comments array is provided, use it directly (for deletion)
                    return {
                        ...post,
                        comments
                    };
                }
                // If single comment is provided, add it to existing comments
                return {
                    ...post,
                    comments: [...post.comments, comment]
                };
            };

            // Update in posts array
            state.posts = state.posts.map(post => {
                if (post._id === postId) {
                    return updateComments(post);
                }
                return post;
            });

            // Update in selectedPost if it's the same post
            if (state.selectedPost?._id === postId) {
                state.selectedPost = updateComments(state.selectedPost);
            }
        }
    }
});

export const { setPosts, setSelectedPost, addNewPost, updatePost, deletePost, updatePostComments } = postSlice.actions;
export default postSlice.reducer;