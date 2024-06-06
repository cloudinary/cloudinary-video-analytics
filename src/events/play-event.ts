import { VIDEO_EVENT } from '../constants';
import { ReportEvent } from '../events-collector';
import { EventPlayData } from '../types/events';

export const registerNativePlayEvent = (videoElement: HTMLVideoElement, reportEvent: ReportEvent<EventPlayData>) => {
  const eventListener = () => {
    reportEvent(VIDEO_EVENT.PLAY, {});
  };
  videoElement.addEventListener('play', eventListener);

  return () => {
    videoElement.removeEventListener('play', eventListener);
  };
};
