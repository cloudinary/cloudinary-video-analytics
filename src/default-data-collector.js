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

  const onBeforeUnload = () => sendVideoData();

  const onMobileVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      sendVideoData();
    }
  };
  const onMobilePageHide = () => sendVideoData();

  window.addEventListener('beforeunload', onBeforeUnload, {
    once: true,
  });

  if (isMobile) {
    window.addEventListener('pagehide', onMobilePageHide);
    document.addEventListener('visibilitychange', onMobileVisibilityChange);
  }

  return () => {
    window.removeEventListener('beforeunload', onBeforeUnload);
    window.removeEventListener('pagehide', onMobilePageHide);
    document.removeEventListener('visibilitychange', onMobileVisibilityChange);
    sendVideoData();
  };
};
