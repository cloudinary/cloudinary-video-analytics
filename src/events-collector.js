import { registerPlayEvent } from './events/play-event';
import { registerPauseEvent } from './events/pause-event';
import { registerMetadataEvent } from './events/metadata-event';
import { createEvent } from './utils/create-event';
import { tryInitEvents } from './utils/video-metadata';

export const initEventsCollector = (videoElement) => {
  const collectedEvents = {};
  const rawEvents = {};

  return (viewId, viewStartEvent) => {
    // create new collection of events for new video view
    collectedEvents[viewId] = [];
    rawEvents[viewId] = [viewStartEvent];
    const videoViewCollectedEvents = collectedEvents[viewId];
    const videoViewRawEvents = rawEvents[viewId];

    const reportEvent = (eventName, eventDetails) => videoViewRawEvents.push(createEvent(eventName, eventDetails));
    const registeredEvents = [
      registerPlayEvent(videoElement, reportEvent),
      registerPauseEvent(videoElement, reportEvent),
      registerMetadataEvent(videoElement, reportEvent),
    ];
    tryInitEvents(videoElement);
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
