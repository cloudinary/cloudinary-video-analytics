import { VIDEO_EVENT } from '../events.consts';

export const registerPauseEvent = (playerAdapter, reportEvent) => {
  const eventPauseClearCallback = playerAdapter.onPause('pause', () => {
    reportEvent(VIDEO_EVENT.PAUSE, {});
  });
  const eventEmptiedClearCallback = playerAdapter.onEmptied('emptied', () => {
    reportEvent(VIDEO_EVENT.PAUSE, {});
  });

  return () => {
    eventPauseClearCallback();
    eventEmptiedClearCallback();
  };
};
