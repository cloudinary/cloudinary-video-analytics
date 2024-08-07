import { connectCloudinaryAnalytics } from 'cloudinary-video-analytics';
window.connectCloudinaryAnalytics = connectCloudinaryAnalytics;

const videos = [
  {
    url: 'https://res.cloudinary.com/demo/video/upload/v1651840278/samples/cld-sample-video.mp4',
    publicId: 'samples/cld-sample-video',
  },
  {
    url: 'https://res.cloudinary.com/demo/video/upload/v1643890261/cld-sample-video.mp4',
    publicId: 'cld-sample-video',
  },
  {
    url: 'https://res.cloudinary.com/demo/video/upload/v1692105601/dog_demo.mp4',
    publicId: 'dog_demo',
  },
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
        onMainVideoChange(videos[currentSelectedRadioValue].url);
      }
    });
  };

  // init
  connectVideoPanel();
  manualCloudinaryAnalytics.startManualTracking({
    cloudName: 'demo',
    publicId: videos[0].publicId,
  });

  // connect extra videos
  const extraVideo1Element = document.querySelector('#extra-video-1');
  const extraVideo1CldAnalytics = connectCloudinaryAnalytics(extraVideo1Element);
  extraVideo1CldAnalytics.startManualTracking({
    cloudName: 'demo',
    publicId: videos[0].publicId,
  });

  const extraVideo2Element = document.querySelector('#extra-video-2');
  const extraVideo2CldAnalytics = connectCloudinaryAnalytics(extraVideo2Element);
  extraVideo2CldAnalytics.startManualTracking({
    cloudName: 'demo',
    publicId: videos[1].publicId,
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
        onMainVideoChange(videos[currentSelectedRadioValue].url || '');
      }
    });
  };

  connectAutoVideoPanel();
  autoCloudinaryAnalytics.startAutoTracking({
    customData: {
      customData1: 1, // skipped
      customData2: 'value',
      test: 'test', // skipped
      customData5: 'another-value',
      thisShouldBeSkipped: { // skipped
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
