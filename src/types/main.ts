import { ALLOWED_VIDEO_PLAYER_TYPES } from '../utils/video-player-options';
import { VIDEO_EVENT, VIEW_EVENT } from '../constants';

export type CustomerVideoData = { cloudName: string; publicId: string };
export type CustomerVideoDataFallback = (videoUrl: string) => CustomerVideoData;
export type CustomerProvidedData = Record<string, string | number | boolean>;
export type CustomVideoUrlFallback = (videoUrl: string) => CustomerVideoData;
export type AnalyticsEventName = typeof VIEW_EVENT[keyof typeof VIEW_EVENT] | typeof VIDEO_EVENT[keyof typeof VIDEO_EVENT];
export type VideoDurationValue = 'Infinity' | number | null;

export interface AnalyticsEvent <EventDetails> {
  eventName: AnalyticsEventName;
  eventDetails: EventDetails;
  eventTime: number;
}

// should be used only by cld packages
export interface InternalOptions {
  videoPlayerType?: typeof ALLOWED_VIDEO_PLAYER_TYPES[number];
  videoPlayerVersion?: string;
}

export interface CustomerOptions extends InternalOptions {
  customVideoUrlFallback?: CustomVideoUrlFallback;
  providedData?: CustomerProvidedData;
}

export interface CloudinaryAnalyticsMainOptions {}

export interface ManualTrackingOptions extends InternalOptions {
  customVideoUrlFallback?: CustomVideoUrlFallback;
  providedData?: CustomerProvidedData;
}

export interface AutoTrackingOptions extends InternalOptions {
  customVideoUrlFallback?: CustomVideoUrlFallback;
  providedData?: CustomerProvidedData;
}
