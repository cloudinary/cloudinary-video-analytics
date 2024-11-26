import { createViewEndEvent } from './base-events';
import { getVideoSource } from './video-source';

export const prepareEvents = (collectedEvents, videoElement) => {
  const sourceUrl = getVideoSource(videoElement);
  const viewEndEvent = createViewEndEvent(sourceUrl);
  const events = [...collectedEvents, viewEndEvent];
  return JSON.stringify(events);
};
