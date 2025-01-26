import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true }
}, { timestamps: true });

// Compound index to ensure a user can't favorite the same post twice
favoriteSchema.index({ user: 1, post: 1 }, { unique: true });

export const Favorite = mongoose.model('Favorite', favoriteSchema);
