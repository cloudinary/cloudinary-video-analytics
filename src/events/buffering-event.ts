import { VIDEO_EVENT } from '../events.consts';
import type { PlayerAdapter, RegisterFinalizer, ReportEvent, UnregisterEvent } from '../types';

// Playback must stay healthy this long after `playing` before we consider a
// buffering episode over. Real players flap (waiting→playing→waiting…) many
// times per rough patch; this grace period merges that burst into one episode.
const RECOVERY_GRACE_MS = 500;
// Episodes shorter than this are seek jitter / micro-stalls, not real
// rebuffering, and are dropped entirely.
const MIN_BUFFERING_MS = 300;
// Upper bound on the number of exact per-episode records kept. Totals are still
// computed over every episode; only the detail array is capped so the single
// end-of-view event cannot grow unbounded.
const MAX_OCCURRENCES = 20;

// Stalls that happen before playback ever starts are startup/join time (see
// startup-event.ts), not rebuffering, so buffering only tracks two causes:
// - `seek`     : buffering caused by the user jumping to an un-buffered position
// - `rebuffer` : buffering during normal playback — the true QoE signal
type BufferingCause = 'seek' | 'rebuffer';
// How an episode ended — lets the backend separate tolerated stalls (recovery)
// from abandonment-during-buffer (pause / viewEnd with no resume).
type BufferingEnd = 'recovery' | 'pause' | 'viewEnd';

interface BufferingOccurrence {
  atTime: number;
  duration: number;
  cause: BufferingCause;
  endedBy: BufferingEnd;
}

interface CauseTotals {
  count: number;
  totalDuration: number;
}

// Buffering is derived from `waiting`/`stalled` (stall begins) and `playing`
// (candidate recovery, debounced so a flapping burst counts as one episode).
// Episodes are accumulated, classified by cause, and emitted as a single
// authoritative summary at view end: exact totals over every episode, a
// per-cause breakdown, and a bounded array of detail (incl. a stall still in
// progress at exit). Pre-playback stalls are ignored (they are join time), and
// a user pause ends the current episode so paused time is never counted.
export const registerBufferingEvent = (
  playerAdapter: PlayerAdapter,
  reportEvent: ReportEvent,
  registerFinalizer: RegisterFinalizer,
): UnregisterEvent => {
  let episodeStartTime: number | null = null;
  let episodeCause: BufferingCause = 'rebuffer';
  let pendingRecoveryTime: number | null = null;
  let recoveryTimerId: ReturnType<typeof setTimeout> | null = null;

  let hasStartedPlayback = false;
  let isSeeking = false;

  let count = 0;
  let totalDuration = 0;
  let maxDuration = 0;
  const byCause: Record<BufferingCause, CauseTotals> = {
    seek: { count: 0, totalDuration: 0 },
    rebuffer: { count: 0, totalDuration: 0 },
  };
  const occurrences: BufferingOccurrence[] = [];

  const clearRecoveryTimer = () => {
    if (recoveryTimerId !== null) {
      clearTimeout(recoveryTimerId);
      recoveryTimerId = null;
    }
  };

  const classifyCause = (): BufferingCause => (isSeeking ? 'seek' : 'rebuffer');

  const recordEpisode = (atTime: number, duration: number, cause: BufferingCause, endedBy: BufferingEnd) => {
    if (duration < MIN_BUFFERING_MS) {
      return;
    }

    count += 1;
    totalDuration += duration;
    maxDuration = Math.max(maxDuration, duration);
    byCause[cause].count += 1;
    byCause[cause].totalDuration += duration;
    if (occurrences.length < MAX_OCCURRENCES) {
      occurrences.push({ atTime, duration, cause, endedBy });
    }
  };

  const endEpisode = (endTime: number, endedBy: BufferingEnd) => {
    clearRecoveryTimer();
    if (episodeStartTime === null) {
      return;
    }

    recordEpisode(episodeStartTime, endTime - episodeStartTime, episodeCause, endedBy);
    episodeStartTime = null;
    pendingRecoveryTime = null;
  };

  // A stall begins (or relapses during the grace period): (re)enter the episode.
  const onStall = () => {
    clearRecoveryTimer();
    pendingRecoveryTime = null;
    // Stalls before the first frame are startup/join time, not rebuffering.
    if (!hasStartedPlayback) {
      return;
    }
    if (episodeStartTime === null) {
      episodeStartTime = Date.now();
      episodeCause = classifyCause();
    }
  };

  // Confirmed recovery: playback stayed healthy for the whole grace period.
  const onPlaying = () => {
    hasStartedPlayback = true;
    if (episodeStartTime === null) {
      return;
    }

    pendingRecoveryTime = Date.now();
    clearRecoveryTimer();
    recoveryTimerId = setTimeout(() => endEpisode(pendingRecoveryTime as number, 'recovery'), RECOVERY_GRACE_MS);
  };

  // A user pause interrupts a stall: end the episode now so paused time (until a
  // later resume fires `playing`) is not counted as buffering.
  const onPause = () => {
    if (episodeStartTime === null) {
      return;
    }
    endEpisode(pendingRecoveryTime !== null ? pendingRecoveryTime : Date.now(), 'pause');
  };

  const onSeeking = () => {
    isSeeking = true;
  };
  const onSeeked = () => {
    isSeeking = false;
  };

  // Emit the single summary right before the view's events are flushed.
  const finalize = () => {
    clearRecoveryTimer();

    // Close out a stall still in progress when the view ends.
    if (episodeStartTime !== null) {
      recordEpisode(episodeStartTime, Date.now() - episodeStartTime, episodeCause, 'viewEnd');
      episodeStartTime = null;
      pendingRecoveryTime = null;
    }

    if (count === 0) {
      return;
    }

    reportEvent(VIDEO_EVENT.BUFFERING, {
      count,
      totalDuration,
      maxDuration,
      byCause,
      occurrences,
      occurrencesTruncated: count > occurrences.length,
    });
  };

  const removeListeners = [
    playerAdapter.onWaiting(onStall),
    playerAdapter.onStalled(onStall),
    playerAdapter.onPlaying(onPlaying),
    playerAdapter.onPause(onPause),
    playerAdapter.onSeeking(onSeeking),
    playerAdapter.onSeeked(onSeeked),
  ];
  registerFinalizer(finalize);

  return () => {
    clearRecoveryTimer();
    removeListeners.forEach((removeListener) => removeListener());
  };
};
