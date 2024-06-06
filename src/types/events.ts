import { CustomerProvidedData, CustomerVideoData, InternalOptions, VideoDurationValue } from './main';
import { TRACKING_TYPE } from '../constants';

export interface EventViewStartData {
  videoUrl: string;
  trackingType: typeof TRACKING_TYPE[keyof typeof TRACKING_TYPE];
  analyticsModuleVersion: string;
  videoPlayer: {
    type: InternalOptions['videoPlayerType'];
    version: InternalOptions['videoPlayerVersion'];
  };
  customerData: {
    providedData?: CustomerProvidedData;
    videoData?: CustomerVideoData;
  },
}

export interface EventViewEndData {}

export interface EventPlayData {}

export interface EventPauseData {}

export interface EventMetadataData {
  videoDuration: VideoDurationValue;
}
