import { isCustomDataValid, parseCustomData, parseCustomerVideoData, useCustomerVideoDataFallback } from './customer-data';
import { VIEW_EVENT } from '../events.consts';
import { getVideoPlayerType, getVideoPlayerVersion } from './video-player-options';
import type { AnalyticsEvent, CustomerVideoData, TrackingOptions } from '../types';

interface RegularViewStartBaseData {
  videoUrl: string;
  trackingType: 'auto' | 'manual';
}

interface LiveStreamViewBaseData {
  liveStreamData: CustomerVideoData | null;
}

export const createRegularVideoViewStartEvent = (
  baseData: RegularViewStartBaseData,
  customerOptions?: TrackingOptions,
): AnalyticsEvent => {
  const customData = parseCustomData(customerOptions?.customData);
  const isValidCustomData = isCustomDataValid(customData);
  const customerVideoDataFromFallback = customerOptions?.customVideoUrlFallback
    ? useCustomerVideoDataFallback(baseData.videoUrl, customerOptions.customVideoUrlFallback)
    : null;
  const customerVideoData = parseCustomerVideoData(customerVideoDataFromFallback);
  return createEvent(VIEW_EVENT.START, {
    ...baseData,
    analyticsModuleVersion: ANALYTICS_VERSION,
    videoPlayer: {
      type: getVideoPlayerType(customerOptions?.videoPlayerType),
      version: getVideoPlayerVersion(customerOptions?.videoPlayerVersion),
    },
    customerData: {
      ...(isValidCustomData ? { providedData: customData } : {}),
      ...(customerVideoData ? { videoData: customerVideoData } : {}),
    },
  });
};

export const createRegularVideoViewEndEvent = (
  baseData: Record<string, unknown> = {},
): AnalyticsEvent => {
  return createEvent(VIEW_EVENT.END, { ...baseData });
};

export const createLiveStreamViewStartEvent = (
  baseData: LiveStreamViewBaseData,
  customerOptions?: TrackingOptions,
): AnalyticsEvent => {
  return createEvent(VIEW_EVENT.START, {
    ...baseData,
    analyticsModuleVersion: ANALYTICS_VERSION,
    videoPlayer: {
      type: getVideoPlayerType(customerOptions?.videoPlayerType),
      version: getVideoPlayerVersion(customerOptions?.videoPlayerVersion),
    },
  });
};

export const createLiveStreamViewEndEvent = (
  baseData: LiveStreamViewBaseData,
  _customerOptions?: TrackingOptions,
): AnalyticsEvent => {
  return createEvent(VIEW_EVENT.END, { ...baseData });
};

export const createEvent = (
  eventName: string,
  eventDetails: Record<string, unknown>,
): AnalyticsEvent => ({
  eventName,
  eventTime: Date.now(),
  eventDetails,
});

export const prepareEvents = (collectedEvents: AnalyticsEvent[]): string => {
  const events = [...collectedEvents];
  return JSON.stringify(events);
};
