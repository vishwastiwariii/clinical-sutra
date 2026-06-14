import React from 'react';

const TrialCard = ({ title, condition, phase, status, shortSummary, nct_id, created_at }) => {
    
    const getStatusStyles = (statusStr) => {
        const s = statusStr?.toUpperCase() || '';
        if (s.includes('RECRUITING')) {
            return 'bg-secondary-container text-on-secondary-container';
        }
        if (s.includes('ACTIVE') || s.includes('COMPLETED')) {
            return 'bg-surface-container-highest text-on-surface-variant';
        }
        if (s.includes('SUSPENDED') || s.includes('TERMINATED') || s.includes('WITHDRAWN') || s.includes('INVITE')) {
            return 'bg-error-container text-on-error-container';
        }
        return 'bg-surface-container-highest text-on-surface-variant';
    };

    const formatStatusText = (statusStr) => {
        if (!statusStr) return 'UNKNOWN';
        return statusStr.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    };

    const getRelativeTime = (dateString) => {
        if (!dateString) return 'Recently';
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));

            if (diffMins < 60) {
                return diffMins <= 0 ? 'Just now' : `${diffMins}m ago`;
            } else if (diffHours < 24) {
                return `${diffHours}h ago`;
            } else if (diffDays < 30) {
                return `${diffDays}d ago`;
            } else {
                return `${diffMonths}mo ago`;
            }
        } catch (e) {
            return 'Recently';
        }
    };

    const conditions = condition ? condition.split(',').map(c => c.trim()).filter(Boolean) : [];
    const displayTags = [...conditions.slice(0, 2)];
    if (phase && phase !== 'NA' && phase !== 'N/A') {
        let formattedPhase = phase;
        if (phase.toUpperCase().startsWith('PHASE')) {
            const num = phase.slice(5);
            const roman = num === '1' ? 'I' : num === '2' ? 'II' : num === '3' ? 'III' : num === '4' ? 'IV' : num;
            formattedPhase = `Phase ${roman}`;
        }
        displayTags.push(formattedPhase);
    }

    return (
        <div className="bg-surface-container-lowest border border-surface-variant p-lg rounded-lg flex flex-col hover:clinical-shadow transition-all duration-200 group text-left h-full">
            <div className="flex justify-between items-start mb-md">
                <span className={`text-label-md px-sm py-xs rounded uppercase tracking-wider font-semibold ${getStatusStyles(status)}`}>
                    {formatStatusText(status)}
                </span>
                <span className="font-mono-data text-mono-data text-outline select-all">
                    {nct_id || 'NCT--------'}
                </span>
            </div>

            <h4 className="font-headline-md text-headline-md text-primary mb-sm leading-tight group-hover:text-secondary transition-colors duration-150 line-clamp-2">
                {title || 'Untitled Clinical Trial'}
            </h4>

            <div className="flex flex-wrap gap-xs mb-md">
                {displayTags.map((tag, idx) => (
                    <span key={idx} className="bg-surface-container text-on-surface-variant text-label-md px-sm py-xs rounded">
                        {tag}
                    </span>
                ))}
            </div>

            <p className="text-body-sm text-on-surface-variant line-clamp-3 mb-xl flex-grow">
                {shortSummary || 'No summary description available for this record.'}
            </p>

            <div className="mt-auto pt-md border-t border-surface-variant flex justify-between items-center">
                <span className="text-label-md text-outline">
                    Updated: {getRelativeTime(created_at)}
                </span>
                <button className="text-secondary font-label-md text-label-md hover:underline flex items-center gap-xs cursor-pointer">
                    View Details <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1 duration-150">arrow_forward</span>
                </button>
            </div>
        </div>
    );
};

export default TrialCard;