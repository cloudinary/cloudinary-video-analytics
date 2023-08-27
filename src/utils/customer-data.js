const ALLOWED_DATA_TYPES = ['string', 'number', 'boolean'];
const CUSTOMER_DATA_CHARS_LIMIT = 1000;

export const parseCustomerData = (data) => {
  if (typeof data === 'object' && !Array.isArray(data)) {
    const parsedData = Object.keys(data).reduce((collection, dataKey) => {
      if (ALLOWED_DATA_TYPES.includes(data[dataKey])) {
        collection[dataKey] = data[dataKey];
      }

      return collection;
    }, {});

    return Object.keys(parsedData) > 0 ? parsedData : null;
  }

  return null;
};

export const isCustomerDataValid = (customerData) => {
  if (customerData === null) {
    return false;
  }

  const stringifiedValue = JSON.stringify(customerData);
  if (stringifiedValue.length > CUSTOMER_DATA_CHARS_LIMIT) {
    return false;
  }

  return true;
};
