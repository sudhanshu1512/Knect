import express from 'express';
import { checkBookmarkStatus, getUserBookmarks, toggleBookmark } from '../controllers/bookmark.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';

const router = express.Router();

router.get('/toggle/:id', isAuthenticated, toggleBookmark);
router.get('/check/:id', isAuthenticated, checkBookmarkStatus);
router.get('/user/:id?', isAuthenticated, getUserBookmarks);

export default router;
