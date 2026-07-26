import { LucideIcon } from "lucide-react";

interface StatCardProps {
    label: string;
    value: string | number;
    subtext?: string;
    icon?: LucideIcon;
    color?: string;
}

export function StatCard({ label, value, subtext, icon: Icon, color = "#1F3A2D" }: StatCardProps) {
    return (
        <div className="p-5 rounded-2xl bg-white border border-emerald-900/10 shadow-sm flex items-center justify-between">
            <div>
                <span className="font-mono text-[0.65rem] font-bold text-emerald-900/50 uppercase tracking-wider block mb-1">
                    {label}
                </span>
                <span className="font-serif text-2xl font-bold block" style={{ color }}>
                    {value}
                </span>
                {subtext && (
                    <span className="text-xs text-emerald-900/50 mt-1 block">
                        {subtext}
                    </span>
                )}
            </div>
            {Icon && (
                <div className="w-11 h-11 rounded-xl bg-emerald-900/5 flex items-center justify-center border border-emerald-900/10 shrink-0">
                    <Icon className="w-5 h-5 text-[#1F3A2D]" />
                </div>
            )}
        </div>
    );
}
