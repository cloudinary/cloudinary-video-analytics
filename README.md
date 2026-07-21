# Cloudinary Video Analytics
The Cloudinary Video Analytics package allows you to track analytics for your Cloudinary videos using video players other than the Cloudinary Video Player. The library targets the HTML5 video tag and is designed to work with any video player that use this tag. For more information view the [documentation](https://cloudinary.com/documentation/video_analytics).

The package is written in TypeScript and ships its own type declarations.

## Usage
**1. Install the package**:

```shell
npm i cloudinary-video-analytics
```
**2. Import the library**:

```js
import { connectCloudinaryAnalytics } from 'cloudinary-video-analytics';
```
**3. Connect the analytics**:

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

## API

`connectCloudinaryAnalytics(videoElement, mainOptions?)` returns an object with the following methods:

| Method | Description |
| --- | --- |
| `startAutoTracking(options?)` | Automatically detects and tracks Cloudinary videos played in the element. |
| `startManualTracking(metadata, options?)` | Tracks a specific video (or live stream) identified by `cloudName` / `publicId`. |
| `stopManualTracking()` | Stops the current tracking session. |
| `stopAutoTracking()` | Alias of `stopManualTracking` — stops the current tracking session. |
| `stopTracking()` | Stops whichever tracking (auto or manual) is currently active. |
| `reportCustomEvent(name, data?)` | Records a consumer-defined event into the current view (see [Custom events](#custom-events)). |

### `metadata` (manual tracking)

| Field | Type | Description |
| --- | --- | --- |
| `cloudName` | `string` | Your Cloudinary cloud name. Required. |
| `publicId` | `string` | Public ID of the video (or live stream output). Required. |
| `type` | `'live'` | Optional. Set to `'live'` to track a live stream. |

### `options` (tracking options)

| Field | Type | Description |
| --- | --- | --- |
| `customData` | `object \| () => object` | Up to five string fields (`customData1`…`customData5`); non-string values are ignored. |
| `videoPlayerType` | `string` | `'native'` (default) or `'cloudinary video player'`. |
| `videoPlayerVersion` | `string` | Semantic version of the player. |
| `customVideoUrlFallback` | `(videoUrl) => ({ cloudName, publicId })` | Resolves `cloudName`/`publicId` from a video URL (auto tracking / custom domains). |

### `mainOptions`

| Field | Type | Description |
| --- | --- | --- |
| `playerAdapter` | `PlayerAdapter` | Custom player adapter. Defaults to the built-in native HTML5 `<video>` adapter. |

## Custom events

Report your own events into the active view — for example an "on screen" / viewability signal coming from your player integration — so they can be correlated (by time) with the built-in events:

```js
cloudinaryAnalytics.reportCustomEvent('onScreen', { visible: true, ratio: 0.75 });
```

- The event is **recorded** into the current view and shipped in the same payload; it is not sent immediately.
- `name` must be a non-empty string; `data` must be a plain object (JSON-serializable, ≤ 2000 characters).
- It is a **no-op** when no view is currently being tracked, and for live streams (which are not collected into a view).

## Collected events

### Payload shape

Data is sent once per view (see [Views](#views)) via `navigator.sendBeacon` as `multipart/form-data` with three fields:

| Field | Description |
| --- | --- |
| `userId` | Anonymous, persistent per-browser id (stored in `localStorage`). Stable across views and sessions. |
| `viewId` | Unique id for a single view. |
| `events` | JSON-stringified array of event objects. |

Every event object has the shape:

```json
{ "eventName": "play", "eventTime": 1784973602000, "eventDetails": {} }
```

- `eventName` — the event type (see below).
- `eventTime` — epoch milliseconds when the event was recorded.
- `eventDetails` — event-specific payload.

### Views

A **view** is one `viewStart` … `viewEnd` window sharing a single `viewId`. Events accumulate in memory during the view and are sent as a single beacon when the view ends (page unload on desktop, tab hidden on mobile). Backgrounding and returning to a tab ends one view and begins a new one (a new `viewId`, a separate beacon).

### Event reference

| `eventName` | Fired when | `eventDetails` |
| --- | --- | --- |
| `viewStart` | A view begins. | `videoUrl`, `trackingType` (`'auto'` \| `'manual'`), `analyticsModuleVersion`, `videoPlayer` (`{ type, version }`), `customerData` (`{ providedData?, videoData? }`) |
| `viewEnd` | A view ends. | `{}` |
| `play` | Playback is requested (user or autoplay). | `{}` |
| `pause` | Playback is paused (or the source is emptied). | `{}` |
| `ended` | Playback reaches the natural end. | `{}` |
| `loadMetadata` | Video metadata has loaded. | `videoDuration` (seconds, or `'Infinity'` / `null`), `videoUrl` |
| `startup` | The first frame renders after play was requested. | `joinTime` (ms from play intent to first frame) |
| `buffering` | Once per view (summary of all rebuffering). | see [Buffering](#buffering) |
| `qualityChange` | The decoded video resolution changes (incl. the initial resolution). | `videoWidth`, `videoHeight` |
| `error` | A media error occurs. | `errorCode` (`MediaError.code` or `null`), `errorMessage` |
| `fullscreenChange` | This video enters or leaves fullscreen. | `isFullscreen` (`boolean`) |
| `pictureInPictureChange` | This video enters or leaves picture-in-picture. | `isPictureInPicture` (`boolean`) |
| `custom` | You call `reportCustomEvent`. | `name` (your event name), `data` (your payload) |
| `truncated` | A view hits the per-view event cap (250). Emitted once; further events are dropped. | `limit` |

> A view that has a `play` event but no `startup` event means playback never began — a **startup failure**. If it also has no `error`, it is an **exit before video start**.

### Buffering

Rebuffering is reported as a single summary event per view. Stalls that occur before the first frame are attributed to `startup` (join time), not buffering; a user pause during a stall ends that stall so paused time is never counted.

```json
{
  "eventName": "buffering",
  "eventTime": 1784973685000,
  "eventDetails": {
    "count": 4,
    "totalDuration": 7400,
    "maxDuration": 4200,
    "byCause": {
      "seek":     { "count": 1, "totalDuration": 1200 },
      "rebuffer": { "count": 3, "totalDuration": 6200 }
    },
    "occurrences": [
      { "atTime": 1784973620000, "duration": 4200, "cause": "rebuffer", "endedBy": "recovery" },
      { "atTime": 1784973640000, "duration": 1200, "cause": "seek",     "endedBy": "recovery" }
    ],
    "occurrencesTruncated": false
  }
}
```

| Field | Description |
| --- | --- |
| `count` | Total number of buffering episodes in the view. |
| `totalDuration` | Total buffering time (ms) across all episodes. |
| `maxDuration` | Longest single episode (ms). |
| `byCause` | Per-cause totals. `cause` is `'seek'` (buffering after a user seek) or `'rebuffer'` (buffering during normal playback — the true QoE signal). |
| `occurrences` | Exact per-episode detail, capped at 20 entries. Each has `atTime`, `duration`, `cause`, and `endedBy` (`'recovery'` \| `'pause'` \| `'viewEnd'`). |
| `occurrencesTruncated` | `true` when there were more episodes than the `occurrences` array holds (totals still cover them all). |

### Live streams

For live streams (`type: 'live'`), only `viewStart` and `viewEnd` are collected, and each is sent immediately as its own beacon.

## CodeSandbox examples
[Native HTML Video Tag - Auto tracking](https://4rqcfc.csb.app/src/native-html-auto-tracking/index.html)
<br />
[Native HTML Video Tag - Manual tracking](https://4rqcfc.csb.app/src/native-html-manual-tracking/index.html)
