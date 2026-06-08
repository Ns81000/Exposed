import { useEffect, useCallback } from 'react';
import { useTrackerStore } from './useTrackerStore';

const SECRET_SEQUENCE = ['e', 'x', 'p', 'o', 's', 'e', 'd'];
const SEQUENCE_TIMEOUT = 3000;

export function useDemoMode(onActivate, onDeactivate) {
  const demoMode = useTrackerStore((s) => s.demoMode);
  const setDemoMode = useTrackerStore((s) => s.setDemoMode);

  const toggle = useCallback(() => {
    const next = !demoMode;
    setDemoMode(next);
    if (next) {
      onActivate?.();
    } else {
      onDeactivate?.();
    }
  }, [demoMode, setDemoMode, onActivate, onDeactivate]);

  useEffect(() => {
    let armed = false;
    let seqIndex = 0;
    let timer = null;

    function resetSequence() {
      seqIndex = 0;
      armed = false;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }

    function handleKeyDown(e) {
      // Step 1: Detect Ctrl+Shift+D to arm the sequence listener
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        armed = true;
        seqIndex = 0;

        // Auto-disarm after timeout
        if (timer) clearTimeout(timer);
        timer = setTimeout(resetSequence, SEQUENCE_TIMEOUT);
        return;
      }

      // Step 2: While armed, listen for the secret word
      if (!armed) return;

      const expected = SECRET_SEQUENCE[seqIndex];
      if (e.key.toLowerCase() === expected) {
        seqIndex++;
        if (seqIndex === SECRET_SEQUENCE.length) {
          // Full sequence matched — toggle demo mode
          toggle();
          resetSequence();
        }
      } else {
        // Wrong key, reset
        resetSequence();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timer) clearTimeout(timer);
    };
  }, [toggle]);

  return demoMode;
}
