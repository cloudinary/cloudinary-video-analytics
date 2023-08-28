import { createViewEndEvent } from './base-events';

export const prepareEvents = (collectedEvents) => {
  const events = [...collectedEvents];
  events.push(createViewEndEvent());
  return JSON.stringify(events);
};
