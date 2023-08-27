import { VIDEO_EVENT } from '../events.consts';

export const registerPauseEvent = (videoElement, reportEvent) => {
  const pauseEventListener = () => {
    reportEvent(VIDEO_EVENT.PAUSE, {});
  };
  videoElement.addEventListener('pause', pauseEventListener);
  const emptiedEventListener = () => {
    reportEvent(VIDEO_EVENT.PAUSE, {});
  };
  videoElement.addEventListener('emptied', emptiedEventListener);

  return () => {
    videoElement.removeEventListener('play', pauseEventListener);
    videoElement.removeEventListener('emptied', emptiedEventListener);
  };
};
