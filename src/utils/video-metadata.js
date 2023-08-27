export const getVideoMetadata = (videoElement) => {
  const videoElementDuration = videoElement.duration;
  const videoDuration = Number.isNaN(videoElementDuration) ? null : videoElementDuration;
  return {
    videoDuration,
  };
};
