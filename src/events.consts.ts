export const VIDEO_EVENT = {
  PLAY: 'play',
  PAUSE: 'pause',
  ENDED: 'ended',
  LOADED_METADATA: 'loadMetadata',
  // Quality of experience
  STARTUP: 'startup',
  BUFFERING: 'buffering',
  QUALITY_CHANGE: 'qualityChange',
  ERROR: 'error',
  // Engagement
  FULLSCREEN_CHANGE: 'fullscreenChange',
  PICTURE_IN_PICTURE_CHANGE: 'pictureInPictureChange',
  // Emitted once when a view's event count hits the per-view safety cap
  TRUNCATED: 'truncated',
} as const;

export const VIEW_EVENT = {
  START: 'viewStart',
  END: 'viewEnd',
} as const;

// Wrapper event for consumer-reported custom events. The consumer's name and
// payload live in eventDetails ({ name, data }) so they are namespaced away
// from — and cannot collide with — the built-in event names above.
export const CUSTOM_EVENT = 'custom';
