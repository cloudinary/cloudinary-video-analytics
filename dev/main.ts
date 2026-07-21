import { connectCloudinaryAnalytics } from 'cloudinary-video-analytics';

declare global {
  interface Window {
    connectCloudinaryAnalytics: typeof connectCloudinaryAnalytics;
  }
}

window.connectCloudinaryAnalytics = connectCloudinaryAnalytics;

interface DemoVideo {
  url: string;
  publicId: string;
}

const videos: DemoVideo[] = [
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
  const manualVideoElement = document.getElementById('main-video-player') as HTMLVideoElement;
  const manualCloudinaryAnalytics = connectCloudinaryAnalytics(manualVideoElement);
  const connectVideoPanel = () => {
    let currentSelectedRadioValue = '0';
    const onMainVideoChange = (newVideoPublicId: string) => {
      manualVideoElement.src = newVideoPublicId;
      manualCloudinaryAnalytics.startManualTracking({
        cloudName: 'demo',
        publicId: newVideoPublicId,
      });
    };

    document.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.getAttribute('name') === 'videoType') {
        currentSelectedRadioValue = target.value;
        onMainVideoChange(videos[Number(currentSelectedRadioValue)].url);
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
  const extraVideo1Element = document.getElementById('extra-video-1') as HTMLVideoElement;
  const extraVideo1CldAnalytics = connectCloudinaryAnalytics(extraVideo1Element);
  extraVideo1CldAnalytics.startManualTracking({
    cloudName: 'demo',
    publicId: videos[0].publicId,
  });

  const extraVideo2Element = document.getElementById('extra-video-2') as HTMLVideoElement;
  const extraVideo2CldAnalytics = connectCloudinaryAnalytics(extraVideo2Element);
  extraVideo2CldAnalytics.startManualTracking({
    cloudName: 'demo',
    publicId: videos[1].publicId,
  });

  // auto detection
  const autoVideoElement = document.getElementById('auto-video-player') as HTMLVideoElement;
  const autoCloudinaryAnalytics = connectCloudinaryAnalytics(autoVideoElement);
  const connectAutoVideoPanel = () => {
    let currentSelectedRadioValue = '0';
    const onMainVideoChange = (newVideoPublicId: string) => {
      autoVideoElement.src = newVideoPublicId;
    };

    document.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.getAttribute('name') === 'autoVideoType') {
        currentSelectedRadioValue = target.value;
        onMainVideoChange(videos[Number(currentSelectedRadioValue)].url || '');
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
    customVideoUrlFallback: (videoUrl: string) => {
      if (videoUrl === 'https://res.cloudinary.com/demo/video/upload/v1692105601/dog_demo.mp4') {
        return {
          cloudName: 'fallback-cloud-name',
          publicId: 'fallback-public-id',
        };
      }
      return undefined;
    },
  });

  // live stream
  const liveStreamVideoElement = document.getElementById('live-stream-video-player') as HTMLVideoElement;
  const liveStreamCldAnalytics = connectCloudinaryAnalytics(liveStreamVideoElement);
  liveStreamCldAnalytics.startManualTracking({
    cloudName: 'demo',
    publicId: 'live-stream-public-id',
    type: 'live',
  });
});
