export function LoadingSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-4 animate-pulse">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="h-16 bg-emerald-900/5 rounded-2xl border border-emerald-900/10" />
            ))}
        </div>
    );
}
