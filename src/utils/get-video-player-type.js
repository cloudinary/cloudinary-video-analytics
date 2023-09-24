const NATIVE_VIDEO_PLAYER = 'native';
const ALLOWED_VIDEO_PLAYER_TYPES = [NATIVE_VIDEO_PLAYER, 'cloudinary-video-player'];

export const getVideoPlayerType = (videoPlayerType) => {
  if (ALLOWED_VIDEO_PLAYER_TYPES.includes(videoPlayerType)) {
    return videoPlayerType;
  }
  return NATIVE_VIDEO_PLAYER;
};
