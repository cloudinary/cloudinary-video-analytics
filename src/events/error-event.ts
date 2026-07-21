import { VIDEO_EVENT } from '../events.consts';
import type { PlayerAdapter, ReportEvent, UnregisterEvent } from '../types';

export const registerErrorEvent = (playerAdapter: PlayerAdapter, reportEvent: ReportEvent): UnregisterEvent => {
  const eventErrorClearCallback = playerAdapter.onError(() => {
    const error = playerAdapter.getError();
    reportEvent(VIDEO_EVENT.ERROR, {
      errorCode: error ? error.code : null,
      errorMessage: error ? error.message : null,
    });
  });

  return () => {
    eventErrorClearCallback();
  };
};
