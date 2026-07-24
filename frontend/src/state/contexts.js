import { createContext, useContext } from 'react';

/**
 * Context objects and their accessor hooks live here, apart from the provider
 * components, so each provider file exports components only (fast refresh).
 */
export const RouterContext = createContext(null);
export const TrialsContext = createContext(null);
export const AssistantContext = createContext(null);

function useRequiredContext(context, name, provider) {
  const value = useContext(context);
  if (!value) throw new Error(`${name} must be used inside <${provider}>`);
  return value;
}

export const useRouter = () => useRequiredContext(RouterContext, 'useRouter', 'RouterProvider');
export const useTrials = () => useRequiredContext(TrialsContext, 'useTrials', 'TrialsProvider');
export const useAssistant = () =>
  useRequiredContext(AssistantContext, 'useAssistant', 'AssistantProvider');
