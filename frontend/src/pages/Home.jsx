import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar.jsx';
import DataCard from '../components/TrialCard.jsx';
import { searchService } from '../services/searchService.js';

const Home = () => {
  const [studies, setStudies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);

  // 1. Initial Lifecycle Hook: Fetch data when page first loads
  useEffect(() => {
    fetchStudiesData();
  }, []);

  // 2. Core Fetch Function: Shared between landing load and search submissions
  const fetchStudiesData = async (query = '') => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Calls the API Service layer passing query params if they exist
      const data = await searchService.getTrialsBySearch(query);
      setStudies(data?.result?.results || []);
      setTotalRecords(data?.result?.total || 0);
    } catch (err) {
      // Catches server/network errors gracefully from the interceptor
      setError(err || "Failed to sync records database. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Triggered when user clicks "Search" or presses "Enter"
  const handleSearchSubmit = (query) => {
    setSearchQuery(query);
    fetchStudiesData(query); // Triggers API call with network parameters
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      
      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-sm">
              Ω
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Clinical<span className="text-indigo-600 font-medium">Sutra</span>
            </span>
          </div>
          <nav className="flex gap-6 text-sm font-medium text-slate-600">
            <a href="#dashboard" className="text-indigo-600">Dashboard</a>
            <a href="#analytics" className="hover:text-slate-900 transition-colors">Analytics</a>
          </nav>
        </div>
      </header>

      {/* Search Header Hero section */}
      <section className="bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Clinical Trials Registry Explorer
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto mb-8 text-sm sm:text-base leading-relaxed">
            Search active conditions, phases, and research parameters across globally mapped medical datasets.
          </p>
          
          <div className="max-w-xl mx-auto">
            <SearchBar onSearchSubmit={handleSearchSubmit} placeholder="Search by condition, phase, or keywords..." />
          </div>
        </div>
      </section>

      {/* Main Dashboard Layout */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1">
        
        {/* Dynamic Context Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Available Studies</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {searchQuery ? `Showing API results for "${searchQuery}"` : "Displaying live database server records"}
            </p>
          </div>
          {!isLoading && !error && (
            <span className="bg-slate-200/60 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {totalRecords} Records Found
            </span>
          )}
        </div>

        {/* State Conditional Rendering Engine */}
        {isLoading ? (
          /* Loading skeleton blocks grid layout */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-white border border-slate-200 rounded-2xl animate-pulse flex flex-col p-6 space-y-4">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <hr className="border-slate-100" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-slate-200 rounded" />
                  <div className="h-3 bg-slate-200 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error State Alert Box UI Layout */
          <div className="max-w-md mx-auto text-center py-12 px-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800">
            <span className="text-3xl">⚠️</span>
            <h4 className="text-base font-bold mt-2">Network Sync Failure</h4>
            <p className="text-xs text-rose-600 mt-1 mb-4">{error}</p>
            <button 
              onClick={() => fetchStudiesData(searchQuery)}
              className="px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 text-xs font-semibold rounded-lg shadow transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : studies.length > 0 ? (
          /* Success State: Data Grid layout maps backend results to Card components */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studies.map((study) => (
              <DataCard
                key={study.id || study._id} // Flexible fallback depending on DB schema setup (SQL ID vs MongoDB _id)
                title={study.title}
                condition={study.condition}
                phase={study.phase}
                status={study.status}
                shortSummary={study.shortSummary}
              />
            ))}
          </div>
        ) : (
          /* Empty Search Fallback Layout UI */
          <div className="max-w-md mx-auto text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="text-4xl mb-4">🔍</div>
            <h4 className="text-base font-bold text-slate-800 mb-1">No Server Matches</h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto mb-5">
              The query parameters <span className="font-semibold text-slate-700">"{searchQuery}"</span> yielded 0 database records.
            </p>
            <button 
              onClick={() => handleSearchSubmit('')} 
              className="px-4 py-2 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Reset Search Parameters
            </button>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-400">
        © 2026 Clinical Sutra Inc. Live database secure transmission encrypted.
      </footer>
    </div>
  );
};

export default Home;