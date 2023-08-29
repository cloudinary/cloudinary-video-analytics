import { registerPlayEvent } from './events/play-event';
import { registerPauseEvent } from './events/pause-event';
import { registerMetadataEvent } from './events/metadata-event';

export const initEventsCollector = (videoElement) => {
  const collectedEvents = {};
  const rawEvents = {};

  return (videoSessionId) => {
    // create new collection of events for new video session
    collectedEvents[videoSessionId] = [];
    rawEvents[videoSessionId] = [];
    const videoWatchSessionCollectedEvents = collectedEvents[videoSessionId];
    const videoWatchSessionRawEvents = rawEvents[videoSessionId];

    const reportEvent = (eventName, eventDetails) => {
      videoWatchSessionRawEvents.push({
        eventName,
        eventDetails,
      });
    };
    const registeredEvents = [
      registerPlayEvent(videoElement, reportEvent),
      registerPauseEvent(videoElement, reportEvent),
      registerMetadataEvent(videoElement, reportEvent),
    ];
    const flushEvents = () => {
      const events = videoWatchSessionRawEvents.splice(0, videoWatchSessionRawEvents.length);
      videoWatchSessionCollectedEvents.splice(videoWatchSessionCollectedEvents.length, 0, ...events);
      return events;
    };
    const getAllEvents = () => videoWatchSessionCollectedEvents;
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
