import { VIDEO_EVENT } from '../events.consts';
import type { PlayerAdapter, ReportEvent, UnregisterEvent } from '../types';

export const registerPlayEvent = (playerAdapter: PlayerAdapter, reportEvent: ReportEvent): UnregisterEvent => {
  const eventPlayClearCallback = playerAdapter.onPlay(() => {
    reportEvent(VIDEO_EVENT.PLAY, {});
  });

  return () => {
    eventPlayClearCallback();
  };
};
