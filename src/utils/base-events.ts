import { isProvidedDataValid, parseProvidedData, parseCustomerVideoData, useCustomerVideoDataFallback } from './customer-data';
import { createEvent } from './create-event';
import { getVideoPlayerType, getVideoPlayerVersion } from './video-player-options';
import { VIEW_EVENT } from '../constants';
import { CustomerOptions } from '../types/main';
import { EventViewEndData, EventViewStartData } from '../types/events';

export interface ViewStartEventBaseData {
  videoUrl: string;
  trackingType: 'manual' | 'auto';
}

export const createViewStartEvent = (baseData: ViewStartEventBaseData, customerOptions: CustomerOptions) => {
  const providedData = parseProvidedData(customerOptions.providedData);
  const isValidProvidedData = isProvidedDataValid(providedData);
  const customerVideoDataFromFallback = customerOptions.customVideoUrlFallback ? useCustomerVideoDataFallback(baseData.videoUrl, customerOptions.customVideoUrlFallback) : null;
  const customerVideoData = parseCustomerVideoData(customerVideoDataFromFallback);
  return createEvent<typeof VIEW_EVENT.START, EventViewStartData>(VIEW_EVENT.START, {
    ...baseData,
    analyticsModuleVersion: ANALYTICS_VERSION,
    videoPlayer: {
      type: getVideoPlayerType(customerOptions?.videoPlayerType),
      version: getVideoPlayerVersion(customerOptions?.videoPlayerVersion),
    },
    customerData: {
      ...(isValidProvidedData ? { providedData } : {}),
      ...(customerVideoData ? { videoData: customerVideoData } : {}),
    },
  });
};

export const createViewEndEvent = () => {
  return createEvent<typeof VIEW_EVENT.END, EventViewEndData>(VIEW_EVENT.END, {});
};
