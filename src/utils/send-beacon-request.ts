export const sendBeaconRequest = (
  url: string,
  data: Record<string, unknown>,
): boolean | Promise<Response> => {
  const params = Object.keys(data).reduce((formData, key) => {
    formData.append(key, data[key] as string | Blob);
    return formData;
  }, new FormData());

  if (typeof window.navigator.sendBeacon !== 'function') {
    return window.fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      body: params,
      keepalive: true,
    });
  }

  return window.navigator.sendBeacon(url, params);
};
