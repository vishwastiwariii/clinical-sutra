import { useCallback, useEffect, useState } from 'react';
import { trialsService } from '../services/trialsService.js';

const pending = (key) => ({ key, trial: null, loading: true, error: null });

/** Loads a single trial by NCT ID, with retry. */
export default function useTrial(nctId) {
  const [nonce, setNonce] = useState(0);
  const key = `${nctId}#${nonce}`;
  const [state, setState] = useState(() => pending(key));

  // Reset to the loading state during render rather than in the effect, so we
  // never paint the previous trial under a new NCT ID.
  if (state.key !== key) setState(pending(key));

  const retry = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (!nctId) return undefined;
    const controller = new AbortController();

    trialsService
      .getByNctId(nctId, { signal: controller.signal })
      .then((trial) =>
        setState({ key, trial, loading: false, error: trial ? null : `No study found for ${nctId}.` }),
      )
      .catch((error) => {
        if (controller.signal.aborted) return;
        setState({ key, trial: null, loading: false, error: error.message || 'Unable to load this study.' });
      });

    return () => controller.abort();
  }, [nctId, key]);

  return { trial: state.trial, loading: state.loading, error: state.error, retry };
}
