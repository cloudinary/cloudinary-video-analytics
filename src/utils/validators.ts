import type { ValidationResult, VideoMetadata } from '../types';

const CUSTOM_EVENT_DATA_CHARS_LIMIT = 2000;

export const throwErrorIfInvalid = (validationResult: ValidationResult, errorHeader?: string): void => {
  if (!validationResult.isValid) {
    throw errorHeader ? `${errorHeader}:` + '\n\n' + validationResult.errorMessage : validationResult.errorMessage;
  }
};

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
      errorMessage: 'Property "type" can be either undefined or "live" value',
    };
  }

  if (typeof data.publicId !== 'string') {
    if (data.type === 'live') {
      return {
        isValid: false,
        errorMessage: 'You need to provide proper public ID of your Live Stream output',
      };
    }

    return {
      isValid: false,
      errorMessage: 'You need to provide proper video public ID of your video on your Cloudinary cloud [videoPublicId: string]',
    };
  }

  return {
    isValid: true,
  };
};

export const mainOptionsValidator = (mainOptions: unknown): ValidationResult => {
  if (mainOptions && typeof mainOptions !== 'object') {
    return {
      isValid: false,
      errorMessage: 'Options property must be an object',
    };
  }

  return {
    isValid: true,
  };
};

export const trackingOptionsValidator = (trackingOptions: unknown): ValidationResult => {
  if (trackingOptions && typeof trackingOptions !== 'object') {
    return {
      isValid: false,
      errorMessage: 'Options property must be an object',
    };
  }

  return {
    isValid: true,
  };
};

export const customEventValidator = (name: unknown, data: unknown): ValidationResult => {
  if (typeof name !== 'string' || name.length === 0) {
    return {
      isValid: false,
      errorMessage: 'Custom event name must be a non-empty string [name: string]',
    };
  }

  if (data !== undefined && (typeof data !== 'object' || data === null || Array.isArray(data))) {
    return {
      isValid: false,
      errorMessage: 'Custom event data must be an object [data: object]',
    };
  }

  try {
    if (JSON.stringify(data ?? {}).length > CUSTOM_EVENT_DATA_CHARS_LIMIT) {
      return {
        isValid: false,
        errorMessage: `Custom event data exceeds the ${CUSTOM_EVENT_DATA_CHARS_LIMIT} character limit`,
      };
    }
  } catch (e) {
    return {
      isValid: false,
      errorMessage: 'Custom event data must be JSON-serializable',
    };
  }

  return {
    isValid: true,
  };
};
