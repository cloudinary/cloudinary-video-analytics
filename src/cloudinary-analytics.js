import { metadataValidator } from './utils/metadata-validator';
import { initEventsCollector } from './events-collector';
import { getVideoViewId } from './utils/video-view-id';
import { getUserId } from './utils/user-id';
import { setupManualDataCollector } from './data-collectors/manual-data-collector';
import { setupAutomaticDataCollector } from './data-collectors/automatic-data-collector';
import { sendBeaconRequest } from './utils/send-beacon-request';
import { getVideoSource } from './utils/video-source';
import { createEvent } from './utils/create-event';
import { VIEW_EVENT } from './events.consts';
import { isCustomerDataValid, parseCustomerData } from './utils/customer-data';

const CLD_ANALYTICS_ENDPOINT_PRODUCTION_URL = 'https://video-analytics-api.cloudinary.com/video-analytics';
const CLD_ANALYTICS_ENDPOINT_DEVELOPMENT_URL = 'http://localhost:3001/events';
const CLD_ANALYTICS_ENDPOINT_URL = process.env.NODE_ENV === 'development' ? CLD_ANALYTICS_ENDPOINT_DEVELOPMENT_URL : CLD_ANALYTICS_ENDPOINT_PRODUCTION_URL;
const ANALYTICS_VERSION = '1.0.0';

export const connectCloudinaryAnalytics = (videoElement) => {
  let videoTrackingSession = null;
  const createEventsCollector = initEventsCollector(videoElement);
  const sendData = (data) => sendBeaconRequest(CLD_ANALYTICS_ENDPOINT_URL, data);
  const manualTracking = (metadata) => {
    // validate if user provided all necessary metadata (cloud name, public id)
    const metadataValidationResult = metadataValidator(metadata);
    if (!metadataValidationResult.isValid) {
      throw `Cloudinary video analytics tracking called without necessary data (${metadataValidationResult.errorMessage})`;
    }

    if (videoTrackingSession) {
      throw `Cloudinary video analytics tracking is already connected with this HTML Video Element`;
    }

    // clear previous tracking
    if (videoTrackingSession) {
      videoTrackingSession.clear();
      videoTrackingSession = null;
    }

    // start new tracking
    const viewId = getVideoViewId();
    const videoViewEventCollector = createEventsCollector(viewId);
    const dataCollectorRemoval = setupManualDataCollector({
      ...metadata,
      userId: getUserId(),
      viewId,
      analyticsModuleVersion: ANALYTICS_VERSION,
    }, videoViewEventCollector.flushEvents, sendData);

    videoTrackingSession = {
      viewId,
      clear: () => {
        videoViewEventCollector.destroy();
        dataCollectorRemoval();
      },
    };
  };

  const autoTracking = (options = {}) => {
    if (videoTrackingSession) {
      throw `Cloudinary video analytics tracking is already connected with this HTML Video Element`;
    }

    const onNewVideoSource = () => {
      const sourceUrl = videoElement.src;
      if (sourceUrl === window.location.href || !sourceUrl) {
        return null;
      }

      // start event
      const customerData = parseCustomerData(options?.customData);
      const isValidCustomerData = isCustomerDataValid(customerData);
      const customerVideoData = parseCustomerVideoData(options.fallback(sourceUrl));
      const viewStartEvent = createEvent(VIEW_EVENT.START, {
        videoUrl: getVideoSource(videoElement),
        customerData: {
          ...(isValidCustomerData ? { customerData } : {}),
          ...(customerVideoData ),
        },
      });

      // start new tracking
      const viewId = getVideoViewId();
      const videoViewEventCollector = createEventsCollector(viewId, viewStartEvent);
      const dataCollectorRemoval = setupAutomaticDataCollector({
        userId: getUserId(),
        viewId,
        analyticsModuleVersion: ANALYTICS_VERSION,
      }, videoViewEventCollector.flushEvents, sendData);

      videoTrackingSession = {
        viewId,
        clear: () => {
          videoViewEventCollector.destroy();
          dataCollectorRemoval();
        },
      };
    };

    videoElement.addEventListener('loadstart', onNewVideoSource);
    videoElement.addEventListener('emptied', () => {
      if (!videoTrackingSession) {
        return null;
      }

      videoTrackingSession.clear();
      videoTrackingSession = null;
    });

    // start tracking for initial video
    onNewVideoSource();
  };

  return {
    manualTracking,
    autoTracking,
  };
};
