import { createViewEndEvent } from './base-events';
import { AnalyticsEvent } from '../types/main';

export const prepareEvents = (collectedEvents: AnalyticsEvent<unknown>[]) => {
  const events = [...collectedEvents, createViewEndEvent()];
  return JSON.stringify(events);
};
