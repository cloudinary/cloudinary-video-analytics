const DEFAULT_REQUIRED_METADATA_FIELDS = {
  cloudName: true,
  publicId: true,
};

export const metadataValidator = (metadata, required = DEFAULT_REQUIRED_METADATA_FIELDS) => {
  if (typeof metadata !== 'object') {
    return {
      isValid: false,
      errorMessage: 'Metadata param needs to be an object',
    };
  }

  if (typeof metadata.cloudName !== 'string' && required.cloudName) {
    return {
      isValid: false,
      errorMessage: 'You need to provide proper cloud name of your Cloudinary account [cloudName: string]',
    };
  }

  if (typeof metadata.publicId !== 'string' && required.publicId) {
    return {
      isValid: false,
      errorMessage: 'You need to provide proper video public ID of your video on your Cloudinary cloud [videoPublicId: string]',
    };
  }

  return {
    isValid: true,
  };
};
