import React from 'react'

const DataCard = ({title, condition, phase, status, shortSummary}) => {

    const getStatusStyles = (status) => {
    const currentStatus = status?.toLowerCase() || '';
    if (currentStatus.includes('active') || currentStatus.includes('recruiting')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (currentStatus.includes('completed')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (currentStatus.includes('suspended') || currentStatus.includes('terminated')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
      return 'bg-slate-50 text-slate-700 border-slate-200';
    };


    return (
    <div className='w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col p-6 text-left'>

        {/* // Top Section // */}
        <div className='flex flex-wrap gap-2 items-center mb-4'>
            {/* Phase Badge */}
            <span className='px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100 uppercase tracking-wide'>
                {phase || 'Phase N/A'}
            </span>

            {/* Status Badge */}
            <span className={`px-2.5 py-1 text-xs font-medium rounded-md border ${getStatusStyles(status)}`}>
                {status || 'Unknown Status'}
            </span>
        </div>


        {/* // Main Section // */}
        <div className='flex-1'>
            <h3 className='text-lg font-bold text-slate-900 leading-snug tracking-tight mb-2 hover:text-indigo-600 transition-colors duration-150'> 
                {title || 'Untitled'}
            </h3>

            {/* //Condition Field */}
            <div className='flex items-baseline gap-1.5 mb-4'> 
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Condition:</span>
                <span className="text-sm font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {condition || 'Not specified'}
                </span>
            </div>

            {/* Divider line */}
            <hr className="border-slate-100 my-3" />

            {/* Short Summary */}
            <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
            {shortSummary || 'No summary description available for this record.'}
            </p>

        </div>


        {/* // Footer Section // */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
            <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors">
            View Details <span>→</span>
            </button>
        </div>    

     </div>
    )
}


export default DataCard