import { useState } from 'react';
import Home from './pages/Home';
import AIAssistant from './pages/AIAssistant';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <>
      {currentPage === 'home' ? (
        <Home onNavigate={setCurrentPage} />
      ) : (
        <AIAssistant onNavigate={setCurrentPage} />
      )}
    </>
  );
}

export default App;