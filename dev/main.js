import { connectCloudinaryAnalytics } from 'cloudinary-video-analytics';
window.connectCloudinaryAnalytics = connectCloudinaryAnalytics;

const videos = [
  'https://res.cloudinary.com/demo/video/upload/v1651840278/samples/cld-sample-video.mp4',
  'https://res.cloudinary.com/demo/video/upload/v1643890261/cld-sample-video.mp4',
  'https://res.cloudinary.com/demo/video/upload/v1692105601/dog_demo.mp4',
];

window.addEventListener('load', () => {
  const manualVideoElement = document.querySelector('#main-video-player');
  const manualCloudinaryAnalytics = connectCloudinaryAnalytics(manualVideoElement);
  const connectVideoPanel = () => {
    let currentSelectedRadioValue = '0';
    const onMainVideoChange = (newVideoPublicId) => {
      manualVideoElement.src = newVideoPublicId;
      manualCloudinaryAnalytics.startManualTracking({
        cloudName: 'demo',
        publicId: newVideoPublicId,
      });
    };

    document.addEventListener('input', (e) => {
      if (e.target.getAttribute('name') === 'videoType') {
        currentSelectedRadioValue = e.target.value;
        onMainVideoChange(videos[currentSelectedRadioValue]);
      }
    });
  };

  // init
  connectVideoPanel();
  manualCloudinaryAnalytics.startManualTracking({
    cloudName: 'demo',
    publicId: videos[0],
  });

  // connect extra videos
  const extraVideo1Element = document.querySelector('#extra-video-1');
  const extraVideo1CldAnalytics = connectCloudinaryAnalytics(extraVideo1Element);
  extraVideo1CldAnalytics.startManualTracking({
    cloudName: 'demo',
    publicId: videos[0],
  });

  const extraVideo2Element = document.querySelector('#extra-video-2');
  const extraVideo2CldAnalytics = connectCloudinaryAnalytics(extraVideo2Element);
  extraVideo2CldAnalytics.startManualTracking({
    cloudName: 'demo',
    publicId: videos[1],
  });

  // auto detection
  const autoVideoElement = document.querySelector('#auto-video-player');
  const autoCloudinaryAnalytics = connectCloudinaryAnalytics(autoVideoElement);
  const connectAutoVideoPanel = () => {
    let currentSelectedRadioValue = '0';
    const onMainVideoChange = (newVideoPublicId) => {
      autoVideoElement.src = newVideoPublicId;
    };

    document.addEventListener('input', (e) => {
      if (e.target.getAttribute('name') === 'autoVideoType') {
        currentSelectedRadioValue = e.target.value;
        onMainVideoChange(videos[currentSelectedRadioValue] || '');
      }
    });
  };

  connectAutoVideoPanel();
  autoCloudinaryAnalytics.startAutoTracking({
    providedData: {
      example: 1,
      thisPackageIsAwesome: true,
      test: 'test',
      thisShouldBeSkipped: {
        value: 1,
      },
    },
    customVideoUrlFallback: (videoUrl) => {
      if (videoUrl === 'https://res.cloudinary.com/demo/video/upload/v1692105601/dog_demo.mp4') {
        return {
          cloudName: 'fallback-cloud-name',
          publicId: 'fallback-public-id',
        };
      }
    },
  });
});
