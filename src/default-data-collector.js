import { prepareEvents } from './utils/prepare-events';

export const setupDefaultDataCollector = (data, flushEvents, sendData, isMobile) => {
  const sendVideoData = () => {
    const collectedEvents = flushEvents();

    // multiple events can be triggered one by one for specific browsers but we don't have guarantee which ones
    // in this case send data for first event and for rest just skip it to avoid empty payload
    if (collectedEvents.length > 0) {
      const events = prepareEvents(collectedEvents);
      sendData({
        ...data,
        events,
      });
    }
  };

  window.addEventListener('beforeunload', sendVideoData, {
    once: true,
  });

  const onMobileVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      sendVideoData();
    }
  };
  const onMobilePageHide = () => sendVideoData();

  if (isMobile) {
    document.addEventListener('visibilitychange', onMobileVisibilityChange);
    window.addEventListener('pagehide', onMobilePageHide);
  }

  return () => {
    window.removeEventListener('beforeunload', sendVideoData);
    window.addEventListener('pagehide', onMobilePageHide);
    document.removeEventListener('visibilitychange', onMobileVisibilityChange);
    sendVideoData();
  };
};
