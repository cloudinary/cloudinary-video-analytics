import { VIDEO_EVENT } from '../events.consts';

// prepare events list for aggregation, for example
// if video is being played and user wants to leave the page - add "pause" event to correctly calculate played time
const prepareEvents = (collectedEvents) => {
  const events = [...collectedEvents];
  const lastPlayItemIndex = events.findLastIndex(({ eventName }) => eventName === VIDEO_EVENT.PLAY);
  const lastPauseItemIndex = events.findLastIndex(({ eventName }) => eventName === VIDEO_EVENT.PAUSE);

  if (lastPlayItemIndex > lastPauseItemIndex) {
    events.push({
      eventName: VIDEO_EVENT.PAUSE,
      eventDetails: {
        time: Date.now(),
      },
    });
  }

  return events;
};

const aggregateEvents = (eventsList) => {
  return eventsList.reduce((acc, event) => {
    const lastItem = acc.watchedFrames[acc.watchedFrames.length - 1];
    const eventTime = event.eventDetails.time;

    if (event.eventName === VIDEO_EVENT.PLAY) {
      acc.watchedFrames.push([eventTime]);
    } else if (lastItem && lastItem.length === 1 && event.eventName === VIDEO_EVENT.PAUSE) {
      lastItem.push(eventTime);
    }

    return acc;
  }, {
    watchedFrames: []
  });
};

const getPlayedTimeSeconds = (watchedFrames) => {
  return Math.round(watchedFrames.reduce((acc, [playTime, pauseTime]) => {
    return acc + ((pauseTime - playTime) / 1000);
  }, 0));
};
export const setupManualDataCollector = (data, flushEvents, sendData) => {
  const sendVideoData = () => {
    const collectedEvents = flushEvents();
    const events = prepareEvents(collectedEvents);
    const { watchedFrames } = aggregateEvents(events);
    const playedTimeSeconds = getPlayedTimeSeconds(watchedFrames);

    sendData({
      videoUrl: data.videoUrl,
      userId: data.userId,
      cloudName: data.cloudName,
      videoPublicId: data.publicId,
      viewId: data.viewId,
      playedTimeSeconds,
      videoDuration: data.videoMetadata.videoDuration,
    });
  };

  window.addEventListener('beforeunload', sendVideoData);

  return () => {
    window.removeEventListener('beforeunload', sendVideoData);
    sendVideoData();
  };
};
