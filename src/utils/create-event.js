export const createEvent = (eventName, eventDetails) => ({
  eventName,
  eventTime: Date.now(),
  eventDetails,
});
