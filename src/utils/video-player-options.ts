import type { VideoPlayerType } from '../types';

const REGEX_SEMANTIC_VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
const NATIVE_VIDEO_PLAYER = 'native';
const ALLOWED_VIDEO_PLAYER_TYPES: VideoPlayerType[] = [NATIVE_VIDEO_PLAYER, 'cloudinary video player'];

export const getVideoPlayerType = (videoPlayerType?: string): VideoPlayerType => {
  if (ALLOWED_VIDEO_PLAYER_TYPES.includes(videoPlayerType as VideoPlayerType)) {
    return videoPlayerType as VideoPlayerType;
  }

  return NATIVE_VIDEO_PLAYER;
};

export const getVideoPlayerVersion = (videoPlayerVersion?: string): string | null => {
  if (typeof videoPlayerVersion === 'string' && REGEX_SEMANTIC_VERSION.test(videoPlayerVersion)) {
    return videoPlayerVersion;
  }

  return null;
};
