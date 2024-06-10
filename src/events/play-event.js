import { VIDEO_EVENT, VIDEO_CUSTOM_EVENT_PREFIX } from '../events.consts';

export const registerNativePlayEvent = (videoElement, reportEvent) => {
  const eventListener = () => {
    reportEvent(VIDEO_EVENT.PLAY, {});
  };
  videoElement.addEventListener('play', eventListener);

  return () => {
    videoElement.removeEventListener('play', eventListener);
  };
};

export const registerCustomPlayEvent = (videoElement, reportEvent) => {
  const eventListener = () => {
    reportEvent(VIDEO_EVENT.PLAY, {});
  };
  videoElement.addEventListener(`${VIDEO_CUSTOM_EVENT_PREFIX}play`, eventListener);

  return () => {
    videoElement.removeEventListener(`${VIDEO_CUSTOM_EVENT_PREFIX}play`, eventListener);
  };
};
