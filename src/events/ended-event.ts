import { VIDEO_EVENT } from '../events.consts';
import type { PlayerAdapter, ReportEvent, UnregisterEvent } from '../types';

// Playback reached the natural end. This marks completion and bounds the final
// playing span for watch-time calculations.
//
// Repeats: a looping video (`loop`) never fires `ended` at all — it seeks back
// and keeps playing — so loops produce no events here. A genuine replay (user
// restarts a finished video) SHOULD count as another completion, so we reset on
// the next `playing`. What we guard against is a spurious duplicate `ended`
// firing with no playback in between, which is ignored.
export const registerEndedEvent = (playerAdapter: PlayerAdapter, reportEvent: ReportEvent): UnregisterEvent => {
  let endedSinceLastPlayback = false;

  const eventPlayingClearCallback = playerAdapter.onPlaying(() => {
    endedSinceLastPlayback = false;
  });
  const eventEndedClearCallback = playerAdapter.onEnded(() => {
    if (endedSinceLastPlayback) {
      return;
    }

    endedSinceLastPlayback = true;
    reportEvent(VIDEO_EVENT.ENDED, {});
  });

  return () => {
    eventPlayingClearCallback();
    eventEndedClearCallback();
  };
};
