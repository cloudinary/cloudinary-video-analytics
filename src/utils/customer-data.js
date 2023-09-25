const ALLOWED_DATA_TYPES = ['string', 'number', 'boolean'];
const CUSTOMER_DATA_CHARS_LIMIT = 1000;

export const parseProvidedData = (data) => {
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    const parsedData = Object.keys(data).reduce((collection, dataKey) => {
      if (ALLOWED_DATA_TYPES.includes(typeof data[dataKey]) || data[dataKey] === null) {
        collection[dataKey] = data[dataKey];
      }

      return collection;
    }, {});

    return Object.keys(parsedData).length > 0 ? parsedData : null;
  }

  return null;
};

export const isProvidedDataValid = (providedData) => {
  if (providedData === null) {
    return false;
  }

  const stringifiedValue = JSON.stringify(providedData);
  return stringifiedValue.length <= CUSTOMER_DATA_CHARS_LIMIT;
};

export const useCustomerVideoDataFallback = (videoUrl, fallback) => {
  try {
    const result = fallback(videoUrl);
    return {
      cloudName: result.cloudName,
      publicId: result.publicId,
    };
  } catch (e) {
    return null;
  }
};

export const parseCustomerVideoData = (data) => {
  if (
    data !== null &&
    typeof data === 'object' &&
    typeof data.cloudName === 'string' &&
    data.cloudName &&
    typeof data.publicId === 'string' &&
    data.publicId
  ) {
    return {
      cloudName: data.cloudName,
      publicId: data.publicId,
    };
  }

  return null;
};
