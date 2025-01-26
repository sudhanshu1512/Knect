import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  }
}, { timestamps: true });

// Ensure a user can only bookmark a post once
bookmarkSchema.index({ user: 1, post: 1 }, { unique: true });

export const Bookmark = mongoose.model('Bookmark', bookmarkSchema);
