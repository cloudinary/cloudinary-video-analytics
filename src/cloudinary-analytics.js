import { isMobile } from 'is-mobile';
import { metadataValidator } from './utils/metadata-validator';
import { initEventsCollector } from './events-collector';
import { getVideoViewId } from './utils/video-view-id';
import { getUserId } from './utils/user-id';
import { setupDefaultDataCollector } from './default-data-collector';
import { sendBeaconRequest } from './utils/send-beacon-request';
import { getVideoSource } from './utils/video-source';
import { createViewStartEvent } from './utils/base-events';
import { VIDEO_CUSTOM_EVENT_PREFIX } from './events.consts';

const CLD_ANALYTICS_ENDPOINT_PRODUCTION_URL = 'https://video-analytics-api.cloudinary.com/v1/video-analytics';
const CLD_ANALYTICS_ENDPOINT_DEVELOPMENT_URL = 'http://localhost:3001/events';
const CLD_ANALYTICS_ENDPOINT_URL = process.env.NODE_ENV === 'development' ? CLD_ANALYTICS_ENDPOINT_DEVELOPMENT_URL : CLD_ANALYTICS_ENDPOINT_PRODUCTION_URL;

export const connectCloudinaryAnalytics = (videoElement, mainOptions = {}) => {
  if (mainOptions && typeof mainOptions !== 'object') {
    throw `Options property must be an object`;
  }

  let videoTrackingSession = null;
  const shouldUseCustomEvents = mainOptions.customEvents === true;
  const isMobileDetected = isMobile({ tablet: true, featureDetect: true });
  const createEventsCollector = initEventsCollector(videoElement, shouldUseCustomEvents);
  const sendData = (data) => sendBeaconRequest(CLD_ANALYTICS_ENDPOINT_URL, data);
  const clearVideoTracking = () => {
    if (videoTrackingSession) {
      videoTrackingSession.clear();
      videoTrackingSession = null;
    }
  };
  const startManualTracking = (metadata, options = {}) => {
    // validate if user provided all necessary metadata (cloud name, public id)
    const metadataValidationResult = metadataValidator(metadata);
    if (!metadataValidationResult.isValid) {
      throw `Cloudinary video analytics tracking called without necessary data (${metadataValidationResult.errorMessage})`;
    }

    if (options && typeof options !== 'object') {
      throw `Options property must be an object`;
    }

    options.customVideoUrlFallback = () => metadata;
    clearVideoTracking();

    // start new tracking
    const viewId = getVideoViewId();
    const sourceUrl = getVideoSource(videoElement);
    const viewStartEvent = createViewStartEvent(sourceUrl, {
      trackingType: 'manual',
    }, options);
    const videoViewEventCollector = createEventsCollector(viewId, viewStartEvent);
    const dataCollectorRemoval = setupDefaultDataCollector({
      userId: getUserId(),
      viewId,
    }, videoViewEventCollector.flushEvents, sendData, isMobileDetected);

    videoTrackingSession = {
      viewId,
      clear: () => {
        videoViewEventCollector.destroy();
        dataCollectorRemoval();
      },
    };
  };

  const startAutoTracking = (options = {}) => {
    if (videoTrackingSession) {
      throw `Cloudinary video analytics tracking is already connected with this HTML Video Element`;
    }

    if (options && typeof options !== 'object') {
      throw `Options property must be an object`;
    }

    const onNewVideoSource = () => {
      const sourceUrl = getVideoSource(videoElement);
      if (sourceUrl === window.location.href || !sourceUrl) {
        return null;
      }

      // start new tracking
      const viewId = getVideoViewId();
      const viewStartEvent = createViewStartEvent(sourceUrl, {
        trackingType: 'auto',
      }, options);
      const videoViewEventCollector = createEventsCollector(viewId, viewStartEvent);
      const dataCollectorRemoval = setupDefaultDataCollector({
        userId: getUserId(),
        viewId,
      }, videoViewEventCollector.flushEvents, sendData, isMobileDetected);

      videoTrackingSession = {
        viewId,
        clear: () => {
          videoViewEventCollector.destroy();
          dataCollectorRemoval();
        },
      };
    };
    const loadStartEventName = shouldUseCustomEvents ? `${VIDEO_CUSTOM_EVENT_PREFIX}loadstart` : 'loadstart';
    const emptiedEventName = shouldUseCustomEvents ? `${VIDEO_CUSTOM_EVENT_PREFIX}emptied` : 'emptied';

    videoElement.addEventListener(loadStartEventName, () => {
      if (!videoTrackingSession) {
        onNewVideoSource();
      }
    });
    videoElement.addEventListener(emptiedEventName, () => {
      clearVideoTracking();
    });

    // start tracking for initial video
    onNewVideoSource();
  };

  return {
    startManualTracking,
    stopManualTracking: clearVideoTracking,
    startAutoTracking,
  };
};
