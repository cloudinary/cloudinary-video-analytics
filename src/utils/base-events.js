import { isCustomerDataValid, parseCustomerData, parseCustomerVideoData, useCustomerVideoDataFallback } from './customer-data';
import { createEvent } from './create-event';
import { VIEW_EVENT } from '../events.consts';

export const createViewStartEvent = (sourceUrl, baseData, customerOptions) => {
  const customerData = parseCustomerData(customerOptions?.customData);
  const isValidCustomerData = isCustomerDataValid(customerData);
  const customerVideoDataFromFallback = customerOptions?.customVideoUrlFallback ? useCustomerVideoDataFallback(sourceUrl, customerOptions.customVideoUrlFallback) : null;
  const customerVideoData = parseCustomerVideoData(customerVideoDataFromFallback);
  return createEvent(VIEW_EVENT.START, {
    videoUrl: sourceUrl,
    ...baseData,
    customerData: {
      ...(isValidCustomerData ? { providedData: customerData } : {}),
      ...(customerVideoData ? { videoData: customerVideoData } : {}),
    },
  });
};

export const createViewEndEvent = () => {
  return createEvent(VIEW_EVENT.END, {});
};
