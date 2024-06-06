import { AnalyticsEvent, AnalyticsEventName } from '../types/main';

export const createEvent = <EventName extends AnalyticsEventName, EventDetails>(eventName: EventName, eventDetails: AnalyticsEvent<EventDetails>['eventDetails']) => ({
  eventName,
  eventTime: Date.now(),
  eventDetails,
});
