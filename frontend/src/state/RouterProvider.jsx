import { useCallback, useEffect, useMemo, useState } from 'react';
import { RouterContext } from './contexts.js';

/**
 * A ~40 line hash router — enough for two views, and it keeps back/forward and
 * deep links (#/trial/NCT05432817) working without pulling in a dependency.
 */
function parse(hash) {
  const path = hash.replace(/^#\/?/, '');
  const [segment, param] = path.split('/');
  if (segment === 'trial' && param) return { name: 'trial', nctId: decodeURIComponent(param) };
  return { name: 'home' };
}

export default function RouterProvider({ children }) {
  const [route, setRoute] = useState(() => parse(window.location.hash));

  useEffect(() => {
    const onChange = () => {
      setRoute(parse(window.location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((to) => {
    const hash = to === 'home' || !to ? '#/' : `#/trial/${encodeURIComponent(to.nctId ?? to)}`;
    if (window.location.hash === hash) setRoute(parse(hash));
    else window.location.hash = hash;
    window.scrollTo(0, 0);
  }, []);

  const value = useMemo(() => ({ route, navigate }), [route, navigate]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}
