import { VIDEO_EVENT } from '../constants';
import { ReportEvent } from '../events-collector';
import { EventPauseData } from '../types/events';

export const registerNativePauseEvent = (videoElement: HTMLVideoElement, reportEvent: ReportEvent<EventPauseData>) => {
  const pauseEventListener = () => {
    reportEvent(VIDEO_EVENT.PAUSE, {});
  };
  videoElement.addEventListener('pause', pauseEventListener);
  const emptiedEventListener = () => {
    reportEvent(VIDEO_EVENT.PAUSE, {});
  };
  videoElement.addEventListener('emptied', emptiedEventListener);

  return () => {
    videoElement.removeEventListener('pause', pauseEventListener);
    videoElement.removeEventListener('emptied', emptiedEventListener);
  };
};
