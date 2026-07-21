import { VIDEO_EVENT } from '../events.consts';
import type { PlayerAdapter, ReportEvent, UnregisterEvent } from '../types';

// The Fullscreen API dispatches `fullscreenchange` on `document`, so on a page
// with several tracked videos every adapter hears every video's transition. We
// only report when *this* element's fullscreen state actually changed, so an
// unrelated video going fullscreen doesn't emit a spurious event here.
export const registerFullscreenEvent = (playerAdapter: PlayerAdapter, reportEvent: ReportEvent): UnregisterEvent => {
  let lastIsFullscreen = playerAdapter.getIsFullscreen();

  const eventFullscreenClearCallback = playerAdapter.onFullscreenChange(() => {
    const isFullscreen = playerAdapter.getIsFullscreen();
    if (isFullscreen === lastIsFullscreen) {
      return;
    }

    lastIsFullscreen = isFullscreen;
    reportEvent(VIDEO_EVENT.FULLSCREEN_CHANGE, { isFullscreen });
  });

  return () => {
    eventFullscreenClearCallback();
  };
};
