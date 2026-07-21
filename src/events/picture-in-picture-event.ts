import { VIDEO_EVENT } from '../events.consts';
import type { PlayerAdapter, ReportEvent, UnregisterEvent } from '../types';

export const registerPictureInPictureEvent = (playerAdapter: PlayerAdapter, reportEvent: ReportEvent): UnregisterEvent => {
  const eventEnterClearCallback = playerAdapter.onEnterPictureInPicture(() => {
    reportEvent(VIDEO_EVENT.PICTURE_IN_PICTURE_CHANGE, { isPictureInPicture: true });
  });
  const eventLeaveClearCallback = playerAdapter.onLeavePictureInPicture(() => {
    reportEvent(VIDEO_EVENT.PICTURE_IN_PICTURE_CHANGE, { isPictureInPicture: false });
  });

  return () => {
    eventEnterClearCallback();
    eventLeaveClearCallback();
  };
};
