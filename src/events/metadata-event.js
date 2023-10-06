import { VIDEO_EVENT } from '../events.consts';
import { getVideoMetadata } from '../utils/video-metadata';

export const registerMetadataEvent = (videoElement, reportEvent) => {
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
