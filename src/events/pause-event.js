import { VIDEO_CUSTOM_EVENT_PREFIX, VIDEO_EVENT } from '../events.consts';

export const registerNativePauseEvent = (videoElement, reportEvent) => {
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

export const registerCustomPauseEvent = (videoElement, reportEvent) => {
  const pauseEventListener = () => {
    reportEvent(VIDEO_EVENT.PAUSE, {});
  };
  videoElement.addEventListener(`${VIDEO_CUSTOM_EVENT_PREFIX}pause`, pauseEventListener);
  const emptiedEventListener = () => {
    reportEvent(VIDEO_EVENT.PAUSE, {});
  };
  videoElement.addEventListener(`${VIDEO_CUSTOM_EVENT_PREFIX}emptied`, emptiedEventListener);

  return () => {
    videoElement.removeEventListener(`${VIDEO_CUSTOM_EVENT_PREFIX}pause`, pauseEventListener);
    videoElement.removeEventListener(`${VIDEO_CUSTOM_EVENT_PREFIX}emptied`, emptiedEventListener);
  };
};
