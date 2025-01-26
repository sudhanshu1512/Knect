const Video = require('../models/Video');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

// Get all videos
exports.getVideos = catchAsyncErrors(async (req, res) => {
  const videos = await Video.find().sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    videos
  });
});

// Add a new video
exports.addVideo = catchAsyncErrors(async (req, res) => {
  const { youtubeId, title } = req.body;

  if (!youtubeId || !title) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both youtubeId and title'
    });
  }

  const video = await Video.create({
    youtubeId,
    title
  });

  res.status(201).json({
    success: true,
    video
  });
});

// Toggle like on a video
exports.toggleLike = catchAsyncErrors(async (req, res) => {
  const video = await Video.findById(req.params.id);
  
  if (!video) {
    return res.status(404).json({
      success: false,
      message: 'Video not found'
    });
  }

  const isLiked = video.likes.includes(req.user._id);

  if (isLiked) {
    video.likes = video.likes.filter(id => id.toString() !== req.user._id.toString());
  } else {
    video.likes.push(req.user._id);
  }

  await video.save();

  res.status(200).json({
    success: true,
    video
  });
});
