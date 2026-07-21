import { VIDEO_EVENT } from '../events.consts';
import type { PlayerAdapter, ReportEvent, UnregisterEvent } from '../types';

export const registerPauseEvent = (playerAdapter: PlayerAdapter, reportEvent: ReportEvent): UnregisterEvent => {
  const eventPauseClearCallback = playerAdapter.onPause(() => {
    reportEvent(VIDEO_EVENT.PAUSE, {});
  });
  const eventEmptiedClearCallback = playerAdapter.onEmptied(() => {
    reportEvent(VIDEO_EVENT.PAUSE, {});
  });

  return () => {
    eventPauseClearCallback();
    eventEmptiedClearCallback();
  };
};
