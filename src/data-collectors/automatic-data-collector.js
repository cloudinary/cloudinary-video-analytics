import { aggregateEvents, getPlayedTimeSeconds, prepareEvents } from '../utils/events-parser';

export const setupAutomaticDataCollector = (data, flushEvents, sendData) => {
  const sendVideoData = () => {
    const collectedEvents = flushEvents();
    const events = prepareEvents(collectedEvents);
    const { watchedFrames, videoMetadata } = aggregateEvents(events);
    const playedTimeSeconds = getPlayedTimeSeconds(watchedFrames);

    sendData({
      videoUrl: data.videoUrl,
      userId: data.userId,
      viewId: data.viewId,
      playedTimeSeconds,
      videoDuration: videoMetadata.videoDuration,
    });
  };

  window.addEventListener('beforeunload', sendVideoData);

  return () => {
    window.removeEventListener('beforeunload', sendVideoData);
    sendVideoData();
  };
};
