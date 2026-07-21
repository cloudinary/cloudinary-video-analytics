import { registerPlayEvent } from './events/play-event';
import { registerPauseEvent } from './events/pause-event';
import { registerMetadataEvent } from './events/metadata-event';
import { registerStartupEvent } from './events/startup-event';
import { registerEndedEvent } from './events/ended-event';
import { registerBufferingEvent } from './events/buffering-event';
import { registerQualityChangeEvent } from './events/quality-change-event';
import { registerErrorEvent } from './events/error-event';
import { registerFullscreenEvent } from './events/fullscreen-event';
import { registerPictureInPictureEvent } from './events/picture-in-picture-event';
import { createEvent } from './utils/events';
import { VIDEO_EVENT } from './events.consts';
import type { AnalyticsEvent, PlayerAdapter, UnregisterEvent } from './types';

// Hard upper bound on events collected per view. A single beacon must stay well
// under the browser sendBeacon size limit (~64KB across queued beacons); past
// this the browser drops the whole payload. Normal views emit well under 50.
const MAX_EVENTS_PER_VIEW = 250;

export interface EventsCollector {
  flushEvents: () => AnalyticsEvent[];
  getCollectedEventsCount: () => number;
  addEvent: (event: AnalyticsEvent) => void;
  isCollecting: () => boolean;
  finalize: () => void;
  start: (viewId: string) => void;
  destroy: () => void;
}

export const initEventsCollector = (playerAdapter: PlayerAdapter): (() => EventsCollector) => {
  const collectedEvents: Record<string, AnalyticsEvent[]> = {};
  const rawEvents: Record<string, AnalyticsEvent[]> = {};

  return (): EventsCollector => {
    let viewId: string | null = null;
    let truncated = false;
    let finalized = false;
    const registeredEvents: UnregisterEvent[] = [];
    const finalizers: Array<() => void> = [];
    const registerFinalizer = (finalizer: () => void): void => {
      finalizers.push(finalizer);
    };

    const start = (_viewId: string): void => {
      if (viewId) {
        throw new Error('Events collector session already started');
      }

      // create new collection of events for new video view
      viewId = _viewId;
      truncated = false;
      finalized = false;
      // Previous listeners were already removed on destroy(); drop their stale
      // removers so the arrays don't grow across re-views (e.g. mobile tab
      // visibility toggling).
      registeredEvents.length = 0;
      finalizers.length = 0;
      collectedEvents[viewId] = [];
      rawEvents[viewId] = [];
      registeredEvents.push(
        registerPlayEvent(playerAdapter, reportEvent),
        registerPauseEvent(playerAdapter, reportEvent),
        registerMetadataEvent(playerAdapter, reportEvent),
        registerStartupEvent(playerAdapter, reportEvent),
        registerEndedEvent(playerAdapter, reportEvent),
        registerBufferingEvent(playerAdapter, reportEvent, registerFinalizer),
        registerQualityChangeEvent(playerAdapter, reportEvent),
        registerErrorEvent(playerAdapter, reportEvent),
        registerFullscreenEvent(playerAdapter, reportEvent),
        registerPictureInPictureEvent(playerAdapter, reportEvent),
      );
    };
    const destroy = (): void => {
      // Idempotent: a view can be ended more than once (e.g. onPageViewEnd then
      // an explicit stop), so a second destroy is a no-op rather than an error.
      if (!viewId) {
        return;
      }

      registeredEvents.forEach((cb) => cb());
      // The collected/raw events for this view have already been flushed and
      // sent; drop them so the maps don't grow unbounded over a session's views.
      delete collectedEvents[viewId];
      delete rawEvents[viewId];
      viewId = null;
    };
    const reportEvent = (eventName: string, eventDetails: Record<string, unknown>): void => {
      if (!viewId) {
        throw new Error('Events collector session not started');
      }

      const totalCount = collectedEvents[viewId].length + rawEvents[viewId].length;
      if (totalCount >= MAX_EVENTS_PER_VIEW) {
        // Drop further events, but emit a single marker so the backend can tell
        // the view's data was capped rather than genuinely complete.
        if (!truncated) {
          truncated = true;
          rawEvents[viewId].push(createEvent(VIDEO_EVENT.TRUNCATED, { limit: MAX_EVENTS_PER_VIEW }));
        }
        return;
      }

      rawEvents[viewId].push(createEvent(eventName, eventDetails));
    };
    // Give registrars a chance to contribute an end-of-view summary. Runs once
    // per view; the core calls it before adding the viewEnd event, and
    // flushEvents calls it as a fallback in case it was not invoked explicitly.
    const finalize = (): void => {
      if (finalized) {
        return;
      }
      finalized = true;
      finalizers.forEach((finalizer) => finalizer());
    };
    const flushEvents = (): AnalyticsEvent[] => {
      if (!viewId) {
        throw new Error('Events collector session not started');
      }

      finalize();

      const events = rawEvents[viewId].splice(0, rawEvents[viewId].length);
      collectedEvents[viewId].splice(collectedEvents[viewId].length, 0, ...events);
      return events;
    };

    const getCollectedEventsCount = (): number => {
      if (viewId) {
        return rawEvents[viewId]?.length || 0;
      }

      return 0;
    };

    return {
      flushEvents,
      getCollectedEventsCount,
      addEvent: ({ eventName, eventDetails }: AnalyticsEvent) => reportEvent(eventName, eventDetails),
      isCollecting: () => viewId !== null,
      finalize,
      start,
      destroy,
    };
  };
};
