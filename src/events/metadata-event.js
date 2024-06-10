import { VIDEO_CUSTOM_EVENT_PREFIX, VIDEO_EVENT } from '../events.consts';
import { getVideoMetadata } from '../utils/video-metadata';

export const registerNativeMetadataEvent = (videoElement, reportEvent) => {
  const eventListener = () => {
    const videoMetadata = getVideoMetadata(videoElement);
    reportEvent(VIDEO_EVENT.LOADED_METADATA, {
      videoDuration: videoMetadata.videoDuration,
    });
  };
  videoElement.addEventListener('loadedmetadata', eventListener);
  videoElement.addEventListener('loadedmetadata_after_init', eventListener);

  return () => {
    videoElement.removeEventListener('loadedmetadata', eventListener);
    videoElement.removeEventListener('loadedmetadata_after_init', eventListener);
  };
};

export const registerCustomMetadataEvent = (videoElement, reportEvent) => {
  const loadedmetadataEventListener = (event) => {
    const videoMetadata = getVideoMetadata(videoElement);
    const videoDuration = event.detail.videoDuration || videoMetadata.videoDuration;
    reportEvent(VIDEO_EVENT.LOADED_METADATA, {
      videoDuration,
    });
  };
  videoElement.addEventListener(`${VIDEO_CUSTOM_EVENT_PREFIX}loadedmetadata`, loadedmetadataEventListener);

  const loadedmetadataAfterInitEventListener = (event) => {
    reportEvent(VIDEO_EVENT.LOADED_METADATA, {
      videoDuration: typeof event.detail.videoDuration !== 'number' && event.detail.videoDuration > 0 ? null : event.detail.videoDuration,
    });
  };
  videoElement.addEventListener(`${VIDEO_CUSTOM_EVENT_PREFIX}loadedmetadata_after_init`, loadedmetadataAfterInitEventListener);

  return () => {
    videoElement.removeEventListener(`${VIDEO_CUSTOM_EVENT_PREFIX}loadedmetadata`, loadedmetadataEventListener);
    videoElement.removeEventListener(`${VIDEO_CUSTOM_EVENT_PREFIX}loadedmetadata_after_init`, loadedmetadataAfterInitEventListener);
  };
};
