import { VIDEO_EVENT } from '../events.consts';

export const registerPlayEvent = (videoElement, reportEvent) => {
  const eventListener = () => {
    reportEvent(VIDEO_EVENT.PLAY, {
      time: Date.now(),
    });
  };
  videoElement.addEventListener('play', eventListener);

  return () => {
    videoElement.removeEventListener('play', eventListener);
  };
};
