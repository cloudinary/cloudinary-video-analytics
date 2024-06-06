
export const CLD_ANALYTICS_ENDPOINT_PRODUCTION_URL = 'https://video-analytics-api.cloudinary.com/v1/video-analytics';
export const CLD_ANALYTICS_ENDPOINT_DEVELOPMENT_URL = 'http://localhost:3001/events';

export const VIDEO_EVENT = {
  PLAY: 'play',
  PAUSE: 'pause',
  LOADED_METADATA: 'loadMetadata',
} as const;

export const VIEW_EVENT = {
  START: 'viewStart',
  END: 'viewEnd',
}  as const;

export const TRACKING_TYPE = {
  MANUAL: 'manual',
  AUTO: 'auto',
} as const;
