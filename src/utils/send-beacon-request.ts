export const sendBeaconRequest = <T = Record<string, any>>(url: string, data: T) => {
  const params = Object.keys(data).reduce((formData, key) => {
    formData.append(key, data[key]);
    return formData;
  }, new FormData());

  if (typeof window.navigator.sendBeacon !== 'function') {
    return window.fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      body: params,
      keepalive: true
    });
  }

  return window.navigator.sendBeacon(url, params);
};
