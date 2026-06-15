import { useEffect, useRef } from 'react';

const DEFAULT_INTERVAL_MS = 12000;

/**
 * Polls on an interval while the tab is visible, and when the window regains focus.
 */
export default function useEngagementPolling(callback, { enabled = true, intervalMs = DEFAULT_INTERVAL_MS } = {}) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return undefined;

    const run = () => {
      if (document.hidden) return;
      callbackRef.current?.();
    };

    run();
    const intervalId = window.setInterval(run, intervalMs);
    const onVisibility = () => {
      if (!document.hidden) run();
    };
    window.addEventListener('focus', run);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', run);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled, intervalMs]);
}
