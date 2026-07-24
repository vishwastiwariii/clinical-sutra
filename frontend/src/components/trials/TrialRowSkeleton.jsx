import Skeleton from '../ui/Skeleton.jsx';

export default function TrialRowSkeleton() {
  return (
    <div className="grid grid-cols-1 items-center gap-3 border-b border-line px-3 py-6 sm:grid-cols-[150px_1fr_auto] sm:gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="flex flex-col gap-2.5">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-2/5" />
      </div>
      <Skeleton className="h-7 w-28 rounded-pill" />
    </div>
  );
}
