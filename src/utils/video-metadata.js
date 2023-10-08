export const getVideoMetadata = (videoElement) => {
  const videoElementDuration = videoElement.duration;
  const videoDuration = Number.isNaN(videoElementDuration) ? null : videoElementDuration;
  return {
    videoDuration: Number.POSITIVE_INFINITY === videoDuration ? 'Infinity' : videoDuration,
  };
};

export const tryInitEvents = (videoElement) => {
  if (videoElement.readyState > 0) {
    const event = new CustomEvent('loadedmetadata_after_init');
    videoElement.dispatchEvent(event);
  }
};
