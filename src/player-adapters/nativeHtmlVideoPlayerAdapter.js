const createBaseOnEventListener = (videoElement, eventName, callback) => {
  videoElement.addEventListener(eventName, callback);
  return () => {
    videoElement.removeEventListener(eventName, callback);
  };
};

export const nativeHtmlVideoPlayerAdapter = (videoElement) => ({
  onCanPlay: (callback) => createBaseOnEventListener(videoElement, 'canplay', callback),
  onCanPlayThrough: (callback) => createBaseOnEventListener(videoElement, 'canplaythrough', callback),
  onComplete: (callback) => createBaseOnEventListener(videoElement, 'complete', callback),
  onDurationChange: (callback) => createBaseOnEventListener(videoElement, 'durationchange', callback),
  onEmptied: (callback) => createBaseOnEventListener(videoElement, 'emptied', callback),
  onEnded: (callback) => createBaseOnEventListener(videoElement, 'ended', callback),
  onError: (callback) => createBaseOnEventListener(videoElement, 'error', callback),
  onLoadedData: (callback) => createBaseOnEventListener(videoElement, 'loadeddata', callback),
  onLoadedMetadata: (callback) => createBaseOnEventListener(videoElement, 'loadedmetadata', callback),
  onLoadStart: (callback) => createBaseOnEventListener(videoElement, 'loadstart', callback),
  onPause: (callback) => createBaseOnEventListener(videoElement, 'pause', callback),
  onPlay: (callback) => createBaseOnEventListener(videoElement, 'play', callback),
  onPlaying: (callback) => createBaseOnEventListener(videoElement, 'playing', callback),
  onProgress: (callback) => createBaseOnEventListener(videoElement, 'progress', callback),
  onRateChange: (callback) => createBaseOnEventListener(videoElement, 'ratechange', callback),
  onSeeked: (callback) => createBaseOnEventListener(videoElement, 'seeked', callback),
  onSeeking: (callback) => createBaseOnEventListener(videoElement, 'seeking', callback),
  onStalled: (callback) => createBaseOnEventListener(videoElement, 'stalled', callback),
  onSuspend: (callback) => createBaseOnEventListener(videoElement, 'suspend', callback),
  onTimeUpdate: (callback) => createBaseOnEventListener(videoElement, 'timeupdate', callback),
  onVolumeChange: (callback) => createBaseOnEventListener(videoElement, 'volumechange', callback),
  onWaiting: (callback) => createBaseOnEventListener(videoElement, 'waiting', callback),

  getCurrentSrc: () => videoElement.currentSrc,
  getCurrentTime: () => videoElement.currentTime,
  getReadyState: () => videoElement.readyState,
  getDuration: () => videoElement.duration,
});
