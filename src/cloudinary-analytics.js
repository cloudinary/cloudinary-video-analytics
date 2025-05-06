import { isMobile } from 'is-mobile';
import { initEventsCollector } from './data-collectors/events-collector';
import { getVideoViewId, getUserId } from './utils/unique-ids';
import { setupDefaultDataCollector } from './data-collectors/default-data-collector';
import { sendBeaconRequest } from './utils/send-beacon-request';
import {
  createRegularVideoViewEndEvent,
  createLiveStreamViewStartEvent,
  createLiveStreamViewEndEvent,
  createRegularVideoViewStartEvent,
  prepareEvents,
} from './utils/events';
import { throwErrorIfInvalid, metadataValidator, mainOptionsValidator, trackingOptionsValidator } from './utils/validators';
import { nativeHtmlVideoPlayerAdapter } from './player-adapters/nativeHtmlVideoPlayerAdapter';
import { setupLiveDataCollector } from './data-collectors/live-data-collector';

const CLD_ANALYTICS_ENDPOINTS_LIST = {
  production: {
    default: 'https://video-analytics-api.cloudinary.com/v1/video-analytics',
    liveStreams: 'https://video-analytics-api.cloudinary.com/v1/video-analytics',
  },
  development: {
    default: 'http://localhost:3001/events',
    liveStreams: 'http://localhost:3001/events',
  },
};
const CLD_ANALYTICS_ENDPOINT = process.env.NODE_ENV === 'development' ? CLD_ANALYTICS_ENDPOINTS_LIST.development : CLD_ANALYTICS_ENDPOINTS_LIST.production;

export const connectCloudinaryAnalytics = (videoElement, mainOptions = {}) => {
  throwErrorIfInvalid(
    mainOptionsValidator(mainOptions),
    'Cloudinary video analytics requires proper options object'
  );

  if (!mainOptions.playerAdapter) {
    mainOptions.playerAdapter = nativeHtmlVideoPlayerAdapter(videoElement);
  }

  let videoTrackingSession = null;
  const userId = getUserId();
  const { playerAdapter } = mainOptions;
  const isMobileDetected = isMobile({ tablet: true, featureDetect: true });
  const createEventsCollector = initEventsCollector(playerAdapter);
  const clearVideoTracking = () => {
    if (videoTrackingSession) {
      videoTrackingSession.clear();
      videoTrackingSession = null;
    }
  };
  const startManualTracking = (metadata, options = {}) => {
    throwErrorIfInvalid(
      metadataValidator(metadata),
      'Cloudinary video analytics manual tracking called without necessary data'
    );
    throwErrorIfInvalid(
      trackingOptionsValidator(options),
      'Cloudinary video analytics manual tracking called with invalid options'
    );

    options.customVideoUrlFallback = () => metadata;
    clearVideoTracking();

    if (metadata.type === 'live') {
      _startManualTrackingLiveStream(metadata, options);
    } else {
      _startManualTrackingRegularVideo(metadata, options);
    }
  };

  const _startManualTrackingRegularVideo = (metadata, options) => {
    const sendData = (data) => sendBeaconRequest(CLD_ANALYTICS_ENDPOINT.default, data);
    const viewId = getVideoViewId();
    const viewStartEvent = createRegularVideoViewStartEvent({
      videoUrl: playerAdapter.getCurrentSrc(),
      trackingType: 'manual',
    }, options);
    const videoViewEventCollector = createEventsCollector(viewId, viewStartEvent);
    const dataCollectorRemoval = setupDefaultDataCollector(
      {
        userId,
        viewId,
      },
      videoViewEventCollector.flushEvents,
      () => createRegularVideoViewEndEvent(),
      sendData,
      isMobileDetected,
    );

    videoTrackingSession = {
      viewId,
      clear: () => {
        videoViewEventCollector.destroy();
        dataCollectorRemoval();
      },
    };
  };
  const _startManualTrackingLiveStream = (metadata, options) => {
    const sendData = (data) => sendBeaconRequest(CLD_ANALYTICS_ENDPOINT.liveStreams, data);
    const viewId = getVideoViewId();

    sendData({
      userId,
      viewId,
      events: prepareEvents([
        createLiveStreamViewStartEvent({
          videoUrl: playerAdapter.getCurrentSrc(),
        }, options),
      ]),
    });
    const dataCollectorRemoval = setupLiveDataCollector(
      {
        userId,
        viewId,
      },
      () => createLiveStreamViewEndEvent({}, options),
      sendData,
      isMobileDetected,
    );

    videoTrackingSession = {
      viewId,
      clear: () => {
        dataCollectorRemoval();
      },
    };
  };

  const startAutoTracking = (options = {}) => {
    if (videoTrackingSession) {
      throw 'Cloudinary video analytics tracking is already connected with this HTML Video Element';
    }

    throwErrorIfInvalid(
      trackingOptionsValidator(options),
      'Cloudinary video analytics manual tracking called with invalid options'
    );

    const sendData = (data) => sendBeaconRequest(CLD_ANALYTICS_ENDPOINT.default, data);
    const onNewVideoSource = () => {
      const sourceUrl = playerAdapter.getCurrentSrc();
      if (sourceUrl === window.location.href || !sourceUrl) {
        return null;
      }

      // start new tracking
      const viewId = getVideoViewId();
      const viewStartEvent = createRegularVideoViewStartEvent({
        videoUrl: playerAdapter.getCurrentSrc(),
        trackingType: 'auto',
      }, options);
      const videoViewEventCollector = createEventsCollector(viewId, viewStartEvent);
      const dataCollectorRemoval = setupDefaultDataCollector(
        {
          userId,
          viewId,
        },
        videoViewEventCollector.flushEvents,
        () => createRegularVideoViewEndEvent(),
        sendData,
        isMobileDetected,
      );

      videoTrackingSession = {
        viewId,
        clear: () => {
          videoViewEventCollector.destroy();
          dataCollectorRemoval();
        },
      };
    };

    playerAdapter.onLoadStart(() => !videoTrackingSession && onNewVideoSource());
    playerAdapter.onEmptied(() => clearVideoTracking());
    onNewVideoSource(); // start tracking for initial video
  };

  return {
    startManualTracking,
    stopManualTracking: clearVideoTracking,
    startAutoTracking,
  };
};
