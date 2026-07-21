import { isMobile } from 'is-mobile';
import { initEventsCollector } from './events-collector';
import type { EventsCollector } from './events-collector';
import { getVideoViewId, getUserId } from './utils/unique-ids';
import { sendBeaconRequest } from './utils/send-beacon-request';
import {
  createRegularVideoViewEndEvent,
  createLiveStreamViewStartEvent,
  createLiveStreamViewEndEvent,
  createRegularVideoViewStartEvent,
  prepareEvents,
} from './utils/events';
import { throwErrorIfInvalid, metadataValidator, mainOptionsValidator, trackingOptionsValidator, customEventValidator } from './utils/validators';
import { nativeHtmlVideoPlayerAdapter } from './player-adapters/nativeHtmlVideoPlayerAdapter';
import { parseCustomerVideoData } from './utils/customer-data';
import { createPageTracker } from './utils/page-events';
import { CUSTOM_EVENT } from './events.consts';
import type { MainOptions, TrackingOptions, VideoMetadata } from './types';

interface AnalyticsEndpoints {
  default: string;
  liveStreams: string;
}

interface ViewIdRef {
  _value: string;
  getValue: () => string;
  regenerateValue: () => string;
}

interface VideoTrackingSession {
  viewId: ViewIdRef | string;
  type: 'auto' | 'manual';
  subtype?: 'default' | 'live-stream';
  clear: () => void;
}

export interface CloudinaryAnalytics {
  startManualTracking: (metadata: VideoMetadata, options?: TrackingOptions) => void;
  stopManualTracking: () => void;
  startAutoTracking: (options?: TrackingOptions) => void;
  stopAutoTracking: () => void;
  /** Stops whichever tracking (manual or auto) is currently active. */
  stopTracking: () => void;
  /**
   * Reports a consumer-defined event into the current video view (e.g. an
   * "on screen" / viewability signal from a player integration). It is attached
   * to the active view and shipped in the same payload, so it can be correlated
   * with built-in events by time. No-op when no view is currently being tracked.
   */
  reportCustomEvent: (name: string, data?: Record<string, unknown>) => void;
}

const CLD_ANALYTICS_ENDPOINTS_LIST: Record<'production' | 'development', AnalyticsEndpoints> = {
  production: {
    default: 'https://video-analytics-api.cloudinary.com/v1/video-analytics',
    liveStreams: 'https://video-analytics-api.cloudinary.com/v1/live-streams',
  },
  development: {
    default: 'http://localhost:3001/events',
    liveStreams: 'http://localhost:3001/events',
  },
};
const CLD_ANALYTICS_ENDPOINT = process.env.NODE_ENV === 'development' ? CLD_ANALYTICS_ENDPOINTS_LIST.development : CLD_ANALYTICS_ENDPOINTS_LIST.production;

