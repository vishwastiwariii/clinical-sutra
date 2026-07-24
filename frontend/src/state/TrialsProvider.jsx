import { useEffect, useMemo, useReducer } from 'react';
import { trialsService } from '../services/trialsService.js';
import useDebouncedValue from '../hooks/useDebouncedValue.js';
import { TrialsContext } from './contexts.js';

/**
 * Single source of truth for the browse experience: the query, the filters,
 * the current page, and whatever the API last returned for that combination.
 * Home sections read from here rather than passing props down a chain.
 */
const PAGE_SIZE = 10;

const initialState = {
  query: '',
  status: '',
  phase: '',
  page: 1,
  limit: PAGE_SIZE,
  // Bumped by `refresh()` so a retry re-runs the fetch effect unchanged inputs.
  nonce: 0,
  items: [],
  total: 0,
  totalPages: 0,
  loading: true,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    // Any change to what we're searching for sends us back to page 1.
    case 'query':
      return { ...state, query: action.value, page: 1 };
    case 'filter':
      return { ...state, [action.key]: action.value, page: 1 };
    case 'page':
      return { ...state, page: action.value };
    case 'refresh':
      return { ...state, nonce: state.nonce + 1 };
    case 'reset':
      return { ...initialState, nonce: state.nonce + 1, loading: true };
    case 'fetch:start':
      return { ...state, loading: true, error: null };
    case 'fetch:success':
      return {
        ...state,
        loading: false,
        error: null,
        items: action.payload.items,
        total: action.payload.total,
        totalPages: action.payload.totalPages,
      };
    case 'fetch:error':
      return { ...state, loading: false, error: action.error, items: [], total: 0, totalPages: 0 };
    default:
      return state;
  }
}

export default function TrialsProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const debouncedQuery = useDebouncedValue(state.query, 350);

  const { status, phase, page, limit, nonce } = state;

  useEffect(() => {
    const controller = new AbortController();
    dispatch({ type: 'fetch:start' });

    trialsService
      .search({ q: debouncedQuery, page, limit, status, phase }, { signal: controller.signal })
      .then((payload) => dispatch({ type: 'fetch:success', payload }))
      .catch((error) => {
        if (controller.signal.aborted) return;
        dispatch({ type: 'fetch:error', error: error.message || 'Unable to load trials.' });
      });

    return () => controller.abort();
  }, [debouncedQuery, status, phase, page, limit, nonce]);

  const value = useMemo(
    () => ({
      ...state,
      // `query` updates instantly for the input; results trail it by a beat.
      isSettling: state.query !== debouncedQuery,
      hasFilters: Boolean(state.query || state.status || state.phase),
      setQuery: (v) => dispatch({ type: 'query', value: v }),
      setStatus: (v) => dispatch({ type: 'filter', key: 'status', value: v }),
      setPhase: (v) => dispatch({ type: 'filter', key: 'phase', value: v }),
      setPage: (v) => dispatch({ type: 'page', value: v }),
      refresh: () => dispatch({ type: 'refresh' }),
      reset: () => dispatch({ type: 'reset' }),
    }),
    [state, debouncedQuery],
  );

  return <TrialsContext.Provider value={value}>{children}</TrialsContext.Provider>;
}
