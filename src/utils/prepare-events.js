import { VIEW_EVENT } from '../events.consts';
import { createEvent } from './create-event';

export const prepareEvents = (collectedEvents) => {
  const events = [...collectedEvents];
  events.push(createEvent(VIEW_EVENT.END, {}));
  return JSON.stringify(events);
};
