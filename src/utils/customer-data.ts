import type { CustomData, CustomerVideoData, TrackingOptions } from '../types';

const CUSTOMER_DATA_CHARS_LIMIT = 1000;

const filterOutNonStrings = (data: Record<string, unknown>): CustomData => {
  return Array.from({ length: 5 }).reduce<CustomData>((obj, _cv, currentIndex) => {
    const key = `customData${currentIndex + 1}` as keyof CustomData;

    if (typeof data[key] === 'string') {
      obj[key] = data[key] as string;
    }

    return obj;
  }, {});
};

export const parseCustomData = (
  customData: TrackingOptions['customData'],
): CustomData | null => {
  const data = typeof customData === 'function' ? customData() : customData;

  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    const filteredData = filterOutNonStrings(data as Record<string, unknown>);
    return Object.keys(filteredData).length > 0 ? filteredData : null;
  }

  return null;
};

export const isCustomDataValid = (customData: CustomData | null): boolean => {
  if (customData === null) {
    return false;
  }

  const stringifiedValue = JSON.stringify(customData);
  return stringifiedValue.length <= CUSTOMER_DATA_CHARS_LIMIT;
};

export const useCustomerVideoDataFallback = (
  videoUrl: string,
  fallback: NonNullable<TrackingOptions['customVideoUrlFallback']>,
): CustomerVideoData | null => {
  try {
    const result = fallback(videoUrl);
    return {
      cloudName: (result as CustomerVideoData).cloudName,
      publicId: (result as CustomerVideoData).publicId,
    };
  } catch (e) {
    return null;
  }
};

export const parseCustomerVideoData = (data: unknown): CustomerVideoData | null => {
  if (
    data !== null &&
    typeof data === 'object' &&
    typeof (data as CustomerVideoData).cloudName === 'string' &&
    (data as CustomerVideoData).cloudName &&
    typeof (data as CustomerVideoData).publicId === 'string' &&
    (data as CustomerVideoData).publicId
  ) {
    return {
      cloudName: (data as CustomerVideoData).cloudName,
      publicId: (data as CustomerVideoData).publicId,
    };
  }

  return null;
};
