import { useState } from 'react';
import TrialCard from '../components/TrialCard.jsx';
import { aiService } from '../services/aiService.js';
import { searchService } from '../services/searchService.js';

const defaultInsight = {
  answer: `Current trends in **Immunotherapy for Non-Small Cell Lung Cancer (NSCLC)** are shifting significantly toward combination regimens and personalized neoantigen targets. The integration of PD-1/PD-L1 inhibitors with novel antibody-drug conjugates (ADCs) has shown a marked increase in progression-free survival across recent Phase II and III trials.

Specifically, the clinical community is observing a focus on 'Next-Gen' checkpoints. Beyond standard Pembrolizumab protocols, new investigations into TIGIT and LAG-3 pathways are yielding promising results for patients who previously exhibited resistance to mono-immunotherapy. Data suggests that patients with high TMB (Tumor Mutational Burden) are responding exceptionally well to these dual-checkpoint blockades.

Furthermore, the emergence of liquid biopsy as a standard monitoring tool during immunotherapy treatment is allowing clinicians to pivot strategies in real-time, identifying metabolic escape routes before radiological progression occurs.`,
  confidence: 98.4,
  sources: [
    {
      title: "PD-L1 Targeted Therapy in Stage III NSCLC",
      status: "RECRUITING",
      nct_id: "NCT04561234",
      phase: "Phase III",
      condition: "Oncology",
      shortSummary: "A randomized, double-blind, multicenter study evaluating the efficacy and safety of novel PD-L1 inhibitors compared to standard chemotherapy in previously untreated patients."
    },
    {
      title: "Combination ADC and Checkpoint Inhibitors",
      status: "RECRUITING",
      nct_id: "NCT05219908",
      phase: "Phase II",
      condition: "Immunotherapy",
      shortSummary: "Investigating the synergistic effects of Antibody-Drug Conjugates when administered alongside established PD-1 blockade therapy for advanced metastatic lung cancer."
    },
    {
      title: "TIGIT-Pathway Modulation in Refractory NSCLC",
      status: "RECRUITING",
      nct_id: "NCT04882145",
      phase: "Phase I/II",
      condition: "Targeted",
      shortSummary: "Exploring safety and preliminary efficacy of TIGIT inhibition in patients who have failed at least two prior lines of immunotherapy treatments."
    }
  ]
};

