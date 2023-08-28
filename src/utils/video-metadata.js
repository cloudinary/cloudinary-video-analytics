export const getVideoMetadata = (videoElement) => {
  const videoElementDuration = videoElement.duration;
  const videoDuration = Number.isNaN(videoElementDuration) ? null : videoElementDuration;
  return {
    videoDuration: Number.POSITIVE_INFINITY === videoDuration ? 'Infinity' : videoDuration,
  };
};
