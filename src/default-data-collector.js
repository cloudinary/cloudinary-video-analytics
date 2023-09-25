import { prepareEvents } from './utils/prepare-events';

export const setupDefaultDataCollector = (data, flushEvents, sendData) => {
  const sendVideoData = () => {
    const collectedEvents = flushEvents();
    const events = prepareEvents(collectedEvents);
    sendData({
      ...data,
      events,
    });
  };

  window.addEventListener('beforeunload', sendVideoData);

  return () => {
    window.removeEventListener('beforeunload', sendVideoData);
    sendVideoData();
  };
};
