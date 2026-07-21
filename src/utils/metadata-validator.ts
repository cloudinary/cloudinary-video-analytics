import type { ValidationResult, VideoMetadata } from '../types';

export const metadataValidator = (metadata: unknown): ValidationResult => {
  if (typeof metadata !== 'object' || metadata === null) {
    return {
      isValid: false,
      errorMessage: 'Metadata param needs to be an object',
    };
  }

  const data = metadata as Partial<VideoMetadata>;

  if (typeof data.cloudName !== 'string') {
    return {
      isValid: false,
      errorMessage: 'You need to provide proper cloud name of your Cloudinary account [cloudName: string]',
    };
  }

  if (typeof data.type === 'string' && data.type !== 'live') {
    return {
      isValid: false,
      errorMessage: 'Property "type" can be either undefined or "live" value [type: "live"]',
    };
  }

  if (typeof data.publicId !== 'string') {
    if (data.type === 'live') {
      return {
        isValid: false,
        errorMessage: 'You need to provide proper public ID of your Live Stream output [publicId: string]',
      };
    }

    return {
      isValid: false,
      errorMessage: 'You need to provide proper video public ID of your video on your Cloudinary cloud [publicId: string]',
    };
  }

  return {
    isValid: true,
  };
};
