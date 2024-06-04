import { registerNativePlayEvent, registerCustomPlayEvent } from './events/play-event';
import { registerNativePauseEvent, registerCustomPauseEvent } from './events/pause-event';
import { registerNativeMetadataEvent, registerCustomMetadataEvent } from './events/metadata-event';
import { createEvent } from './utils/create-event';
import { tryInitEvents } from './utils/video-metadata';

export const initEventsCollector = (videoElement, shouldUseCustomEvents) => {
  const collectedEvents = {};
  const rawEvents = {};

  return (viewId, viewStartEvent) => {
    // create new collection of events for new video view
    collectedEvents[viewId] = [];
    rawEvents[viewId] = [viewStartEvent];
    const videoViewCollectedEvents = collectedEvents[viewId];
    const videoViewRawEvents = rawEvents[viewId];

    const reportEvent = (eventName, eventDetails) => videoViewRawEvents.push(createEvent(eventName, eventDetails));
    const registeredEvents = shouldUseCustomEvents ? [
      registerCustomPlayEvent(videoElement, reportEvent),
      registerCustomPauseEvent(videoElement, reportEvent),
      registerCustomMetadataEvent(videoElement, reportEvent),
    ] : [
      registerNativePlayEvent(videoElement, reportEvent),
      registerNativePauseEvent(videoElement, reportEvent),
      registerNativeMetadataEvent(videoElement, reportEvent),
    ];
    tryInitEvents(videoElement, shouldUseCustomEvents);
    const flushEvents = () => {
      const events = videoViewRawEvents.splice(0, videoViewRawEvents.length);
      videoViewCollectedEvents.splice(videoViewCollectedEvents.length, 0, ...events);
      return events;
    };
    const getAllEvents = () => videoViewCollectedEvents;
    const destroy = () => {
      registeredEvents.forEach((cb) => cb());
    };

    return {
      flushEvents,
      getAllEvents,
      destroy,
    };
  }
};
