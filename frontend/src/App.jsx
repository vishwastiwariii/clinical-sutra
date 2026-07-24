import Navbar from './components/layout/Navbar.jsx';
import AssistantPanel from './components/assistant/AssistantPanel.jsx';
import Home from './pages/Home.jsx';
import TrialDetail from './pages/TrialDetail.jsx';
import RouterProvider from './state/RouterProvider.jsx';
import TrialsProvider from './state/TrialsProvider.jsx';
import AssistantProvider from './state/AssistantProvider.jsx';
import { useRouter } from './state/contexts.js';

function Routes() {
  const { route } = useRouter();
  return route.name === 'trial' ? <TrialDetail nctId={route.nctId} /> : <Home />;
}

export default function App() {
  return (
    <RouterProvider>
      <TrialsProvider>
        <AssistantProvider>
          <div className="flex min-h-screen flex-col bg-paper text-ink">
            <Navbar />
            <Routes />
            <AssistantPanel />
          </div>
        </AssistantProvider>
      </TrialsProvider>
    </RouterProvider>
  );
}
