import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar.jsx';
import TrialCard from '../components/TrialCard.jsx';
import { searchService } from '../services/searchService.js';

const Home = ({ onNavigate }) => {
  const [studies, setStudies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPagesCount, setTotalPagesCount] = useState(0);
  const [page, setPage] = useState(1);

  // Filter & Sorting state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  // Initial Fetch
  useEffect(() => {
    fetchStudiesData('', '', '', 1, false);
  }, []);

  // Fetch API handler
  const fetchStudiesData = async (query = searchQuery, status = selectedStatus, phase = selectedPhase, targetPage = 1, isLoadMore = false) => {
    if (targetPage === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);
    
    try {
      const params = {
        q: query,
        page: targetPage,
        limit: 9, // 9 items per page
      };
      if (status) params.status = status;
      if (phase) params.phase = phase;

      const data = await searchService.getTrialsBySearch(params);
      const newResults = data?.result?.results || [];
      const total = data?.result?.total || 0;
      const totalPages = data?.result?.totalPages || 0;

      setStudies(prev => isLoadMore ? [...prev, ...newResults] : newResults);
      setTotalRecords(total);
      setTotalPagesCount(totalPages);
      setPage(targetPage);
    } catch (err) {
      setError(err || "Failed to sync records database. Please try again.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleSearchSubmit = (query) => {
    setSearchQuery(query);
    fetchStudiesData(query, selectedStatus, selectedPhase, 1, false);
  };

  const handlePhaseChange = (phase) => {
    setSelectedPhase(phase);
    fetchStudiesData(searchQuery, selectedStatus, phase, 1, false);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    fetchStudiesData(searchQuery, status, selectedPhase, 1, false);
  };

  const handleTrendingClick = (tag) => {
    setSearchQuery(tag);
    fetchStudiesData(tag, selectedStatus, selectedPhase, 1, false);
  };

  const handleLoadMore = () => {
    fetchStudiesData(searchQuery, selectedStatus, selectedPhase, page + 1, true);
  };

  const handleResetAll = () => {
    setSearchQuery('');
    setSelectedStatus('');
    setSelectedPhase('');
    setSortOrder('newest');
    fetchStudiesData('', '', '', 1, false);
  };

  // Client-side sort memo
  const sortedStudies = React.useMemo(() => {
    const studiesCopy = [...studies];
    if (sortOrder === 'title_asc') {
      return studiesCopy.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }
    if (sortOrder === 'title_desc') {
      return studiesCopy.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    }
    if (sortOrder === 'nct_asc') {
      return studiesCopy.sort((a, b) => (a.nct_id || '').localeCompare(b.nct_id || ''));
    }
    return studiesCopy;
  }, [studies, sortOrder]);

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col antialiased">
      
      {/* Navigation Header */}
      <header className="w-full top-0 sticky bg-surface-container-lowest border-b border-surface-variant z-50">
        <div className="flex items-center justify-between px-lg max-w-container-max mx-auto h-20">
          <div className="flex items-center gap-md cursor-pointer active:opacity-80" onClick={handleResetAll}>
            <span className="material-symbols-outlined text-primary text-[32px]">clinical_notes</span>
            <h1 className="font-headline-md text-headline-md text-primary tracking-tight font-semibold">Clinical Sutra</h1>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-xl">
            <a className="text-secondary font-bold font-body-md text-body-md transition-colors hover:bg-surface-container-low px-sm py-xs rounded" href="#home" onClick={(e) => { e.preventDefault(); handleResetAll(); }}>Home</a>
            <a className="text-on-surface-variant font-body-md text-body-md transition-colors hover:bg-surface-container-low px-sm py-xs rounded" href="#ai" onClick={(e) => { e.preventDefault(); onNavigate('ai'); }}>AI Assistant</a>
            <button className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-low p-sm rounded-full transition-colors cursor-pointer">search</button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-low p-sm rounded-full transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? 'close' : 'menu'}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-surface-container-lowest border-b border-surface-variant px-lg py-md flex flex-col gap-sm">
            <a 
              className="text-secondary font-bold font-body-md text-body-md transition-colors hover:bg-surface-container-low px-sm py-sm rounded block text-left" 
              href="#home" 
              onClick={(e) => {
                e.preventDefault(); 
                handleResetAll();
                setIsMobileMenuOpen(false);
              }}
            >
              Home
            </a>
            <a 
              className="text-on-surface-variant font-body-md text-body-md transition-colors hover:bg-surface-container-low px-sm py-sm rounded block text-left" 
              href="#ai" 
              onClick={(e) => {
                e.preventDefault();
                setIsMobileMenuOpen(false);
                onNavigate('ai');
              }}
            >
              AI Assistant
            </a>
          </div>
        )}
      </header>

      <main className="flex-grow">
        
        {/* Hero Section */}
        <section className="hero-gradient pt-xl pb-24 px-gutter">
          <div className="max-w-container-max mx-auto text-center">
            <h2 className="font-display-lg text-display-lg text-primary mb-lg leading-tight">
              Discover Tomorrow's&nbsp;
              <div className="inline md:block">Treatments</div>
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl max-w-2xl mx-auto">
              Access global clinical trial data with AI-enhanced analysis for oncology, rare diseases, and genetic interventions.
            </p>
            
            {/* Search Bar Container */}
            <div className="relative max-w-3xl mx-auto">
              <SearchBar 
                onSearchSubmit={handleSearchSubmit} 
                value={searchQuery}
                placeholder="Search trials by condition, intervention, or gene mutation..." 
              />
              <div className="mt-md flex gap-sm justify-center flex-wrap items-center">
                <span className="text-label-md text-outline">Trending:</span>
                <span 
                  onClick={() => handleTrendingClick('NSCLC Phase III')}
                  className="text-label-md text-secondary cursor-pointer hover:underline font-semibold"
                >
                  NSCLC Phase III
                </span>
                <span 
                  onClick={() => handleTrendingClick('CAR-T Cell Therapy')}
                  className="text-label-md text-secondary cursor-pointer hover:underline font-semibold"
                >
                  CAR-T Cell Therapy
                </span>
                <span 
                  onClick={() => handleTrendingClick('BRCA1 Mutations')}
                  className="text-label-md text-secondary cursor-pointer hover:underline font-semibold"
                >
                  BRCA1 Mutations
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Trials Section */}
        <section className="py-xl px-gutter max-w-container-max mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-lg gap-sm">
            <h3 className="font-headline-md text-headline-md text-primary text-left font-semibold">Featured Clinical Trials</h3>
            <div className="flex gap-sm justify-start sm:justify-end">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-xs px-md py-sm border rounded-lg font-label-md text-label-md transition-colors cursor-pointer ${
                  isFilterOpen ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant hover:bg-surface-container-low text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">filter_list</span> Filter
              </button>
              <button 
                onClick={() => setIsSortOpen(!isSortOpen)}
                className={`flex items-center gap-xs px-md py-sm border rounded-lg font-label-md text-label-md transition-colors cursor-pointer ${
                  isSortOpen ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant hover:bg-surface-container-low text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">sort</span> Sort
              </button>
            </div>
          </div>

          {/* Filter options */}
          {isFilterOpen && (
            <div className="mb-lg p-lg bg-surface-container-low border border-outline-variant rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-md text-left transition-all duration-200">
              <div>
                <label className="block text-label-md text-outline uppercase tracking-wider mb-xs font-semibold">Phase</label>
                <select 
                  value={selectedPhase} 
                  onChange={(e) => handlePhaseChange(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded p-sm text-body-md text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="">All Phases</option>
                  <option value="PHASE1">Phase I</option>
                  <option value="PHASE2">Phase II</option>
                  <option value="PHASE3">Phase III</option>
                  <option value="PHASE4">Phase IV</option>
                  <option value="NA">Phase N/A</option>
                </select>
              </div>
              <div>
                <label className="block text-label-md text-outline uppercase tracking-wider mb-xs font-semibold">Recruitment Status</label>
                <select 
                  value={selectedStatus} 
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded p-sm text-body-md text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="">All Statuses</option>
                  <option value="RECRUITING">Recruiting</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="TERMINATED">Terminated</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                </select>
              </div>
            </div>
          )}

          {/* Sort options */}
          {isSortOpen && (
            <div className="mb-lg p-md bg-surface-container-low border border-outline-variant rounded-lg flex justify-end gap-sm text-left transition-all duration-200">
              <div className="w-full sm:w-48">
                <label className="block text-label-md text-outline uppercase tracking-wider mb-xs font-semibold">Sort By</label>
                <select 
                  value={sortOrder} 
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded p-sm text-body-md text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="newest">Newest Updated</option>
                  <option value="title_asc">Title (A-Z)</option>
                  <option value="title_desc">Title (Z-A)</option>
                  <option value="nct_asc">NCT ID (A-Z)</option>
                </select>
              </div>
            </div>
          )}

          {/* Dynamic count / reset filters row */}
          {(selectedPhase || selectedStatus || searchQuery) && (
            <div className="flex items-center justify-between bg-surface-container-lowest border border-surface-variant p-sm px-md rounded-lg mb-lg">
              <span className="text-body-sm text-on-surface-variant">
                Filtered: <span className="font-semibold text-primary">{totalRecords}</span> trials found
                {searchQuery && <span> for "{searchQuery}"</span>}
              </span>
              <button 
                onClick={handleResetAll}
                className="text-label-md text-secondary hover:underline font-semibold cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Grid Layout Container */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-surface-container-lowest border border-surface-variant p-lg rounded-lg animate-pulse flex flex-col space-y-4 text-left">
                  <div className="flex justify-between items-center">
                    <div className="h-5 bg-surface-container rounded w-1/4" />
                    <div className="h-4 bg-surface-container rounded w-1/4" />
                  </div>
                  <div className="h-6 bg-surface-container rounded w-3/4" />
                  <div className="flex gap-xs">
                    <div className="h-5 bg-surface-container rounded w-16" />
                    <div className="h-5 bg-surface-container rounded w-16" />
                  </div>
                  <div className="space-y-2 flex-grow">
                    <div className="h-3 bg-surface-container rounded w-full" />
                    <div className="h-3 bg-surface-container rounded w-5/6" />
                  </div>
                  <div className="h-6 bg-surface-container rounded w-full pt-md border-t border-surface-variant" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="max-w-md mx-auto text-center py-12 px-6 bg-error-container border border-outline-variant rounded-lg text-on-error-container">
              <span className="material-symbols-outlined text-[48px] text-error mb-2">warning</span>
              <h4 className="font-headline-md text-headline-md text-primary mb-sm font-semibold">Network Sync Failure</h4>
              <p className="text-body-sm text-on-surface-variant mb-md">{error}</p>
              <button 
                onClick={() => fetchStudiesData(searchQuery, selectedStatus, selectedPhase, 1, false)}
                className="px-xl py-md bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer"
              >
                Retry Connection
              </button>
            </div>
          ) : sortedStudies.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                {sortedStudies.map((study) => (
                  <TrialCard
                    key={study.id}
                    title={study.title}
                    condition={study.condition}
                    phase={study.phase}
                    status={study.status}
                    shortSummary={study.shortSummary}
                    nct_id={study.nct_id}
                    created_at={study.created_at}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {page < totalPagesCount && (
                <div className="mt-xl text-center">
                  <button 
                    disabled={isLoadingMore}
                    onClick={handleLoadMore}
                    className="px-xl py-md border-2 border-secondary text-secondary rounded-lg font-headline-md text-body-md hover:bg-secondary/5 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoadingMore ? 'Loading...' : 'Load More Trials'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="max-w-md mx-auto text-center py-16 bg-surface-container-lowest border border-surface-variant rounded-lg p-8 shadow-sm">
              <span className="material-symbols-outlined text-[48px] text-outline mb-2">search_off</span>
              <h4 className="font-headline-md text-headline-md text-primary mb-sm font-semibold">No Server Matches</h4>
              <p className="text-body-sm text-on-surface-variant leading-relaxed mb-md">
                The query parameters yielded 0 database records.
              </p>
              <button 
                onClick={handleResetAll} 
                className="px-xl py-md bg-surface-container text-on-surface hover:bg-surface-container-high rounded-lg font-label-md text-label-md transition-colors cursor-pointer"
              >
                Reset Search Parameters
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full mt-auto bg-surface-container border-t border-surface-variant">
        <div className="flex flex-col md:flex-row justify-between items-center px-lg py-xl max-w-container-max mx-auto gap-md">
          <div className="flex flex-col gap-xs text-left">
            <div className="font-label-md text-label-md text-secondary uppercase tracking-widest font-semibold">Clinical Discovery AI</div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">© 2026 Clinical Trial Discovery Assistant. Powered by Med-RAG Engine.</p>
          </div>
          <div className="flex gap-lg flex-wrap justify-center md:justify-end">
            <a className="text-on-surface-variant font-body-sm text-body-sm hover:text-primary transition-colors cursor-pointer text-decoration-none" href="#" onClick={(e) => e.preventDefault()}>Citations</a>
            <a className="text-on-surface-variant font-body-sm text-body-sm hover:text-primary transition-colors cursor-pointer text-decoration-none" href="#" onClick={(e) => e.preventDefault()}>Data Sources</a>
            <a className="text-on-surface-variant font-body-sm text-body-sm hover:text-primary transition-colors cursor-pointer text-decoration-none" href="#" onClick={(e) => e.preventDefault()}>Methodology</a>
            <a className="text-on-surface-variant font-body-sm text-body-sm hover:text-primary transition-colors cursor-pointer text-decoration-none" href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;