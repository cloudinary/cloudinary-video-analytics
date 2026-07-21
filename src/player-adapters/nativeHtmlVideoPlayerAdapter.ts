import type { PlayerAdapter, PlayerEventCallback, RemoveListener } from '../types';

// iOS Safari does not fire the standard `fullscreenchange` on `document`; it
// dispatches non-standard events on the video element and exposes fullscreen
// state via `webkitDisplayingFullscreen`. These are not in the DOM lib types.
type IosFullscreenVideoElement = HTMLVideoElement & {
  webkitDisplayingFullscreen?: boolean;
};

const createBaseOnEventListener = (
  target: EventTarget,
  eventName: string,
  callback: PlayerEventCallback,
): RemoveListener => {
  target.addEventListener(eventName, callback);
  return () => {
    target.removeEventListener(eventName, callback);
  };
};

export const nativeHtmlVideoPlayerAdapter = (videoElement: HTMLVideoElement): PlayerAdapter => ({
  // Loading / source lifecycle
  onAbort: (callback) => createBaseOnEventListener(videoElement, 'abort', callback),
  onCanPlay: (callback) => createBaseOnEventListener(videoElement, 'canplay', callback),
  onCanPlayThrough: (callback) => createBaseOnEventListener(videoElement, 'canplaythrough', callback),
  onDurationChange: (callback) => createBaseOnEventListener(videoElement, 'durationchange', callback),
  onEmptied: (callback) => createBaseOnEventListener(videoElement, 'emptied', callback),
  onEnded: (callback) => createBaseOnEventListener(videoElement, 'ended', callback),
  onError: (callback) => createBaseOnEventListener(videoElement, 'error', callback),
  onLoadedData: (callback) => createBaseOnEventListener(videoElement, 'loadeddata', callback),
  onLoadedMetadata: (callback) => createBaseOnEventListener(videoElement, 'loadedmetadata', callback),
  onLoadStart: (callback) => createBaseOnEventListener(videoElement, 'loadstart', callback),
  onProgress: (callback) => createBaseOnEventListener(videoElement, 'progress', callback),
  onSuspend: (callback) => createBaseOnEventListener(videoElement, 'suspend', callback),
  // Playback state
  onPause: (callback) => createBaseOnEventListener(videoElement, 'pause', callback),
  onPlay: (callback) => createBaseOnEventListener(videoElement, 'play', callback),
  onPlaying: (callback) => createBaseOnEventListener(videoElement, 'playing', callback),
  onRateChange: (callback) => createBaseOnEventListener(videoElement, 'ratechange', callback),
  onSeeked: (callback) => createBaseOnEventListener(videoElement, 'seeked', callback),
  onSeeking: (callback) => createBaseOnEventListener(videoElement, 'seeking', callback),
  onTimeUpdate: (callback) => createBaseOnEventListener(videoElement, 'timeupdate', callback),
  onVolumeChange: (callback) => createBaseOnEventListener(videoElement, 'volumechange', callback),
  // Quality of experience (buffering / adaptive bitrate)
  onResize: (callback) => createBaseOnEventListener(videoElement, 'resize', callback),
  onStalled: (callback) => createBaseOnEventListener(videoElement, 'stalled', callback),
  onWaiting: (callback) => createBaseOnEventListener(videoElement, 'waiting', callback),
  // Encrypted media (DRM / EME)
  onEncrypted: (callback) => createBaseOnEventListener(videoElement, 'encrypted', callback),
  onWaitingForKey: (callback) => createBaseOnEventListener(videoElement, 'waitingforkey', callback),
  // Engagement (picture-in-picture / fullscreen)
  onEnterPictureInPicture: (callback) => createBaseOnEventListener(videoElement, 'enterpictureinpicture', callback),
  onLeavePictureInPicture: (callback) => createBaseOnEventListener(videoElement, 'leavepictureinpicture', callback),
  // The Fullscreen API dispatches on `document`, not on the media element;
  // iOS Safari instead fires webkit-prefixed events on the element itself.
  onFullscreenChange: (callback) => {
    const removeListeners = [
      createBaseOnEventListener(document, 'fullscreenchange', callback),
      createBaseOnEventListener(videoElement, 'webkitbeginfullscreen', callback),
      createBaseOnEventListener(videoElement, 'webkitendfullscreen', callback),
    ];
    return () => removeListeners.forEach((removeListener) => removeListener());
  },

  getCurrentSrc: () => videoElement.currentSrc,
  getCurrentTime: () => videoElement.currentTime,
  getReadyState: () => videoElement.readyState,
  getNetworkState: () => videoElement.networkState,
  getDuration: () => videoElement.duration,
  getPlaybackRate: () => videoElement.playbackRate,
  getVolume: () => videoElement.volume,
  getMuted: () => videoElement.muted,
  getVideoWidth: () => videoElement.videoWidth,
  getVideoHeight: () => videoElement.videoHeight,
  getBuffered: () => videoElement.buffered,
  getError: () => videoElement.error,
  getIsFullscreen: () =>
    document.fullscreenElement === videoElement ||
    Boolean((videoElement as IosFullscreenVideoElement).webkitDisplayingFullscreen),
});
