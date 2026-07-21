import { VIDEO_EVENT } from '../events.consts';
import type { PlayerAdapter, ReportEvent, UnregisterEvent } from '../types';

// Startup (join) time: the delay from play intent (`play`) to the first rendered
// frame (`playing`). This is measured directly rather than inferred from a
// `waiting` stall, which browsers emit inconsistently during startup. Emitted
// once per view. A view with a `play` event but no `startup` event means
// playback never began — a startup failure.
export const registerStartupEvent = (playerAdapter: PlayerAdapter, reportEvent: ReportEvent): UnregisterEvent => {
  let playIntentTime: number | null = null;
  let reported = false;

  const eventPlayClearCallback = playerAdapter.onPlay(() => {
    if (playIntentTime === null) {
      playIntentTime = Date.now();
    }
  });
  const eventPlayingClearCallback = playerAdapter.onPlaying(() => {
    if (reported || playIntentTime === null) {
      return;
    }

    reported = true;
    reportEvent(VIDEO_EVENT.STARTUP, { joinTime: Date.now() - playIntentTime });
  });

  return () => {
    eventPlayClearCallback();
    eventPlayingClearCallback();
  };
};
