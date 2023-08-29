import { VIDEO_EVENT } from '../events.consts';

// prepare events list for aggregation, for example
// if video is being played and user wants to leave the page - add "pause" event to correctly calculate played time
export const prepareEvents = (collectedEvents) => {
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

export const aggregateEvents = (eventsList) => {
  return eventsList.reduce((acc, event) => {
    const lastItem = acc.watchedFrames[acc.watchedFrames.length - 1];
    const eventTime = event.eventDetails.time;

    if (event.eventName === VIDEO_EVENT.LOADED_METADATA) {
      acc.videoMetadata.videoDuration = event.eventDetails.videoDuration;
    } else if (event.eventName === VIDEO_EVENT.PLAY) {
      acc.watchedFrames.push([eventTime]);
    } else if (lastItem && lastItem.length === 1 && event.eventName === VIDEO_EVENT.PAUSE) {
      lastItem.push(eventTime);
    }

    return acc;
  }, {
    watchedFrames: [],
    videoMetadata: {
      videoDuration: null,
    },
  });
};

export const getPlayedTimeSeconds = (watchedFrames) => {
  return Math.round(watchedFrames.reduce((acc, [playTime, pauseTime]) => {
    return acc + ((pauseTime - playTime) / 1000);
  }, 0));
};
