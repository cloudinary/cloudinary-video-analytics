import { VIDEO_CUSTOM_EVENT_PREFIX } from '../events.consts';

export const getVideoMetadata = (videoElement) => {
  const videoElementDuration = videoElement.duration;
  const videoDuration = Number.isNaN(videoElementDuration) ? null : videoElementDuration;
  return {
    videoDuration: Number.POSITIVE_INFINITY === videoDuration ? 'Infinity' : videoDuration,
  };
};

export const tryInitEvents = (videoElement, shouldUseCustomEvents) => {
  if (videoElement.readyState > 0) {
    const eventName = shouldUseCustomEvents ? `${VIDEO_CUSTOM_EVENT_PREFIX}loadedmetadata_after_init` : 'loadedmetadata_after_init';
    const event = new CustomEvent(eventName);
    videoElement.dispatchEvent(event);
  }
};
