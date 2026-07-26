import { ReactNode } from "react";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    badge?: string;
    action?: ReactNode;
}

export function PageHeader({ title, subtitle, badge, action }: PageHeaderProps) {
    return (
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <h1 className="font-serif text-3xl font-bold text-[#1F3A2D] m-0">
                        {title}
                    </h1>
                    {badge && (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 font-mono text-[0.68rem] font-bold text-emerald-800 uppercase tracking-wider">
                            {badge}
                        </span>
                    )}
                </div>
                {subtitle && (
                    <p className="text-emerald-900/60 text-sm m-0">
                        {subtitle}
                    </p>
                )}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}
