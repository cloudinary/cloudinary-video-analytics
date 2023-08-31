## Video analytics for other players
To collect analytics for video players other than the Cloudinary Video Player, install our [JavaScript library](https://www.npmJavaScript.com/package/cloudinary-video-analytics) and include some configuration on any pages that include a video player. The library targets the HTML5 video tag and is designed to work with any other video players that use this tag.

### Usage
**1. Install the package**:
```shell
npm i cloudinary-video-analytics
```
**2. Import the library**:
```js
import { connectCloudinaryAnalytics } from 'cloudinary-video-analytics';
```
Connect the analytics by calling the `connectCloudinaryAnalytics` method and provide the video element as a parameter. For example, if your video element has the id ‘video-player’:
```js
const videoElement = document.getElementById('video-player');
const cloudinaryAnalytics = connectCloudinaryAnalytics(videoElement);
```
**3. Start tracking**:
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

### CodeSandbox examples
[Auto tracking](TODO_SANDBOX_LINK)
<br />
[Manual tracking](TODO_SANDBOX_LINK)
