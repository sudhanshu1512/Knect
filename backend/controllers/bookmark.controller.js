import { Bookmark } from '../models/bookmark.model.js';

export const toggleBookmark = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.id;

        // Check if post is already bookmarked
        const existingBookmark = await Bookmark.findOne({ user: userId, post: postId });

        if (existingBookmark) {
            // Remove bookmark
            await Bookmark.findByIdAndDelete(existingBookmark._id);
            return res.status(200).json({
                success: true,
                message: "Removed from bookmarks",
                isBookmarked: false
            });
        } else {
            // Add bookmark
            await Bookmark.create({ user: userId, post: postId });
            return res.status(200).json({
                success: true,
                message: "Added to bookmarks",
                isBookmarked: true
            });
        }
    } catch (error) {
        console.error('Error in toggleBookmark:', error);
        return res.status(500).json({
            success: false,
            message: error.code === 11000 ? "Already bookmarked" : "Error updating bookmark"
        });
    }
};

export const checkBookmarkStatus = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.id;

        const bookmark = await Bookmark.findOne({ user: userId, post: postId });
        
        return res.status(200).json({
            success: true,
            isBookmarked: !!bookmark
        });
    } catch (error) {
        console.error('Error in checkBookmarkStatus:', error);
        return res.status(500).json({
            success: false,
            message: "Error checking bookmark status"
        });
    }
};

export const getUserBookmarks = async (req, res) => {
    try {
        const userId = req.params.id || req.id;

        const bookmarks = await Bookmark.find({ user: userId })
            .populate({
                path: 'post',
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            })
            .sort('-createdAt');

        return res.status(200).json({
            success: true,
            bookmarks: bookmarks.map(b => b.post)
        });
    } catch (error) {
        console.error('Error in getUserBookmarks:', error);
        return res.status(500).json({
            success: false,
            message: "Error fetching bookmarks"
        });
    }
};
