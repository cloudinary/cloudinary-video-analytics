import { isCustomDataValid, parseCustomData, parseCustomerVideoData, useCustomerVideoDataFallback } from './customer-data';
import { createEvent } from './create-event';
import { getVideoPlayerType, getVideoPlayerVersion } from './video-player-options';
import { VIEW_EVENT } from '../events.consts';

export const createViewStartEvent = (sourceUrl, baseData, customerOptions) => {
  const customData = parseCustomData(customerOptions?.customData);
  const isValidCustomData = isCustomDataValid(customData);
  const customerVideoDataFromFallback = customerOptions?.customVideoUrlFallback ? useCustomerVideoDataFallback(sourceUrl, customerOptions.customVideoUrlFallback) : null;
  const customerVideoData = parseCustomerVideoData(customerVideoDataFromFallback);
  return createEvent(VIEW_EVENT.START, {
    videoUrl: sourceUrl,
    analyticsModuleVersion: ANALYTICS_VERSION,
    videoPlayer: {
      type: getVideoPlayerType(customerOptions?.videoPlayerType),
      version: getVideoPlayerVersion(customerOptions?.videoPlayerVersion),
    },
    ...baseData,
    customerData: {
      ...(isValidCustomData ? { providedData: customData } : {}),
      ...(customerVideoData ? { videoData: customerVideoData } : {}),
    },
  });
};

export const createViewEndEvent = () => {
  return createEvent(VIEW_EVENT.END, {});
};
