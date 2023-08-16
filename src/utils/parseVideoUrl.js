const CLOUDINARY_URL_BASE_REGEX = /^\/?(?<cloudName>[^\/]+)\/(?<assetType>video)\/(?<deliveryType>upload|fetch)\/(?<rest>.*)$/;
const CLOUDINARY_VERSION_PART_REGEX = /^v[0-9]+/
export const parseVideoUrl = (videoUrl) => {
  const {
    host: urlHost,
    pathname: urlPathname,
  } = new URL(videoUrl);

  const baseUrlParts = urlPathname.match(CLOUDINARY_URL_BASE_REGEX);

  if (!baseUrlParts || !baseUrlParts.groups.assetType || !baseUrlParts.groups.deliveryType || !baseUrlParts.groups.cloudName || !baseUrlParts.groups.rest) {
    return null;
  }

  if (baseUrlParts.groups.deliveryType === 'fetch') {
    return {
      cloudName: baseUrlParts.groups.cloudName,
      publicId: baseUrlParts.groups.rest,
    };
  }

  const restUrlParts = baseUrlParts.groups.rest.split('/');
  const restParsedParts = restUrlParts.reduce((acc, currentValue, currentIndex) => {
    const isVersionString = CLOUDINARY_VERSION_PART_REGEX.test(currentValue);
    if (!acc.version && !isVersionString) {
      acc.transformations = `${acc.transformations}/${currentValue}`;
    } else if (!acc.version && isVersionString) {
      acc.version = currentValue;
    } else if (acc.version) {
      if (!acc.publicPathWithExtension) {
        acc.publicPathWithExtension = currentValue;
      } else {
        acc.publicPathWithExtension = `${acc.publicPathWithExtension}/${currentValue}`;
      }
    }

    return acc;
  }, { transformations: '', version: null, publicPathWithExtension: '' });
  const [publicId] = restParsedParts.publicPathWithExtension.split('.');

  return {
    cloudName: baseUrlParts.groups.cloudName,
    publicId,
  };
};
