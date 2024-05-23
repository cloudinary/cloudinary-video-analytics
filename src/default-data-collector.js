import { prepareEvents } from './utils/prepare-events';

export const setupDefaultDataCollector = (data, flushEvents, sendData, isMobile) => {
  const sendVideoData = () => {
    const collectedEvents = flushEvents();
    const events = prepareEvents(collectedEvents);
    sendData({
      ...data,
      events,
    });
  };
  const onMobileVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      sendVideoData();
    }
  };

  window.addEventListener('beforeunload', sendVideoData, {
    once: true,
  });

  if (isMobile) {
    document.addEventListener('visibilitychange', onMobileVisibilityChange);
  }

  return () => {
    window.removeEventListener('beforeunload', sendVideoData);
    document.removeEventListener('visibilitychange', onMobileVisibilityChange);
    sendVideoData();
  };
};
