import { connectCloudinaryAnalytics } from 'cloudinary-video-analytics';
window.connectCloudinaryAnalytics = connectCloudinaryAnalytics;

const videos = [
  'https://res.cloudinary.com/demo/video/upload/v1651840278/samples/cld-sample-video.mp4',
  'https://res.cloudinary.com/demo/video/upload/v1689428506/elephants_xdbpfa.mp4',
  'https://res.cloudinary.com/demo/video/upload/v1643890261/cld-sample-video.mp4',
];

window.addEventListener('load', () => {
  const mainVideoElement = document.querySelector('#main-video-player');
  const cloudinaryAnalytics = connectCloudinaryAnalytics(mainVideoElement);
  const connectVideoPanel = () => {
    let currentSelectedRadioValue = '0';
    const onMainVideoChange = (newVideoPublicId) => {
      mainVideoElement.src = newVideoPublicId;
      cloudinaryAnalytics.startManuallyNewVideoTracking({
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
  cloudinaryAnalytics.startManuallyNewVideoTracking({
    cloudName: 'demo',
    publicId: videos[0],
  });

  // connect extra videos
  const extraVideo1Element = document.querySelector('#extra-video-1');
  const extraVideo1CldAnalytics = connectCloudinaryAnalytics(extraVideo1Element);
  extraVideo1CldAnalytics.startManuallyNewVideoTracking({
    cloudName: 'demo',
    publicId: videos[1],
  });

  const extraVideo2Element = document.querySelector('#extra-video-2');
  const extraVideo2CldAnalytics = connectCloudinaryAnalytics(extraVideo2Element);
  extraVideo2CldAnalytics.startManuallyNewVideoTracking({
    cloudName: 'demo',
    publicId: videos[2],
  });
});
