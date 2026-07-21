import { VIDEO_EVENT } from '../events.consts';
import type { PlayerAdapter, ReportEvent, UnregisterEvent } from '../types';

// Debounce window: adaptive-bitrate players can fire a burst of `resize` events
// while the ladder settles. We wait for it to quiet down and only report the
// resolution the video actually ended up at.
const RESIZE_DEBOUNCE_MS = 1000;

// The `resize` event fires whenever the decoded video dimensions change, which
// is the native signal for an adaptive-bitrate / resolution switch. We debounce
// the burst and skip no-op changes so a long streaming session cannot flood the
// payload with quality events.
export const registerQualityChangeEvent = (playerAdapter: PlayerAdapter, reportEvent: ReportEvent): UnregisterEvent => {
  let debounceTimerId: ReturnType<typeof setTimeout> | null = null;
  let lastWidth: number | null = null;
  let lastHeight: number | null = null;

  const reportQualityChange = () => {
    debounceTimerId = null;
    const videoWidth = playerAdapter.getVideoWidth();
    const videoHeight = playerAdapter.getVideoHeight();

    if (videoWidth === lastWidth && videoHeight === lastHeight) {
      return;
    }

    lastWidth = videoWidth;
    lastHeight = videoHeight;
    reportEvent(VIDEO_EVENT.QUALITY_CHANGE, { videoWidth, videoHeight });
  };

  const eventResizeClearCallback = playerAdapter.onResize(() => {
    if (debounceTimerId !== null) {
      clearTimeout(debounceTimerId);
    }
    debounceTimerId = setTimeout(reportQualityChange, RESIZE_DEBOUNCE_MS);
  });

  return () => {
    if (debounceTimerId !== null) {
      clearTimeout(debounceTimerId);
      debounceTimerId = null;
    }
    eventResizeClearCallback();
  };
};
