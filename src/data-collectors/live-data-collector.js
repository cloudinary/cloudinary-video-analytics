import { prepareEvents } from '../utils/events';

export const setupLiveDataCollector = (viewSessionData, createEndEvent, sendData, isMobile) => {
  const sendVideoData = () => {
    const events = prepareEvents([createEndEvent()]);
    sendData({
      ...viewSessionData,
      events,
    });
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
