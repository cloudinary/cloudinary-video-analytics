import { isMobile } from 'is-mobile';
import { metadataValidator } from './utils/metadata-validator';
import { initEventsCollector } from './events-collector';
import { getVideoViewId } from './utils/video-view-id';
import { getUserId } from './utils/user-id';
import { setupDefaultDataCollector } from './default-data-collector';
import { sendBeaconRequest } from './utils/send-beacon-request';
import { getVideoSource } from './utils/video-source';
import { createViewStartEvent } from './utils/base-events';
import { AutoTrackingOptions, CloudinaryAnalyticsMainOptions, CustomerVideoData, ManualTrackingOptions } from './types/main';
import { CLD_ANALYTICS_ENDPOINT_DEVELOPMENT_URL, CLD_ANALYTICS_ENDPOINT_PRODUCTION_URL, TRACKING_TYPE } from './constants';

export const CLD_ANALYTICS_ENDPOINT_URL = process.env.NODE_ENV === 'development' ? CLD_ANALYTICS_ENDPOINT_DEVELOPMENT_URL : CLD_ANALYTICS_ENDPOINT_PRODUCTION_URL;
export const connectCloudinaryAnalytics = (videoElement: HTMLVideoElement, mainOptions: CloudinaryAnalyticsMainOptions = {}) => {
  if (mainOptions && typeof mainOptions !== 'object') {
    throw `Options property must be an object`;
  }

  let videoTrackingSession: {
    viewId: string;
    clear: () => void;
  } | null = null;
  const isMobileDetected = isMobile({ tablet: true, featureDetect: true });
  const createEventsCollector = initEventsCollector(videoElement);
  const sendData = <T>(data: T) => sendBeaconRequest(CLD_ANALYTICS_ENDPOINT_URL, data);
  const clearVideoTracking = () => {
    if (videoTrackingSession) {
      videoTrackingSession.clear();
      videoTrackingSession = null;
    }
  };
  const startManualTracking = (metadata: CustomerVideoData, options: ManualTrackingOptions = {}) => {
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
    const viewStartEvent = createViewStartEvent({
      videoUrl: sourceUrl,
      trackingType: TRACKING_TYPE.MANUAL,
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

  const startAutoTracking = (options: AutoTrackingOptions = {}) => {
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
      const viewStartEvent = createViewStartEvent({
        videoUrl: sourceUrl,
        trackingType: TRACKING_TYPE.AUTO,
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

    videoElement.addEventListener('loadstart', () => {
      if (!videoTrackingSession) {
        onNewVideoSource();
      }
    });
    videoElement.addEventListener('emptied', () => {
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
