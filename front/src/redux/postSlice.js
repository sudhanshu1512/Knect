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
            const { postId, comment } = action.payload;
            // Update in posts array
            state.posts = state.posts.map(post => {
                if (post._id === postId) {
                    return {
                        ...post,
                        comments: [...post.comments, comment]
                    };
                }
                return post;
            });
            // Update in selectedPost if it's the same post
            if (state.selectedPost?._id === postId) {
                state.selectedPost = {
                    ...state.selectedPost,
                    comments: [...state.selectedPost.comments, comment]
                };
            }
        }
    }
});

export const { setPosts, setSelectedPost, addNewPost, updatePost, deletePost, updatePostComments } = postSlice.actions;
export default postSlice.reducer;