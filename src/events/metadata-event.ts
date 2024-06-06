import { VIDEO_EVENT } from '../constants';
import { getVideoMetadata } from '../utils/video-metadata';
import { ReportEvent } from '../events-collector';
import { EventMetadataData } from '../types/events';

export const registerNativeMetadataEvent = (videoElement: HTMLVideoElement, reportEvent: ReportEvent<EventMetadataData>) => {
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
