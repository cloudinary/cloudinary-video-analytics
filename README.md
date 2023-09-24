# Cloudinary Video Analytics
The Cloudinary Video Analytics package allows you to track analytics for your Cloudinary videos using video players other than the Cloudinary Video Player. The library targets the HTML5 video tag and is designed to work with any video player that use this tag. For more information view the [documentation](https://cloudinary.com/documentation/video_analytics).

### Usage
**1. Install the package**:

```shell
npm i cloudinary-video-analytics
```
**2. Import the library**:

```js
import { connectCloudinaryAnalytics } from 'cloudinary-video-analytics';
```
**3. Connect the analytics:**:

Connect the analytics by calling the `connectCloudinaryAnalytics` method and provide the video element as a parameter. For example, if your video element has the id ‘video-player’:
```js
const videoElement = document.getElementById('video-player');
const cloudinaryAnalytics = connectCloudinaryAnalytics(videoElement);
```
**4. Start tracking**:

Start tracking analytics for any Cloudinary video by calling the `startAutoTracking` method:
```js
cloudinaryAnalytics.startAutoTracking();
```

Alternatively, to track each video manually, call the `startManualTracking` method, providing your Cloudinary cloud name and the public id of the video you want to manually track:
```js
cloudinaryAnalytics.startManualTracking({
  cloudName: 'demo',
  publicId: 'cld-sample',
})
```

Auto and manual tracking cannot be used together for the same video element. Manual tracking should only be used in cases where you need to track certain videos, you want to track a video tag element which is dynamic, or you have custom domains which require providing `cloudName` and `publicId`.

### CodeSandbox examples
[Native HTML Video Tag - Auto tracking](https://4rqcfc.csb.app/src/native-html-auto-tracking/index.html)
<br />
[Native HTML Video Tag - Manual tracking](https://4rqcfc.csb.app/src/native-html-manual-tracking/index.html)