export const connectCloudinaryAnalytics = (
  videoElement: HTMLVideoElement,
  mainOptions: MainOptions = {},
): CloudinaryAnalytics => {
  throwErrorIfInvalid(
    mainOptionsValidator(mainOptions),
    'Cloudinary video analytics requires proper options object'
  );

  if (!mainOptions.playerAdapter) {
    mainOptions.playerAdapter = nativeHtmlVideoPlayerAdapter(videoElement);
  }

  let videoTrackingSession: VideoTrackingSession | null = null;
  // Points at the collector of the currently tracked view (regular/auto only),
  // so custom events can be attached to it. Null for live streams and when no
  // view is active.
  let activeEventCollector: EventsCollector | null = null;
  const userId = getUserId();
  const playerAdapter = mainOptions.playerAdapter;
  const isMobileDetected = isMobile({ tablet: true, featureDetect: true });
  const createEventsCollector = initEventsCollector(playerAdapter);
  const clearVideoTracking = (): void => {
    if (videoTrackingSession) {
      videoTrackingSession.clear();
      videoTrackingSession = null;
    }
    activeEventCollector = null;
  };

  const reportCustomEvent = (name: string, data: Record<string, unknown> = {}): void => {
    throwErrorIfInvalid(
      customEventValidator(name, data),
      'Cloudinary video analytics custom event is invalid'
    );

    // Only attributable while a view is actively collecting; otherwise ignored.
    if (activeEventCollector?.isCollecting()) {
      activeEventCollector.addEvent({
        eventName: CUSTOM_EVENT,
        eventTime: Date.now(),
        eventDetails: { name, data },
      });
    }
  };
  const viewId: ViewIdRef = {
    _value: getVideoViewId(),
    getValue: () => viewId._value,
    regenerateValue: () => {
      viewId._value = getVideoViewId();

      if (videoTrackingSession) {
        videoTrackingSession.viewId = viewId._value;
      }

      return viewId._value;
    },
  };

  const startManualTracking = (metadata: VideoMetadata, options: TrackingOptions = {}): void => {
    if (videoTrackingSession?.type === 'auto') {
      throw 'Cloudinary video analytics auto tracking is already connected with this HTML Video Element, to start manual tracking you need to stop auto tracking';
    }

    throwErrorIfInvalid(
      metadataValidator(metadata),
      'Cloudinary video analytics manual tracking called without necessary data'
    );
    throwErrorIfInvalid(
      trackingOptionsValidator(options),
      'Cloudinary video analytics manual tracking called with invalid options'
    );

    clearVideoTracking();

    if (metadata.type === 'live') {
      _startManualTrackingLiveStream(metadata, options);
    } else {
      options.customVideoUrlFallback = options.customVideoUrlFallback || (() => metadata);
      _startManualTrackingRegularVideo(metadata, options);
    }
  };

  const _startManualTrackingRegularVideo = (_metadata: VideoMetadata, options: TrackingOptions): void => {
    const sendData = (data: Record<string, unknown>) => sendBeaconRequest(CLD_ANALYTICS_ENDPOINT.default, data);
    const videoViewEventCollector = createEventsCollector();
    activeEventCollector = videoViewEventCollector;
    const finishVideoTracking = () => {
      // multiple events can be triggered one by one for specific browsers but we don't have guarantee which ones
      // in this case send data for first event and for rest just skip it to avoid empty payload
      if (videoViewEventCollector.getCollectedEventsCount() > 0) {
        // Let registrars emit their end-of-view summaries before viewEnd, so
        // viewEnd remains the last event in the payload.
        videoViewEventCollector.finalize();
        videoViewEventCollector.addEvent(createRegularVideoViewEndEvent());
        const events = prepareEvents([...videoViewEventCollector.flushEvents()]);
        sendData({
          userId,
          viewId: viewId.getValue(),
          events,
        });
      }
    };

    const pageEventsRemoval = createPageTracker({
      onPageViewStart: () => {
        viewId.regenerateValue();

        videoViewEventCollector.start(viewId.getValue());
        videoViewEventCollector.addEvent(
          createRegularVideoViewStartEvent({
            videoUrl: playerAdapter.getCurrentSrc(),
            trackingType: 'manual',
          }, options)
        );
      },
      onPageViewEnd: () => {
        finishVideoTracking();
        videoViewEventCollector.destroy();
      },
    }, isMobileDetected);

    videoTrackingSession = {
      viewId,
      type: 'manual',
      subtype: 'default',
      clear: () => {
        finishVideoTracking();
        videoViewEventCollector.destroy();
        pageEventsRemoval();
      },
    };
  };
  const _startManualTrackingLiveStream = (metadata: VideoMetadata, options: TrackingOptions): void => {
    // Live streams don't use an events collector (events are sent immediately),
    // so custom events are not attributable here.
    activeEventCollector = null;
    const liveStreamData = parseCustomerVideoData(metadata);
    const sendLiveStreamEvent = (event: ReturnType<typeof createLiveStreamViewStartEvent>) => {
      sendBeaconRequest(CLD_ANALYTICS_ENDPOINT.liveStreams, {
        userId,
        viewId: viewId.getValue(),
        events: prepareEvents([event]),
      });
    };
    const pageEventsRemoval = createPageTracker({
      onPageViewStart: () => {
        viewId.regenerateValue();

        sendLiveStreamEvent(
          createLiveStreamViewStartEvent({ liveStreamData }, options)
        );
      },
      onPageViewEnd: () => {
        sendLiveStreamEvent(
          createLiveStreamViewEndEvent({ liveStreamData }, options)
        );
      },
    }, isMobileDetected);

    videoTrackingSession = {
      viewId: viewId.getValue(),
      type: 'manual',
      subtype: 'live-stream',
      clear: () => {
        pageEventsRemoval();
      },
    };
  };

  const startAutoTracking = (options: TrackingOptions = {}): void => {
    if (videoTrackingSession) {
      throw 'Cloudinary video analytics tracking is already connected with this HTML Video Element';
    }

    throwErrorIfInvalid(
      trackingOptionsValidator(options),
      'Cloudinary video analytics auto tracking called with invalid options'
    );

    const sendData = (data: Record<string, unknown>) => sendBeaconRequest(CLD_ANALYTICS_ENDPOINT.default, data);
    const videoViewEventCollector = createEventsCollector();
    activeEventCollector = videoViewEventCollector;

    const finishVideoTracking = () => {
      // multiple events can be triggered one by one for specific browsers but we don't have guarantee which ones
      // in this case send data for first event and for rest just skip it to avoid empty payload
      if (videoViewEventCollector.getCollectedEventsCount() > 0) {
        // Let registrars emit their end-of-view summaries before viewEnd, so
        // viewEnd remains the last event in the payload.
        videoViewEventCollector.finalize();
        videoViewEventCollector.addEvent(createRegularVideoViewEndEvent());
        const events = prepareEvents([...videoViewEventCollector.flushEvents()]);
        sendData({
          userId,
          viewId: viewId.getValue(),
          events,
        });
      }
    };

    const startVideoTracking = (): null | void => {
      const sourceUrl = playerAdapter.getCurrentSrc();
      if (sourceUrl === window.location.href || !sourceUrl) {
        return null;
      }

      viewId.regenerateValue();
      videoViewEventCollector.start(viewId.getValue());
      videoViewEventCollector.addEvent(
        createRegularVideoViewStartEvent({
          videoUrl: sourceUrl,
          trackingType: 'auto',
        }, options)
      );

      videoTrackingSession = {
        viewId,
        type: 'auto',
        clear: () => {
          finishVideoTracking();
          videoViewEventCollector.destroy();
        },
      };
    };

    createPageTracker({
      onPageViewStart: () => startVideoTracking(),
      onPageViewEnd: () => {
        finishVideoTracking();
        videoViewEventCollector.destroy();
      },
    }, isMobileDetected);

    // TODO: check if we need to listen also on loadmetadata to make sure source url is available
    playerAdapter.onLoadStart(() => !videoTrackingSession && startVideoTracking());
    playerAdapter.onEmptied(() => clearVideoTracking());
  };

  return {
    startManualTracking,
    stopManualTracking: clearVideoTracking,
    startAutoTracking,
    stopAutoTracking: clearVideoTracking,
    stopTracking: clearVideoTracking,
    reportCustomEvent,
  };
};
