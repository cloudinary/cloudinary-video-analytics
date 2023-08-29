import { metadataValidator } from './utils/metadata-validator';
import { initEventsCollector } from './events-collector';
import { getVideoViewId } from './utils/video-view-id';
import { getUserId } from './utils/user-id';
import { setupManualDataCollector } from './data-collectors/manual-data-collector';
import { setupAutomaticDataCollector } from './data-collectors/automatic-data-collector';
import { sendBeaconRequest } from './utils/send-beacon-request';
import { getVideoSource } from './utils/video-source';

const CLD_ANALYTICS_ENDPOINT_PRODUCTION_URL = 'https://video-analytics-api.cloudinary.com/video-analytics';
const CLD_ANALYTICS_ENDPOINT_DEVELOPMENT_URL = 'http://localhost:3001/events';
const CLD_ANALYTICS_ENDPOINT_URL = process.env.NODE_ENV === 'development' ? CLD_ANALYTICS_ENDPOINT_DEVELOPMENT_URL : CLD_ANALYTICS_ENDPOINT_PRODUCTION_URL;

export const connectCloudinaryAnalytics = (videoElement) => {
  let videoTrackingSession = null;
  const createEventsCollector = initEventsCollector(videoElement);
  const sendData = (data) => sendBeaconRequest(CLD_ANALYTICS_ENDPOINT_URL, data);
  const startManuallyNewVideoTracking = (metadata) => {
    // validate if user provided all necessary metadata (cloud name, public id)
    const metadataValidationResult = metadataValidator(metadata);
    if (!metadataValidationResult.isValid) {
      throw `Cloudinary video analytics tracking called without necessary data (${metadataValidationResult.errorMessage})`;
    }

    // clear previous tracking
    if (videoTrackingSession) {
      videoTrackingSession.clear();
      videoTrackingSession = null;
    }

    // start new tracking
    const viewId = getVideoViewId();
    const videoWatchSessionEventCollector = createEventsCollector(viewId);
    const dataCollectorRemoval = setupManualDataCollector({
      ...metadata,
      videoUrl: getVideoSource(videoElement),
      userId: getUserId(),
      viewId,
    }, videoWatchSessionEventCollector.flushEvents, sendData);

    videoTrackingSession = {
      viewId,
      clear: () => {
        videoWatchSessionEventCollector.destroy();
        dataCollectorRemoval();
      },
    };
  };

  const autoTracking = () => {
    if (videoTrackingSession) {
      throw `Cloudinary video analytics tracking is already connected with this HTML Video Element`;
    }

    const onNewVideoSource = () => {
      const sourceUrl = videoElement.src;
      if (sourceUrl === window.location.href || !sourceUrl) {
        return null;
      }

      // start new tracking
      const viewId = getVideoViewId();
      const videoWatchSessionEventCollector = createEventsCollector(viewId);
      const dataCollectorRemoval = setupAutomaticDataCollector({
        videoUrl: getVideoSource(videoElement),
        userId: getUserId(),
        viewId,
      }, videoWatchSessionEventCollector.flushEvents, sendData);

      videoTrackingSession = {
        viewId,
        clear: () => {
          videoWatchSessionEventCollector.destroy();
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
    startManuallyNewVideoTracking,
    autoTracking,
  };
};
