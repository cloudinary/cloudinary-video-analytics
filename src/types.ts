/**
 * Shared domain types for the Cloudinary Video Analytics library.
 */

/** Removes an event listener previously registered on a player adapter. */
export type RemoveListener = () => void;

/** Callback invoked when a player event fires. */
export type PlayerEventCallback = (event: Event) => void;

/**
 * Abstraction over a video player. The library ships a native HTML5 video
 * adapter, but consumers may provide their own implementation to integrate
 * a custom player.
 */
export interface PlayerAdapter {
  // Loading / source lifecycle
  onAbort: (callback: PlayerEventCallback) => RemoveListener;
  onCanPlay: (callback: PlayerEventCallback) => RemoveListener;
  onCanPlayThrough: (callback: PlayerEventCallback) => RemoveListener;
  onDurationChange: (callback: PlayerEventCallback) => RemoveListener;
  onEmptied: (callback: PlayerEventCallback) => RemoveListener;
  onEnded: (callback: PlayerEventCallback) => RemoveListener;
  onError: (callback: PlayerEventCallback) => RemoveListener;
  onLoadedData: (callback: PlayerEventCallback) => RemoveListener;
  onLoadedMetadata: (callback: PlayerEventCallback) => RemoveListener;
  onLoadStart: (callback: PlayerEventCallback) => RemoveListener;
  onProgress: (callback: PlayerEventCallback) => RemoveListener;
  onSuspend: (callback: PlayerEventCallback) => RemoveListener;
  // Playback state
  onPause: (callback: PlayerEventCallback) => RemoveListener;
  onPlay: (callback: PlayerEventCallback) => RemoveListener;
  onPlaying: (callback: PlayerEventCallback) => RemoveListener;
  onRateChange: (callback: PlayerEventCallback) => RemoveListener;
  onSeeked: (callback: PlayerEventCallback) => RemoveListener;
  onSeeking: (callback: PlayerEventCallback) => RemoveListener;
  onTimeUpdate: (callback: PlayerEventCallback) => RemoveListener;
  onVolumeChange: (callback: PlayerEventCallback) => RemoveListener;
  // Quality of experience (buffering / adaptive bitrate)
  onResize: (callback: PlayerEventCallback) => RemoveListener;
  onStalled: (callback: PlayerEventCallback) => RemoveListener;
  onWaiting: (callback: PlayerEventCallback) => RemoveListener;
  // Encrypted media (DRM / EME)
  onEncrypted: (callback: PlayerEventCallback) => RemoveListener;
  onWaitingForKey: (callback: PlayerEventCallback) => RemoveListener;
  // Engagement (picture-in-picture / fullscreen)
  onEnterPictureInPicture: (callback: PlayerEventCallback) => RemoveListener;
  onLeavePictureInPicture: (callback: PlayerEventCallback) => RemoveListener;
  onFullscreenChange: (callback: PlayerEventCallback) => RemoveListener;

  getCurrentSrc: () => string;
  getCurrentTime: () => number;
  getReadyState: () => number;
  getNetworkState: () => number;
  getDuration: () => number;
  getPlaybackRate: () => number;
  getVolume: () => number;
  getMuted: () => boolean;
  getVideoWidth: () => number;
  getVideoHeight: () => number;
  getBuffered: () => TimeRanges;
  getError: () => MediaError | null;
  getIsFullscreen: () => boolean;
}

/** Identifies the video player integration reporting the events. */
export type VideoPlayerType = 'native' | 'cloudinary video player';

/** Cloudinary account/video identifiers describing the tracked video. */
export interface CustomerVideoData {
  cloudName: string;
  publicId: string;
}

/** Arbitrary customer-provided metadata (`customData1` ... `customData5`). */
export type CustomData = Partial<Record<
  'customData1' | 'customData2' | 'customData3' | 'customData4' | 'customData5',
  string
>>;

/**
 * Metadata describing the video being tracked, provided by the customer when
 * starting manual tracking.
 */
export interface VideoMetadata {
  cloudName: string;
  publicId: string;
  type?: 'live';
}

/** Options accepted by `connectCloudinaryAnalytics`. */
export interface MainOptions {
  playerAdapter?: PlayerAdapter;
}

/** Options accepted by the tracking methods. */
export interface TrackingOptions {
  customData?: CustomData | (() => CustomData) | unknown;
  videoPlayerType?: string;
  videoPlayerVersion?: string;
  customVideoUrlFallback?: (videoUrl: string) => CustomerVideoData | VideoMetadata | undefined;
}

/** Result returned by the validators. */
export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/** A single analytics event before serialization. */
export interface AnalyticsEvent {
  eventName: string;
  eventTime: number;
  eventDetails: Record<string, unknown>;
}

/** Payload sent to the analytics endpoints. */
export interface AnalyticsPayload {
  userId: string;
  viewId: string;
  events: string;
}

/** Callback used to report a raw event from an event registrar. */
export type ReportEvent = (
  eventName: string,
  eventDetails: Record<string, unknown>,
) => void;

/** Cleans up any listeners registered by an event registrar. */
export type UnregisterEvent = () => void;

/**
 * Lets an event registrar contribute a final event right before the view's
 * events are flushed and sent. Used to emit an authoritative end-of-view
 * summary (e.g. aggregated buffering) that also captures state still in
 * progress at the moment the view ends.
 */
export type RegisterFinalizer = (finalizer: () => void) => void;

/** Page lifecycle callbacks used by the page tracker. */
export interface PageEvents {
  onPageViewStart?: () => void;
  onPageViewEnd?: () => void;
}
