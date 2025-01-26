const express = require('express');
const { getVideos, addVideo, toggleLike } = require('../controllers/videoController');
const { isAuthenticatedUser } = require('../middlewares/auth');

const router = express.Router();

router.route('/videos').get(isAuthenticatedUser, getVideos);
router.route('/video').post(isAuthenticatedUser, addVideo);
router.route('/video/:id/like').post(isAuthenticatedUser, toggleLike);

module.exports = router;
