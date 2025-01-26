import { Favorite } from "../models/favorite.model.js";
import { User } from "../models/user.model.js";

export const toggleFavorite = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.id;

        // Check if post is already in favorites
        const existingFavorite = await Favorite.findOne({ user: userId, post: postId });

        if (existingFavorite) {
            // Remove from favorites
            await Favorite.findByIdAndDelete(existingFavorite._id);
            return res.status(200).json({
                success: true,
                message: "Removed from favorites",
                isFavorited: false
            });
        } else {
            // Add to favorites
            await Favorite.create({ user: userId, post: postId });
            return res.status(200).json({
                success: true,
                message: "Added to favorites",
                isFavorited: true
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.code === 11000 ? "Already in favorites" : "Error updating favorites"
        });
    }
};

export const getFavorites = async (req, res) => {
    try {
        const userId = req.params.id || req.id;

        const favorites = await Favorite.find({ user: userId })
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
            favorites
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error fetching favorites"
        });
    }
};

export const checkFavoriteStatus = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.id;

        const favorite = await Favorite.findOne({ user: userId, post: postId });

        return res.status(200).json({
            success: true,
            isFavorited: !!favorite
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error checking favorite status"
        });
    }
};
