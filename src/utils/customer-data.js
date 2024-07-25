const CUSTOMER_DATA_CHARS_LIMIT = 1000;

const filterProvidedData = (data) => {
  return Array(5).reduce((obj, cv, currentIndex) => {
    const key = `customData${currentIndex + 1}`;

    if (typeof data[key] === 'string') {
      obj[key] = data[key];
    }

    return obj;
  }, {})
};

export const parseProvidedData = (data) => {
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    const filteredData = filterProvidedData(data);
    return Object.keys(filteredData).length > 0 ? filteredData : null;
  } else if (typeof data === 'function') {
    const dataFnResult = data();
    const filteredData = filterProvidedData(dataFnResult);
    return Object.keys(filteredData).length > 0 ? filteredData : null;
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
