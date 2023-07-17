# cloudinary-video-analytics

This package allows you to easily connect any Video Player with Cloudinary Video Analytics.

### Usage

```html
<!doctype html>
<html>
    <head>
        <title>My page</title>
    </head>
    <body>
      <video id="video-player" src="https://res.cloudinary.com/demo/video/upload/v1651840278/samples/cld-sample-video.mp4" />
    </body>
</html>
```

```javascript
// simple example to run code when page loaded
import { connectCloudinaryAnalytics } from 'cloudinary-video-analytics';

const videoElement = document.getElementById('video-player');
const cloudinaryAnalytics = connectCloudinaryAnalytics(videoElement);

// needs to be called every time new video is loaded
cloudinaryAnalytics.startManuallyNewVideoTracking({
  cloudName: 'demo',
  publicId: 'cld-sample',
});
```

### Metadata Props

| Property name |  Type  |      Required      |                                           Description                                           |
|:-------------:|:------:|:------------------:|:-----------------------------------------------------------------------------------------------:|
|  `cloudName`  | string | :white_check_mark: | Name of your cloud name on your Cloudinary account where your video analytics will be collected |
|  `publicId`   | string | :white_check_mark: |                      Public ID of played video that all analytics will be connected with        |