const AIAssistant = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Current active results display
  const [insight, setInsight] = useState(defaultInsight.answer);
  const [confidence, setConfidence] = useState(defaultInsight.confidence);
  const [sources, setSources] = useState(defaultInsight.sources);
  const [isSearchIconFocused, setIsSearchIconFocused] = useState(false);

  // Trigger RAG search
  const handleSearch = async (queryText) => {
    if (!queryText.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const data = await aiService.getAiResults(queryText);
      
      if (data && data.success) {
        setInsight(data.answer);
        
        const rawSources = data.source || [];
        const maxScore = rawSources.length > 0 ? Math.max(...rawSources.map(s => s.score || 0)) : 0;
        const calculatedConfidence = maxScore > 0
          ? Math.min(100, parseFloat((maxScore * 100).toFixed(1)))
          : 0;

        setConfidence(calculatedConfidence);

        // Fetch details for each source trial in parallel to render full TrialCards
        const detailedSources = await Promise.all(
          rawSources.map(async (src) => {
            try {
              if (src.nctId) {
                const detailRes = await searchService.getTrialsById(src.nctId);
                if (detailRes && detailRes.success && detailRes.data) {
                  return {
                    ...src,
                    ...detailRes.data,
                    nct_id: detailRes.data.nct_id || detailRes.data.nctId || src.nctId
                  };
                }
              }
            } catch (err) {
              console.error("Error fetching detailed trial info for", src.nctId, err);
            }
            // Fallback representation if backend details fail or are not found
            return {
              ...src,
              title: src.title || "Reference Trial",
              nct_id: src.nctId,
              status: "RECRUITING",
              phase: "Phase III",
              condition: "Research Study",
              shortSummary: `This study is a cited reference in the AI generated medical analysis (Match Score: ${(src.score * 100).toFixed(1)}%).`
            };
          })
        );
        
        setSources(detailedSources);
      } else {
        throw new Error(data?.message || "Failed to retrieve AI insights.");
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || "Connection timeout or search error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const handleTrendingClick = (e, topic) => {
    e.preventDefault();
    setSearchQuery(topic);
    handleSearch(topic);
  };

  const handleExport = () => {
    window.print();
  };

  // Helper to format answer markdown into HTML tags (handling paragraph splits & bold highlights)
  const formatAnswerText = (text) => {
    if (!text) return null;
    return text.split('\n\n').map((paragraph, pIdx) => {
      const parts = paragraph.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={pIdx} className="mb-md text-on-surface-variant leading-relaxed">
          {parts.map((part, partIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={partIdx} className="text-primary font-semibold">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col antialiased">
      {/* Navigation Header */}
      <header className="w-full top-0 sticky bg-surface-container-lowest border-b border-surface-variant z-50">
        <div className="flex items-center justify-between px-lg max-w-container-max mx-auto h-20">
          <div className="flex items-center gap-md cursor-pointer active:opacity-80" onClick={() => onNavigate('home')}>
            <span className="material-symbols-outlined text-primary text-[32px]">clinical_notes</span>
            <h1 className="font-headline-md text-headline-md text-primary tracking-tight font-semibold">Clinical Sutra</h1>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-xl">
            <a 
              className="text-on-surface-variant font-body-md text-body-md transition-colors hover:bg-surface-container-low px-sm py-xs rounded" 
              href="#home" 
              onClick={(e) => { e.preventDefault(); onNavigate('home'); }}
            >
              Home
            </a>
            <a 
              className="text-secondary font-bold font-body-md text-body-md transition-colors hover:bg-surface-container-low px-sm py-xs rounded" 
              href="#ai" 
              onClick={(e) => e.preventDefault()}
            >
              AI Assistant
            </a>
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
              className="text-on-surface-variant font-body-md text-body-md transition-colors hover:bg-surface-container-low px-sm py-sm rounded block text-left" 
              href="#home" 
              onClick={(e) => {
                e.preventDefault(); 
                onNavigate('home');
                setIsMobileMenuOpen(false);
              }}
            >
              Home
            </a>
            <a 
              className="text-secondary font-bold font-body-md text-body-md transition-colors hover:bg-surface-container-low px-sm py-sm rounded block text-left" 
              href="#ai" 
              onClick={(e) => {
                e.preventDefault();
                setIsMobileMenuOpen(false);
              }}
            >
              AI Assistant
            </a>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {/* Search / Hero Section */}
        <section className="hero-gradient pt-xl pb-16 px-gutter border-b border-surface-variant">
          <div className="max-w-container-max mx-auto text-center">
            <h2 className="font-display-lg text-display-lg text-primary mb-lg leading-tight">
              Explore Clinical Intelligence
            </h2>
            
            {/* Search Input Container */}
            <form onSubmit={handleSearchSubmit} className="relative max-w-3xl mx-auto group">
              <span className={`material-symbols-outlined absolute left-lg top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                isSearchIconFocused ? 'text-secondary' : 'text-outline'
              }`}>
                search
              </span>
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchIconFocused(true)}
                onBlur={() => setIsSearchIconFocused(false)}
                placeholder="Ask about clinical trials, outcomes, or medical insights..." 
                className="w-full pl-14 pr-16 py-lg rounded-xl border border-outline-variant focus:border-secondary focus:ring-4 focus:ring-secondary/10 bg-white clinical-shadow transition-all text-body-lg font-body-lg placeholder:text-outline-variant outline-none"
              />
              <button 
                type="submit"
                className="absolute right-md top-1/2 -translate-y-1/2 bg-primary text-white p-sm rounded-lg hover:bg-primary-container transition-colors cursor-pointer flex items-center justify-center"
              >
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </form>

            <div className="mt-md flex gap-sm justify-center flex-wrap items-center">
              <span className="text-label-md text-outline">Trending:</span>
              <a 
                href="#trend1"
                onClick={(e) => handleTrendingClick(e, 'Immunotherapy NSCLC')}
                className="text-label-md text-secondary cursor-pointer hover:underline font-semibold"
              >
                Immunotherapy NSCLC
              </a>
              <span className="text-label-md text-outline-variant">•</span>
              <a 
                href="#trend2"
                onClick={(e) => handleTrendingClick(e, 'CAR-T Cell Phase II')}
                className="text-label-md text-secondary cursor-pointer hover:underline font-semibold"
              >
                CAR-T Cell Phase II
              </a>
              <span className="text-label-md text-outline-variant">•</span>
              <a 
                href="#trend3"
                onClick={(e) => handleTrendingClick(e, 'FDA 2024 Approvals')}
                className="text-label-md text-secondary cursor-pointer hover:underline font-semibold"
              >
                FDA 2024 Approvals
              </a>
            </div>
          </div>
        </section>

        {/* Results / Insights Section */}
        <section className="py-xl px-gutter max-w-container-max mx-auto">
          {error && (
            <div className="max-w-3xl mx-auto mb-lg p-lg bg-error-container border border-outline-variant rounded-xl text-on-error-container text-left flex items-start gap-md">
              <span className="material-symbols-outlined text-error text-[28px]">error</span>
              <div>
                <h4 className="font-semibold text-body-lg mb-xs">Search failed</h4>
                <p className="text-body-sm text-on-surface-variant">{error}</p>
              </div>
            </div>
          )}

          {isLoading ? (
            /* Loading State */
            <div className="max-w-5xl mx-auto space-y-xl">
              {/* Insight Skeleton */}
              <div className="bg-white border border-outline-variant rounded-xl p-xl ai-glow animate-pulse text-left">
                <div className="flex items-center gap-md mb-lg">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high" />
                  <div className="space-y-2 flex-grow">
                    <div className="h-5 bg-surface-container-high rounded w-1/4" />
                    <div className="h-3 bg-surface-container-high rounded w-1/6" />
                  </div>
                </div>
                <div className="space-y-4 max-w-4xl">
                  <div className="h-4 bg-surface-container-high rounded w-full" />
                  <div className="h-4 bg-surface-container-high rounded w-5/6" />
                  <div className="h-4 bg-surface-container-high rounded w-11/12" />
                  <div className="h-4 bg-surface-container-high rounded w-3/4" />
                </div>
                <div className="mt-xl pt-lg border-t border-outline-variant flex items-center justify-between">
                  <div className="h-5 bg-surface-container-high rounded w-1/3" />
                  <div className="h-5 bg-surface-container-high rounded w-20" />
                </div>
              </div>

              {/* Source Cards Skeleton */}
              <div>
                <div className="h-6 bg-surface-container-high rounded w-1/5 mb-lg animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                  {[...Array(3)].map((_, idx) => (
                    <div key={idx} className="h-64 bg-white border border-outline-variant p-lg rounded-xl animate-pulse flex flex-col space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="h-4 bg-surface-container-high rounded w-1/4" />
                        <div className="h-3 bg-surface-container-high rounded w-1/4" />
                      </div>
                      <div className="h-6 bg-surface-container-high rounded w-3/4" />
                      <div className="h-4 bg-surface-container-high rounded w-1/2" />
                      <div className="h-12 bg-surface-container-high rounded w-full flex-grow" />
                      <div className="h-8 bg-surface-container-high rounded w-full mt-auto" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Results Content */
            <div className="max-w-5xl mx-auto space-y-xl text-left">
              {/* Synthesized Insight Card */}
              {insight && (
                <div className="bg-white border border-outline-variant rounded-xl p-xl ai-glow transition-all duration-300">
                  <div className="flex items-center gap-md mb-lg">
                    <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                        auto_awesome
                      </span>
                    </div>
                    <div>
                      <h2 className="font-headline-md text-headline-md text-primary">Synthesized Insight</h2>
                      <p className="text-label-md font-label-md text-secondary uppercase tracking-widest">Medical AI Analysis</p>
                    </div>
                  </div>

                  <div className="space-y-lg text-body-lg font-body-lg text-on-surface-variant max-w-4xl">
                    {formatAnswerText(insight)}
                  </div>

                  <div className="mt-xl pt-lg border-t border-outline-variant flex flex-col sm:flex-row gap-md items-center justify-between">
                    <div className="flex gap-md items-center w-full sm:w-auto">
                      <span className="text-label-md font-label-md text-on-surface-variant whitespace-nowrap">
                        Confidence Score: {confidence}%
                      </span>
                      <div className="w-32 h-1 bg-surface-container-highest rounded-full overflow-hidden">
                        <div 
                          className="bg-secondary h-full transition-all duration-[1500ms] ease-out" 
                          style={{ width: `${confidence}%` }}
                        />
                      </div>
                    </div>
                    <button 
                      onClick={handleExport}
                      className="flex items-center gap-xs text-primary font-label-md hover:text-secondary transition-colors cursor-pointer border border-outline-variant hover:bg-surface-container-low px-md py-sm rounded-lg"
                    >
                      <span className="material-symbols-outlined text-[18px]">share</span>
                      Export Report
                    </button>
                  </div>
                </div>
              )}

              {/* Primary Sources Section */}
              {sources && sources.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-lg">
                    <h3 className="font-headline-md text-headline-md text-primary">Primary Sources</h3>
                    <span className="text-label-md font-label-md text-outline uppercase tracking-wider">
                      Cited References ({sources.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                    {sources.map((src, index) => (
                      <TrialCard
                        key={src.id || src.trialId || index}
                        title={src.title}
                        condition={src.condition || src.conditions?.join(", ")}
                        phase={src.phase}
                        status={src.status}
                        shortSummary={src.shortSummary}
                        nct_id={src.nct_id}
                        created_at={src.created_at}
                      />
                    ))}
                  </div>
                </div>
              )}
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

export default AIAssistant;
