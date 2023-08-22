import { metadataValidator } from './utils/metadata-validator';
import { initEventsCollector } from './events-collector';
import { getVideoSessionId } from './utils/video-session-id';
import { getUserId } from './utils/user-id';
import { setupManualDataCollector } from './data-collectors/manual-data-collector';
import { setupAutomaticDataCollector } from './data-collectors/automatic-data-collector';
import { getVideoMetadata } from './utils/video-metadata';
import { sendBeaconRequest } from './utils/send-beacon-request';
import { getVideoDeliveredFormat } from './utils/video-delivered-format';
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

    if (videoTrackingSession) {
      throw `Cloudinary video analytics tracking is already connected with this HTML Video Element`;
    }

    // clear previous tracking
    if (videoTrackingSession) {
      videoTrackingSession.clear();
      videoTrackingSession = null;
    }

    // start new tracking
    const videoWatchSessionId = getVideoSessionId();
    const videoWatchSessionEventCollector = createEventsCollector(videoWatchSessionId);
    const dataCollectorRemoval = setupManualDataCollector({
      ...metadata,
      videoUrl: getVideoSource(videoElement),
      videoDeliveredFormat: getVideoDeliveredFormat(videoElement),
      userId: getUserId(),
      videoWatchSessionId,
      videoMetadata: getVideoMetadata(videoElement),
    }, videoWatchSessionEventCollector.flushEvents, sendData);

    videoTrackingSession = {
      videoWatchSessionId,
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
      const videoWatchSessionId = getVideoSessionId();
      const videoWatchSessionEventCollector = createEventsCollector(videoWatchSessionId);
      const dataCollectorRemoval = setupAutomaticDataCollector({
        videoUrl: getVideoSource(videoElement),
        videoDeliveredFormat: getVideoDeliveredFormat(videoElement),
        userId: getUserId(),
        videoWatchSessionId,
        videoMetadata: getVideoMetadata(videoElement),
      }, videoWatchSessionEventCollector.flushEvents, sendData);

      videoTrackingSession = {
        videoWatchSessionId,
        clear: () => {
          videoWatchSessionEventCollector.destroy();
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
    startManuallyNewVideoTracking,
    autoTracking,
  };
};
