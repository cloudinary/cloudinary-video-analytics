import { registerNativePlayEvent } from './events/play-event';
import { registerNativePauseEvent } from './events/pause-event';
import { registerNativeMetadataEvent } from './events/metadata-event';
import { createEvent } from './utils/create-event';
import { tryInitEvents } from './utils/video-metadata';
import { AnalyticsEvent, AnalyticsEventName } from './types/main';
import { EventMetadataData, EventPauseData, EventPlayData } from './types/events';

export type ReportEvent<EventDetails> = (eventName: AnalyticsEventName, eventDetails: EventDetails) => void;

export const initEventsCollector = (videoElement) => {
  const collectedEvents: Record<string, AnalyticsEvent<unknown>[]> = {};
  const rawEvents: Record<string, AnalyticsEvent<unknown>[]> = {};

  return (viewId, viewStartEvent) => {
    // create new collection of events for new video view
    collectedEvents[viewId] = [];
    rawEvents[viewId] = [viewStartEvent];
    const videoViewCollectedEvents = collectedEvents[viewId];
    const videoViewRawEvents = rawEvents[viewId];

    const reportEventFactory = <T>(): ReportEvent<T> => (eventName, eventDetails) => videoViewRawEvents.push(createEvent(eventName, eventDetails));
    const registeredEvents = [
      registerNativePlayEvent(videoElement, reportEventFactory<EventPlayData>()),
      registerNativePauseEvent(videoElement, reportEventFactory<EventPauseData>()),
      registerNativeMetadataEvent(videoElement, reportEventFactory<EventMetadataData>()),
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
