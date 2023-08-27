import { prepareEvents } from '../utils/prepare-events';

export const setupAutomaticDataCollector = (data, flushEvents, sendData) => {
  const sendVideoData = () => {
    const collectedEvents = flushEvents();
    const events = prepareEvents(collectedEvents);

    sendData({
      videoUrl: data.videoUrl,
      userId: data.userId,
      viewId: data.viewId,
      events
    });
  };

  window.addEventListener('beforeunload', sendVideoData);

  return () => {
    window.removeEventListener('beforeunload', sendVideoData);
    sendVideoData();
  };
};
